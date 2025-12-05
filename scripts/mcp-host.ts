#!/usr/bin/env node
/**
 * ShepGate MCP Host Service
 *
 * This script runs the MCP server that Claude/other AI hosts connect to.
 * It proxies tool calls through ShepGate's policy and secrets layer.
 *
 * Usage: AGENT_PROFILE_ID=<id> pnpm mcp:host
 *
 * Based on official MCP SDK documentation:
 * https://modelcontextprotocol.io/docs/develop/build-server
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { prisma } from '../src/lib/db.js';
import { PolicyEngine } from '../src/lib/policy.js';

// CRITICAL: Never use console.log() in stdio-based servers - it corrupts JSON-RPC messages
// Use console.error() for logging to stderr

const AGENT_PROFILE_ID = process.env.AGENT_PROFILE_ID;

if (!AGENT_PROFILE_ID) {
  console.error('ERROR: AGENT_PROFILE_ID environment variable is required');
  console.error('Usage: AGENT_PROFILE_ID=<id> pnpm mcp:host');
  process.exit(1);
}

// Initialize MCP server
const server = new Server(
  {
    name: 'shepgate',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

console.error(`ShepGate MCP Host starting for agent: ${AGENT_PROFILE_ID}`);

// List all tools available to this agent based on permissions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  try {
    console.error('Listing tools for agent...');

    // Get agent with their allowed tools
    const agent = await prisma.agentProfile.findUnique({
      where: { id: AGENT_PROFILE_ID },
      include: {
        toolPermissions: {
          where: { allowed: true },
          include: {
            tool: {
              include: {
                server: true,
              },
            },
          },
        },
      },
    });

    if (!agent) {
      console.error(`Agent not found: ${AGENT_PROFILE_ID}`);
      return { tools: [] };
    }

    // Convert allowed tools to MCP tool format
    const tools: Tool[] = agent.toolPermissions.map((permission) => {
      const tool = permission.tool;
      
      // Build inputSchema conforming to MCP SDK requirements
      const schema = tool.inputSchema as Record<string, unknown> | null;
      const inputSchema: {
        type: 'object';
        properties?: { [x: string]: object };
        required?: string[];
        [x: string]: unknown;
      } = {
        type: 'object',
        properties: (schema && typeof schema === 'object' && 'properties' in schema
          ? schema.properties as { [x: string]: object }
          : {}) || {},
        ...(schema && typeof schema === 'object' && 'required' in schema
          ? { required: schema.required as string[] }
          : {}),
      };
      
      return {
        name: tool.name,
        description: tool.description || `Tool from ${tool.server.name}`,
        inputSchema,
      };
    });

    console.error(`Returning ${tools.length} tools`);
    return { tools };
  } catch (error) {
    console.error('Error listing tools:', error);
    return { tools: [] };
  }
});

// Handle tool calls through policy engine
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    console.error(`Tool call requested: ${name}`);

    // Find the tool
    const tool = await prisma.tool.findFirst({
      where: { name },
      include: { server: true },
    });

    if (!tool) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: Tool "${name}" not found`,
          },
        ],
        isError: true,
      };
    }

    // Evaluate through policy engine
    const policyResult = await PolicyEngine.evaluateExecution({
      agentProfileId: AGENT_PROFILE_ID,
      toolId: tool.id,
      argumentsJson: JSON.stringify(args || {}),
    });

    console.error(
      `Policy result: ${policyResult.reason}, allowed: ${policyResult.allowed}`
    );

    // Handle based on policy decision
    if (policyResult.reason === 'blocked_risk') {
      return {
        content: [
          {
            type: 'text',
            text: `Access denied: Tool "${name}" is marked as blocked. Contact your administrator to enable it.`,
          },
        ],
        isError: true,
      };
    }

    if (policyResult.reason === 'blocked_permission') {
      return {
        content: [
          {
            type: 'text',
            text: `Access denied: You do not have permission to use "${name}". Request access from your administrator.`,
          },
        ],
        isError: true,
      };
    }

    if (policyResult.reason === 'needs_approval') {
      return {
        content: [
          {
            type: 'text',
            text: `Approval required: Tool "${name}" requires human approval before execution. Your request has been queued for review. Approval ID: ${policyResult.pendingActionId}`,
          },
        ],
      };
    }

    // Tool is allowed - execute it
    // Note: In MVP, we use mock execution. Real implementation would:
    // 1. Spawn the actual MCP server (e.g., GitHub server)
    // 2. Send the tool call via JSON-RPC
    // 3. Return the real result
    //
    // For now, returning mock execution result as per Smart Friend's MVP recommendation
    const { ToolExecutor } = await import('../src/lib/execution.js');
    const executionResult = await ToolExecutor.executeTool(
      tool.id,
      JSON.stringify(args || {})
    );

    if (!executionResult.success) {
      return {
        content: [
          {
            type: 'text',
            text: `Execution failed: ${executionResult.error}`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(executionResult.result, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error('Error executing tool:', error);
    return {
      content: [
        {
          type: 'text',
          text: `Internal error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('ShepGate MCP Host running on stdio');
    console.error(`Agent ID: ${AGENT_PROFILE_ID}`);
    console.error('Ready to receive tool calls from Claude/AI hosts');
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
