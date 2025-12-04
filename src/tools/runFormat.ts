import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const runFormat = {
  name: "run_format",
  description: "Execute npm run format command",
  schema: {
    cwd: z.string().optional().describe("Working directory (optional)"),
    prettierOptions: z
      .string()
      .describe(
        "Prettier options (e.g., '--check', '--list-different', 'src/specific-file.js')"
      ),
  },
  handler: async ({ cwd, prettierOptions }: { cwd?: string; prettierOptions: string }) => {
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
            type: "text" as const,
            text: stdout || "(no output)",
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: error.message,
          },
        ],
      };
    }
  },
};