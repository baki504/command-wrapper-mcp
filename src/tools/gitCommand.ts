import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const BLOCKED_GIT_COMMANDS = [
  "merge",
  "push",
  "pull",
  "reset",
  "clean",
  "rebase",
  "commit",
  "cherry-pick",
  "revert",
  "rm",
  "mv",
  "tag",
  "branch -d",
  "branch -D",
];

export const gitCommand = {
  name: "git_command",
  description: "Execute git command with --no-pager option",
  schema: {
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
  handler: async ({ cwd, subcommand, options }: { cwd?: string; subcommand: string; options?: string }) => {
    const fullCommand = options ? `${subcommand} ${options}` : subcommand;

    if (
      BLOCKED_GIT_COMMANDS.some((blocked) => fullCommand.startsWith(blocked))
    ) {
      return {
        content: [
          {
            type: "text" as const,
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
        content: [{ type: "text" as const, text: stdout || stderr || "(no output)" }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text" as const, text: error.message }],
      };
    }
  },
};