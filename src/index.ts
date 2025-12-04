import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { runTest } from "./tools/runTest.js";
import { runLint } from "./tools/runLint.js";
import { runFormat } from "./tools/runFormat.js";
import { gitCommand } from "./tools/gitCommand.js";
import { createCustomCommandTool, customCommands } from "./tools/customCommands.js";

const server = new McpServer({
  name: "command-wrapper-mcp",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

server.tool(runTest.name, runTest.description, runTest.schema, runTest.handler);
server.tool(runLint.name, runLint.description, runLint.schema, runLint.handler);
server.tool(runFormat.name, runFormat.description, runFormat.schema, runFormat.handler);
server.tool(gitCommand.name, gitCommand.description, gitCommand.schema, gitCommand.handler);

customCommands.forEach((cmd) => {
  const tool = createCustomCommandTool(cmd);
  server.tool(tool.name, tool.description, tool.schema, tool.handler);
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
