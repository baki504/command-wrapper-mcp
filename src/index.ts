import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const server = new McpServer({
  name: "mcp-poc",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

server.tool(
  "run_test",
  "Execute npm run test command",
  {
    cwd: z.string().optional().describe("Working directory (optional)"),
  },
  async ({ cwd }) => {
    try {
      const options = cwd ? { cwd } : {};
      const { stdout, stderr } = await execAsync("npm run test", options);
      const output = stdout + (stderr ? `\nSTDERR: ${stderr}` : "");
      return {
        content: [
          {
            type: "text",
            text: output || "(no output)",
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "run_lint",
  "Execute npm run lint command",
  {
    cwd: z.string().optional().describe("Working directory (optional)"),
  },
  async ({ cwd }) => {
    try {
      const options = cwd ? { cwd } : {};
      const { stdout, stderr } = await execAsync("npm run lint", options);
      const output = stdout + (stderr ? `\nSTDERR: ${stderr}` : "");
      return {
        content: [
          {
            type: "text",
            text: output || "(no output)",
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "run_format",
  "Execute npm run format command",
  {
    cwd: z.string().optional().describe("Working directory (optional)"),
  },
  async ({ cwd }) => {
    try {
      const options = cwd ? { cwd } : {};
      const { stdout, stderr } = await execAsync("npm run format", options);
      const output = stdout + (stderr ? `\nSTDERR: ${stderr}` : "");
      return {
        content: [
          {
            type: "text",
            text: output || "(no output)",
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error}`,
          },
        ],
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("POC MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
