import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// Mock tool discovery for different server types
// In production, this would actually spawn MCP servers or query HTTP APIs
function discoverMCPTools(serverName: string): Array<{ name: string; description: string; inputSchema: object }> {
  // Simulated MCP tool discovery based on server name patterns
  const mockTools: Record<string, Array<{ name: string; description: string; inputSchema: object }>> = {
    github: [
      { name: 'github_list_repos', description: 'List repositories for a user or organization', inputSchema: { type: 'object', properties: { owner: { type: 'string' } } } },
      { name: 'github_get_repo', description: 'Get repository details', inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' } } } },
      { name: 'github_create_issue', description: 'Create a new issue in a repository', inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, title: { type: 'string' }, body: { type: 'string' } } } },
      { name: 'github_list_issues', description: 'List issues in a repository', inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' } } } },
      { name: 'github_create_pull_request', description: 'Create a pull request', inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, title: { type: 'string' }, head: { type: 'string' }, base: { type: 'string' } } } },
    ],
    filesystem: [
      { name: 'fs_read_file', description: 'Read contents of a file', inputSchema: { type: 'object', properties: { path: { type: 'string' } } } },
      { name: 'fs_write_file', description: 'Write contents to a file', inputSchema: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } } } },
      { name: 'fs_list_directory', description: 'List files in a directory', inputSchema: { type: 'object', properties: { path: { type: 'string' } } } },
      { name: 'fs_delete_file', description: 'Delete a file', inputSchema: { type: 'object', properties: { path: { type: 'string' } } } },
      { name: 'fs_create_directory', description: 'Create a new directory', inputSchema: { type: 'object', properties: { path: { type: 'string' } } } },
    ],
    postgres: [
      { name: 'pg_query', description: 'Execute a SQL query', inputSchema: { type: 'object', properties: { query: { type: 'string' } } } },
      { name: 'pg_list_tables', description: 'List all tables in the database', inputSchema: { type: 'object', properties: {} } },
      { name: 'pg_describe_table', description: 'Get table schema', inputSchema: { type: 'object', properties: { table: { type: 'string' } } } },
    ],
  };

  // Try to match server name to a known type
  const lowerName = serverName.toLowerCase();
  for (const [key, tools] of Object.entries(mockTools)) {
    if (lowerName.includes(key)) {
      return tools;
    }
  }

  // Default generic tools for unknown servers
  return [
    { name: 'generic_call', description: 'Make a generic call to the server', inputSchema: { type: 'object', properties: { action: { type: 'string' }, params: { type: 'object' } } } },
  ];
}

function discoverHTTPTools(baseUrl: string): Array<{ name: string; description: string; inputSchema: object }> {
  // For HTTP APIs, we would typically parse OpenAPI/Swagger specs
  // For now, return placeholder tools
  return [
    { name: 'http_get', description: `GET request to ${baseUrl}`, inputSchema: { type: 'object', properties: { endpoint: { type: 'string' }, params: { type: 'object' } } } },
    { name: 'http_post', description: `POST request to ${baseUrl}`, inputSchema: { type: 'object', properties: { endpoint: { type: 'string' }, body: { type: 'object' } } } },
  ];
}

// POST /api/servers/[id]/sync - Sync/discover tools from a server
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get server
    const server = await prisma.server.findUnique({ where: { id } });
    if (!server) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }

    // Discover tools based on server type
    let discoveredTools: Array<{ name: string; description: string; inputSchema: object }>;
    
    if (server.type === 'mcp') {
      discoveredTools = discoverMCPTools(server.name);
    } else {
      discoveredTools = discoverHTTPTools(server.baseUrl || '');
    }

    // Get existing tools for this server
    const existingTools = await prisma.tool.findMany({
      where: { serverId: id },
      select: { name: true },
    });
    const existingNames = new Set(existingTools.map(t => t.name));

    // Create new tools (skip existing ones)
    const newTools = discoveredTools.filter(t => !existingNames.has(t.name));
    
    if (newTools.length > 0) {
      await prisma.tool.createMany({
        data: newTools.map(tool => ({
          serverId: id,
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
          riskLevel: 'needs_approval', // Default to needs approval for safety
        })),
      });

      // Get all agents to create permissions for new tools
      const allAgents = await prisma.agentProfile.findMany({
        select: { id: true },
      });

      // Create permissions for all agents for the new tools
      if (allAgents.length > 0) {
        // Get the created tools with their IDs
        const createdToolNames = newTools.map(t => t.name);
        const toolsWithIds = await prisma.tool.findMany({
          where: {
            serverId: id,
            name: { in: createdToolNames },
          },
          select: { id: true, name: true },
        });

        const permissionsToCreate = [];
        for (const agent of allAgents) {
          for (const tool of toolsWithIds) {
            permissionsToCreate.push({
              agentProfileId: agent.id,
              toolId: tool.id,
              allowed: false, // Default to blocked for safety
            });
          }
        }

        if (permissionsToCreate.length > 0) {
          await prisma.toolPermission.createMany({
            data: permissionsToCreate,
            skipDuplicates: true,
          });
        }
      }
    }

    // Fetch all tools after sync
    const allTools = await prisma.tool.findMany({
      where: { serverId: id },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      message: `Synced ${newTools.length} new tools`,
      newCount: newTools.length,
      totalCount: allTools.length,
      tools: allTools,
    });
  } catch (error) {
    console.error('=== SYNC ERROR DEBUG ===');
    console.error('Error type:', typeof error);
    console.error('Error name:', error instanceof Error ? error.name : 'N/A');
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'N/A');
    console.error('Full error:', error);
    console.error('=== END SYNC ERROR DEBUG ===');
    return NextResponse.json(
      { error: 'Failed to sync tools', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
