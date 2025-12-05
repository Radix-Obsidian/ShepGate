# Claude Desktop Integration

This guide explains how to connect Claude Desktop to ShepGate.

## Overview

ShepGate acts as an MCP (Model Context Protocol) server that sits between Claude Desktop and your external tools. When Claude wants to use a tool, ShepGate:

1. Checks if the agent has permission
2. Evaluates the tool's risk level
3. Either executes immediately, queues for approval, or blocks

## Prerequisites

- ShepGate running (`pnpm dev`)
- Claude Desktop installed
- At least one agent profile created in ShepGate

## Setup Steps

### 1. Get Your Agent Profile ID

1. Open ShepGate dashboard (http://localhost:3000)
2. Go to **Agents** page
3. Click on your agent
4. Copy the agent ID from the URL (e.g., `cmis63c8x0001fjx8nt1mi3ic`)

### 2. Create the Launcher Script

The launcher script is created automatically at `scripts/claude-launcher.bat`.

Edit it to include your agent ID and database URL:

```batch
@echo off
set AGENT_PROFILE_ID=your-agent-id-here
set DATABASE_URL=your-database-url-here
cd /d "C:\path\to\shepgate"
npx tsx scripts/mcp-host.ts
```

### 3. Configure Claude Desktop

Open Claude Desktop's config file:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

Add ShepGate as an MCP server:

```json
{
  "mcpServers": {
    "shepgate": {
      "command": "cmd",
      "args": ["/c", "C:\\path\\to\\shepgate\\scripts\\claude-launcher.bat"]
    }
  }
}
```

### 4. Restart Claude Desktop

Completely close and reopen Claude Desktop.

### 5. Verify Connection

1. Open Claude Desktop Settings → Developer
2. You should see "shepgate" listed with a green "Running" status
3. Ask Claude: "What tools do you have available?"

## How It Works

### Tool Discovery

When Claude lists tools, ShepGate returns only the tools that:
- The agent has permission to access (`allowed: true`)

### Tool Execution

When Claude calls a tool, ShepGate:

1. **Safe tools** → Execute immediately, log to activity
2. **Needs approval** → Create pending action, return approval ID
3. **Blocked tools** → Deny with explanation, log to activity

### Approval Flow

For `needs_approval` tools:

1. Claude shows: "Approval required... Approval ID: xxx"
2. Go to ShepGate → Approvals page
3. Review the request and click Approve or Deny
4. If approved, the tool executes

## Troubleshooting

### "No servers added" in Claude Developer Settings

- Check config file syntax (valid JSON)
- Verify file path in config is correct
- Restart Claude Desktop completely

### ShepGate not receiving requests

- Check that MCP host script runs manually
- Verify AGENT_PROFILE_ID is set correctly
- Check DATABASE_URL is correct

### Tools not appearing

- Verify agent has tool permissions (Grant All in agent settings)
- Check that tools exist in the server

---

Need help? [Open an issue](https://github.com/golden-sheep-ai/shepgate/issues)
