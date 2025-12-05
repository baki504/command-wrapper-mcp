import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const server = new McpServer({
  name: "command-wrapper-mcp",
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
      .describe(
        "Jest options (e.g., '--watch', '--coverage', '--testPathPattern=string.test.js')"
      ),
  },
  async ({ cwd, jestOptions }) => {
    try {
      const options = cwd ? { cwd } : {};
      const command = `npm run test -- ${jestOptions}`;
      const { stdout, stderr } = await execAsync(command, options);
      return {
        content: [
          {
            type: "text",
            text: `${stdout}\n${stderr}` || "(no output)",
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: error.message,
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
      .describe(
        "ESLint options (e.g., '--fix', '--quiet', 'src/specific-file.js')"
      ),
  },
  async ({ cwd, eslintOptions }) => {
    try {
      const options = cwd ? { cwd } : {};
      const command = `npm run lint -- ${eslintOptions}`;
      const { stdout } = await execAsync(command, options);
      return {
        content: [
          {
            type: "text",
            text: stdout || "(no output)",
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: error.message,
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
      .describe(
        "Prettier options (e.g., '--check', '--list-different', 'src/specific-file.js')"
      ),
  },
  async ({ cwd, prettierOptions }) => {
    try {
      const options = cwd ? { cwd } : {};
      const finalOptions = prettierOptions.includes("--write")
        ? prettierOptions
        : `--write ${prettierOptions}`;
      const command = `npm run format -- ${finalOptions}`;
      const { stdout } = await execAsync(command, options);
      return {
        content: [
          {
            type: "text",
            text: stdout || "(no output)",
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: error.message,
          },
        ],
      };
    }
  }
);

// ※取扱注意
const BLOCKED_GIT_COMMANDS = [
  // === リスク高
  // "push",
  // "pull",
  // "merge",
  // "rebase",
  // === リスク中
  // "add",
  // "commit",
  // "tag",
  // "branch -d",
  // "branch -D",
  // "revert",
  // "checkout",
  // "switch",
  // "cherry-pick",
  // === リスク低
  "reset",
  "clean",
  "rm",
  "mv",
  "log",
];

server.tool(
  "git_command",
  "Execute git command with --no-pager option",
  {
    cwd: z.string().optional().describe("Working directory (optional)"),
    subcommand: z
      .string()
      .describe("Git subcommand (e.g., 'diff', 'log', 'status', 'branch')"),
    options: z
      .string()
      .optional()
      .describe(
        "Git command options (e.g., 'main', 'HEAD~1', '--cached', '-a')"
      ),
  },
  async ({ cwd, subcommand, options }) => {
    const fullCommand = options ? `${subcommand} ${options}` : subcommand;

    if (
      BLOCKED_GIT_COMMANDS.some((blocked) => fullCommand.startsWith(blocked))
    ) {
      return {
        content: [
          {
            type: "text",
            text: `⚠️ Command 'git ${fullCommand}' is blocked for safety.\nBlocked commands: ${BLOCKED_GIT_COMMANDS.join(", ")}\nPlease execute manually if needed.`,
          },
        ],
      };
    }

    try {
      const execOptions = cwd
        ? { cwd, maxBuffer: 10 * 1024 * 1024 }
        : { maxBuffer: 10 * 1024 * 1024 };
      const command = options
        ? `git --no-pager ${subcommand} ${options}`
        : `git --no-pager ${subcommand}`;
      const { stdout, stderr } = await execAsync(command, execOptions);
      return {
        content: [{ type: "text", text: stdout || stderr || "(no output)" }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: error.message }],
      };
    }
  }
);

/**

カスタムルール定義 **/
type CustomCommand = { name: string; description: string; command: string };
const customCommands: CustomCommand[] = [
  // カスタムコマンドをここに追加
  {
    name: "list_directory",
    description: "List directory contents",
    command: "dir",
  },
  {
    name: "make_directory",
    description: "Make directory contents",
    command: "mkdir",
  },
  {
    name: "check_node_version",
    description: "Check Node.js version",
    command: "node --version",
  },
];

customCommands.forEach((cmd: CustomCommand) => {
  server.tool(
    cmd.name,
    cmd.description,
    {
      cwd: z.string().optional().describe("Working directory (optional)"),
      options: z.string().optional().describe("Command options"),
    },
    async ({ cwd, options }) => {
      try {
        const execOptions = cwd
          ? { cwd, maxBuffer: 10 * 1024 * 1024 }
          : { maxBuffer: 10 * 1024 * 1024 };
        const command = options ? `${cmd.command} ${options}` : cmd.command;
        const { stdout, stderr } = await execAsync(command, execOptions);
        return {
          content: [{ type: "text", text: stdout || stderr || "(no output)" }],
        };
      } catch (error: any) {
        return {
          content: [{ type: "text", text: error.message }],
        };
      }
    }
  );
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
