import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const runTest = {
  name: "run_test",
  description: "Execute npm run test command",
  schema: {
    cwd: z.string().optional().describe("Working directory (optional)"),
    jestOptions: z
      .string()
      .describe(
        "Jest options (e.g., '--watch', '--coverage', '--testPathPattern=string.test.js')"
      ),
  },
  handler: async ({ cwd, jestOptions }: { cwd?: string; jestOptions: string }) => {
    try {
      const options = cwd ? { cwd } : {};
      const command = `npm run test -- ${jestOptions}`;
      const { stdout, stderr } = await execAsync(command, options);
      return {
        content: [
          {
            type: "text" as const,
            text: `${stdout}\n${stderr}` || "(no output)",
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