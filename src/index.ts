import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ToolDefinition } from "./types/Tool.js";
import { runTest } from "./tools/runTest.js";
import { runLint } from "./tools/runLint.js";
import { runFormat } from "./tools/runFormat.js";
import { gitCommand } from "./tools/gitCommand.js";
import {
  createCustomCommandTool,
  customCommands,
} from "./tools/customCommands.js";

const server = new McpServer({
  name: "command-wrapper-mcp",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

const registerTool = (tool: ToolDefinition) => {
  server.tool(tool.name, tool.description, tool.schema, tool.handler);
};

[runTest, runLint, runFormat, gitCommand].forEach(registerTool);

customCommands.forEach((cmd) => {
  registerTool(createCustomCommandTool(cmd));
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("POC MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
