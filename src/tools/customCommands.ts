import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

type CustomCommand = { name: string; description: string; command: string };

const customCommands: CustomCommand[] = [
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

export const createCustomCommandTool = (cmd: CustomCommand) => ({
  name: cmd.name,
  description: cmd.description,
  schema: {
    cwd: z.string().optional().describe("Working directory (optional)"),
    options: z.string().optional().describe("Command options"),
  },
  handler: async ({ cwd, options }: { cwd?: string; options?: string }) => {
    try {
      const execOptions = cwd
        ? { cwd, maxBuffer: 10 * 1024 * 1024 }
        : { maxBuffer: 10 * 1024 * 1024 };
      const command = options ? `${cmd.command} ${options}` : cmd.command;
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
});

export { customCommands };