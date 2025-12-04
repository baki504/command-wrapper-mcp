import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import { ToolDefinition } from "../types/Tool.js";

const execAsync = promisify(exec);

export const runLint: ToolDefinition = {
  name: "run_lint",
  description: "Execute npm run lint command",
  schema: {
    cwd: z.string().optional().describe("Working directory (optional)"),
    eslintOptions: z
      .string()
      .describe(
        "ESLint options (e.g., '--fix', '--quiet', 'src/specific-file.js')"
      ),
  },
  handler: async ({ cwd, eslintOptions }) => {
    try {
      const options = cwd ? { cwd } : {};
      const command = `npm run lint -- ${eslintOptions}`;
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