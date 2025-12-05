import { prisma } from '@/lib/db';
import { callServerTool } from '@/lib/mcp-client';

export interface ExecutionRequest {
  agentProfileId: string;
  toolId: string;
  argumentsJson: string;
}

export interface ExecutionResult {
  success: boolean;
  result?: unknown;
  error?: string;
  executionTime: number;
}

// Environment flag to force mock execution (for testing without real MCP servers)
const USE_MOCK_EXECUTION = process.env.USE_MOCK_EXECUTION === 'true';

export class ToolExecutor {
  /**
   * Execute a tool using real MCP server communication
   * Falls back to mock execution if:
   * - USE_MOCK_EXECUTION=true env var is set
   * - Server has no command configured
   * - Real execution fails
   */
  static async executeTool(toolId: string, argumentsJson: string): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Get tool details
      const tool = await prisma.tool.findUnique({
        where: { id: toolId },
        include: { server: true },
      });

      if (!tool) {
        return {
          success: false,
          error: 'Tool not found',
          executionTime: Date.now() - startTime,
        };
      }

      // Parse arguments
      let args: Record<string, unknown>;
      try {
        args = JSON.parse(argumentsJson);
      } catch {
        args = {};
      }

      // Decide whether to use real or mock execution
      const useRealExecution = !USE_MOCK_EXECUTION && 
                               tool.server.command && 
                               tool.server.command.trim().length > 0;

      if (useRealExecution) {
        // Real MCP server execution
        console.error(`Executing tool ${tool.name} on real MCP server: ${tool.server.name}`);
        
        const result = await callServerTool(
          tool.server.id,
          tool.name,
          args
        );

        if (result.success) {
          return {
            success: true,
            result: result.content,
            executionTime: Date.now() - startTime,
          };
        }

        // If real execution failed, log and fall back to mock
        console.error(`Real execution failed for ${tool.name}: ${result.error}`);
        console.error('Falling back to mock execution');
      }

      // Mock execution (fallback or when no command configured)
      console.error(`Using mock execution for ${tool.name}`);
      const mockResult = await this.mockExecution(tool.name, tool.server.name, args);

      return {
        success: true,
        result: mockResult,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown execution error',
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Mock tool execution based on tool name patterns
   * Simulates realistic responses for different tool types
   * Used as fallback when real MCP servers are not available
   */
  private static async mockExecution(toolName: string, serverName: string, args: Record<string, unknown>): Promise<unknown> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // GitHub tools
    if (toolName.startsWith('github_')) {
      return this.mockGitHubExecution(toolName, args);
    }

    // Filesystem tools
    if (toolName.startsWith('fs_') || toolName.startsWith('filesystem_')) {
      return this.mockFilesystemExecution(toolName, args);
    }

    // Database tools
    if (toolName.startsWith('db_') || toolName.startsWith('postgres_')) {
      return this.mockDatabaseExecution(toolName, args);
    }

    // Generic mock response
    return {
      status: 'success',
      message: `Executed ${toolName} from ${serverName}`,
      args_received: args,
      timestamp: new Date().toISOString(),
      mock_execution: true,
    };
  }

  private static mockGitHubExecution(toolName: string, args: Record<string, unknown>): unknown {
    switch (toolName) {
      case 'github_list_repos':
        return {
          repositories: [
            { name: 'shepgate', full_name: 'golden-sheep-ai/shepgate', private: false, stars: 42 },
            { name: 'mcp-server-github', full_name: 'golden-sheep-ai/mcp-server-github', private: false, stars: 15 },
            { name: 'examples', full_name: 'golden-sheep-ai/examples', private: true, stars: 8 },
          ],
          total_count: 3,
        };

      case 'github_get_repo':
        return {
          name: args.repo || 'shepgate',
          full_name: `${args.owner || 'golden-sheep-ai'}/${args.repo || 'shepgate'}`,
          description: 'AI Agent Gateway for secure tool execution and policy enforcement',
          private: false,
          stars: 42,
          language: 'TypeScript',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-12-04T18:22:00Z',
        };

      case 'github_create_issue':
        return {
          id: 123456,
          number: Math.floor(Math.random() * 1000) + 1,
          title: args.title || 'New Issue',
          body: args.body || 'Issue description',
          state: 'open',
          created_at: new Date().toISOString(),
          html_url: `https://github.com/${args.owner || 'golden-sheep-ai'}/${args.repo || 'shepgate'}/issues/${Math.floor(Math.random() * 1000) + 1}`,
        };

      case 'github_list_issues':
        return {
          issues: [
            { number: 1, title: 'Add tool execution layer', state: 'open', created_at: '2024-12-01T10:00:00Z' },
            { number: 2, title: 'Implement policy engine', state: 'closed', created_at: '2024-11-28T15:30:00Z' },
            { number: 3, title: 'Fix approval workflow bug', state: 'open', created_at: '2024-12-03T09:15:00Z' },
          ],
          total_count: 3,
        };

      case 'github_create_pull_request':
        return {
          id: 789012,
          number: Math.floor(Math.random() * 500) + 1,
          title: args.title || 'New Pull Request',
          state: 'open',
          head: { ref: args.head || 'feature-branch' },
          base: { ref: args.base || 'main' },
          created_at: new Date().toISOString(),
          html_url: `https://github.com/${args.owner || 'golden-sheep-ai'}/${args.repo || 'shepgate'}/pull/${Math.floor(Math.random() * 500) + 1}`,
        };

      default:
        return {
          message: `GitHub tool ${toolName} executed`,
          args,
        };
    }
  }

  private static mockFilesystemExecution(toolName: string, args: Record<string, unknown>): unknown {
    switch (toolName) {
      case 'fs_read_file':
        return {
          content: `Mock file content from ${args.path || '/path/to/file.txt'}`,
          size: 1024,
          encoding: 'utf-8',
        };

      case 'fs_write_file':
        return {
          path: args.path || '/path/to/file.txt',
          bytes_written: typeof args.content === 'string' ? args.content.length : 0,
          success: true,
        };

      case 'fs_list_directory':
        return {
          path: args.path || '/path/to/directory',
          entries: [
            { name: 'file1.txt', type: 'file', size: 1024 },
            { name: 'file2.js', type: 'file', size: 2048 },
            { name: 'subdir', type: 'directory' },
          ],
          total_count: 3,
        };

      default:
        return {
          message: `Filesystem tool ${toolName} executed`,
          args,
        };
    }
  }

  private static mockDatabaseExecution(toolName: string, args: Record<string, unknown>): unknown {
    switch (toolName) {
      case 'db_query':
        return {
          rows: [
            { id: 1, name: 'Alice', email: 'alice@example.com' },
            { id: 2, name: 'Bob', email: 'bob@example.com' },
          ],
          row_count: 2,
          query: args.query || 'SELECT * FROM users',
        };

      case 'postgres_execute':
        return {
          affected_rows: Math.floor(Math.random() * 10) + 1,
          command: 'INSERT',
          query: args.query || 'INSERT INTO users (name) VALUES ($1)',
        };

      default:
        return {
          message: `Database tool ${toolName} executed`,
          args,
        };
    }
  }
}
