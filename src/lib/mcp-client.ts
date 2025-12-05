/**
 * ShepGate MCP Client Manager
 *
 * Manages connections to MCP servers, spawning them as subprocesses
 * and communicating via stdio transport.
 *
 * Based on official MCP SDK documentation:
 * https://modelcontextprotocol.io/tutorials/building-a-client-node
 * https://github.com/modelcontextprotocol/typescript-sdk
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { prisma } from '@/lib/db';
import { getSecretsAsEnv } from '@/lib/secrets';

// Connection pool to reuse MCP server connections
const connectionPool: Map<string, {
  client: Client;
  transport: StdioClientTransport;
  lastUsed: Date;
}> = new Map();

// Connection timeout (5 minutes of inactivity)
const CONNECTION_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Parse server command string into executable parts
 */
function parseCommand(command: string): { executable: string; args: string[] } {
  const parts = command.trim().split(/\s+/);
  const executable = parts[0];
  const args = parts.slice(1);
  return { executable, args };
}

/**
 * Get or create a client connection to an MCP server
 */
export async function getServerConnection(serverId: string): Promise<Client | null> {
  // Check if we have an active connection
  const existing = connectionPool.get(serverId);
  if (existing) {
    existing.lastUsed = new Date();
    return existing.client;
  }

  // Get server details from database
  const server = await prisma.server.findUnique({
    where: { id: serverId },
  });

  if (!server) {
    console.error(`Server not found: ${serverId}`);
    return null;
  }

  if (!server.command) {
    console.error(`Server ${server.name} has no command configured`);
    return null;
  }

  try {
    // Parse the command
    const { executable, args } = parseCommand(server.command);

    // Get secrets to inject as environment variables
    // Common secret names that might be needed
    const commonSecretNames = [
      'GITHUB_TOKEN',
      'GITHUB_PERSONAL_ACCESS_TOKEN',
      'DATABASE_URL',
      'POSTGRES_URL',
      'SLACK_BOT_TOKEN',
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY',
    ];
    
    const secrets = await getSecretsAsEnv(commonSecretNames);

    // Build environment variables, filtering out undefined values
    const envVars: Record<string, string> = {};
    for (const [key, value] of Object.entries(process.env)) {
      if (value !== undefined) {
        envVars[key] = value;
      }
    }
    
    // Create the transport with command and environment
    const transport = new StdioClientTransport({
      command: executable,
      args,
      env: {
        ...envVars,
        ...secrets,
      },
    });

    // Create the client
    const client = new Client({
      name: 'shepgate',
      version: '0.1.0',
    });

    // Connect to the server
    await client.connect(transport);

    // Store in pool
    connectionPool.set(serverId, {
      client,
      transport,
      lastUsed: new Date(),
    });

    console.error(`Connected to MCP server: ${server.name}`);
    return client;
  } catch (error) {
    console.error(`Failed to connect to MCP server ${server.name}:`, error);
    return null;
  }
}

/**
 * Close a server connection
 */
export async function closeServerConnection(serverId: string): Promise<void> {
  const connection = connectionPool.get(serverId);
  if (connection) {
    try {
      await connection.client.close();
      connectionPool.delete(serverId);
      console.error(`Closed connection to server: ${serverId}`);
    } catch (error) {
      console.error(`Error closing connection to server ${serverId}:`, error);
    }
  }
}

/**
 * Close all server connections
 */
export async function closeAllConnections(): Promise<void> {
  for (const [serverId] of connectionPool) {
    await closeServerConnection(serverId);
  }
}

/**
 * List tools available from a server
 */
export async function listServerTools(serverId: string): Promise<{
  name: string;
  description?: string;
  inputSchema?: object;
}[]> {
  const client = await getServerConnection(serverId);
  if (!client) {
    return [];
  }

  try {
    const result = await client.listTools();
    return result.tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema as object | undefined,
    }));
  } catch (error) {
    console.error(`Error listing tools from server ${serverId}:`, error);
    return [];
  }
}

/**
 * Call a tool on a server
 */
export async function callServerTool(
  serverId: string,
  toolName: string,
  args: Record<string, unknown>
): Promise<{
  success: boolean;
  content?: unknown;
  error?: string;
}> {
  const client = await getServerConnection(serverId);
  if (!client) {
    return {
      success: false,
      error: 'Failed to connect to MCP server',
    };
  }

  try {
    const result = await client.callTool({
      name: toolName,
      arguments: args,
    });

    // Extract content from result
    const content = result.content;

    return {
      success: true,
      content,
    };
  } catch (error) {
    console.error(`Error calling tool ${toolName} on server ${serverId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Cleanup stale connections periodically
 */
export function startConnectionCleanup(): NodeJS.Timeout {
  return setInterval(() => {
    const now = new Date();
    for (const [serverId, connection] of connectionPool) {
      const age = now.getTime() - connection.lastUsed.getTime();
      if (age > CONNECTION_TIMEOUT_MS) {
        console.error(`Closing stale connection to server: ${serverId}`);
        closeServerConnection(serverId);
      }
    }
  }, 60 * 1000); // Check every minute
}

/**
 * Get connection pool status for debugging
 */
export function getConnectionPoolStatus(): {
  serverId: string;
  lastUsed: Date;
}[] {
  return Array.from(connectionPool.entries()).map(([serverId, conn]) => ({
    serverId,
    lastUsed: conn.lastUsed,
  }));
}
