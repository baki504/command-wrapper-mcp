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
    jestOptions: z
      .string()
      .optional()
      .describe(
        "Jest options (e.g., '--watch', '--coverage', '--testPathPattern=string.test.js')"
      ),
  },
  async ({ cwd, jestOptions }) => {
    try {
      const options = cwd ? { cwd } : {};
      const command = jestOptions
        ? `npm run test -- ${jestOptions}`
        : "npm run test";
      const { stdout, stderr } = await execAsync(command, options);
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
    eslintOptions: z
      .string()
      .optional()
      .describe(
        "ESLint options (e.g., '--fix', '--quiet', 'src/specific-file.js')"
      ),
  },
  async ({ cwd, eslintOptions }) => {
    try {
      const options = cwd ? { cwd } : {};
      const command = eslintOptions
        ? `npm run lint -- ${eslintOptions}`
        : "npm run lint";
      const { stdout, stderr } = await execAsync(command, options);
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
    prettierOptions: z
      .string()
      .optional()
      .describe(
        "Prettier options (e.g., '--check', '--list-different', 'src/specific-file.js')"
      ),
  },
  async ({ cwd, prettierOptions }) => {
    try {
      const options = cwd ? { cwd } : {};
      const command = prettierOptions
        ? `npm run format -- ${prettierOptions}`
        : "npm run format";
      const { stdout, stderr } = await execAsync(command, options);
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
