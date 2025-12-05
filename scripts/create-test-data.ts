/**
 * Creates test data to exercise all ShepGate features
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test data...\n');

  // 1. Create a test server
  const server = await prisma.server.upsert({
    where: { id: 'test-server-001' },
    update: {},
    create: {
      id: 'test-server-001',
      name: 'Test GitHub Server',
      type: 'mcp',
      command: 'npx -y @modelcontextprotocol/server-github',
      description: 'Test server for GitHub integration',
    },
  });
  console.log(`✅ Server: ${server.name} (${server.id})`);

  // 2. Create tools with different risk levels
  const safeTool = await prisma.tool.upsert({
    where: { serverId_name: { serverId: server.id, name: 'github_list_repos' } },
    update: { riskLevel: 'safe' },
    create: {
      serverId: server.id,
      name: 'github_list_repos',
      description: 'List repositories (safe - read only)',
      inputSchema: { type: 'object', properties: {} },
      riskLevel: 'safe',
    },
  });
  console.log(`✅ Safe Tool: ${safeTool.name} (${safeTool.id})`);

  const approvalTool = await prisma.tool.upsert({
    where: { serverId_name: { serverId: server.id, name: 'github_create_issue' } },
    update: { riskLevel: 'needs_approval' },
    create: {
      serverId: server.id,
      name: 'github_create_issue',
      description: 'Create an issue (needs approval - writes data)',
      inputSchema: { 
        type: 'object', 
        properties: { 
          title: { type: 'string' },
          body: { type: 'string' }
        } 
      },
      riskLevel: 'needs_approval',
    },
  });
  console.log(`✅ Approval Tool: ${approvalTool.name} (${approvalTool.id})`);

  const blockedTool = await prisma.tool.upsert({
    where: { serverId_name: { serverId: server.id, name: 'github_delete_repo' } },
    update: { riskLevel: 'blocked' },
    create: {
      serverId: server.id,
      name: 'github_delete_repo',
      description: 'Delete a repository (blocked - dangerous)',
      inputSchema: { type: 'object', properties: { repo: { type: 'string' } } },
      riskLevel: 'blocked',
    },
  });
  console.log(`✅ Blocked Tool: ${blockedTool.name} (${blockedTool.id})`);

  // 3. Get the default agent
  const agent = await prisma.agentProfile.findFirst({
    where: { name: 'Default Agent' },
  });

  if (!agent) {
    console.error('❌ Default Agent not found!');
    return;
  }
  console.log(`✅ Agent: ${agent.name} (${agent.id})`);

  // 4. Create tool permissions for the agent
  for (const tool of [safeTool, approvalTool, blockedTool]) {
    await prisma.toolPermission.upsert({
      where: { agentProfileId_toolId: { agentProfileId: agent.id, toolId: tool.id } },
      update: { allowed: true },
      create: {
        agentProfileId: agent.id,
        toolId: tool.id,
        allowed: true,
      },
    });
  }
  console.log(`✅ Permissions granted for all 3 tools`);

  // Print test commands
  console.log('\n' + '='.repeat(60));
  console.log('TEST COMMANDS - Copy and run these:\n');

  console.log('1️⃣  TEST SAFE TOOL (should execute immediately):');
  console.log(`curl -X POST http://localhost:3000/api/execute -H "Content-Type: application/json" -d "{\\"agentProfileId\\": \\"${agent.id}\\", \\"toolId\\": \\"${safeTool.id}\\", \\"argumentsJson\\": \\"{}\\"}"\n`);

  console.log('2️⃣  TEST NEEDS_APPROVAL TOOL (should queue for approval):');
  console.log(`curl -X POST http://localhost:3000/api/execute -H "Content-Type: application/json" -d "{\\"agentProfileId\\": \\"${agent.id}\\", \\"toolId\\": \\"${approvalTool.id}\\", \\"argumentsJson\\": \\"{\\\\\\"title\\\\\\": \\\\\\"Test Issue\\\\\\"}\\"}"\n`);

  console.log('3️⃣  TEST BLOCKED TOOL (should be denied):');
  console.log(`curl -X POST http://localhost:3000/api/execute -H "Content-Type: application/json" -d "{\\"agentProfileId\\": \\"${agent.id}\\", \\"toolId\\": \\"${blockedTool.id}\\", \\"argumentsJson\\": \\"{}\\"}"\n`);

  console.log('='.repeat(60));
  console.log('After running these, check:');
  console.log('- Activity page: http://localhost:3000/activity');
  console.log('- Approvals page: http://localhost:3000/approvals');
  console.log('='.repeat(60));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
