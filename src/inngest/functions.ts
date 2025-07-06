import {
  Agent,
  createAgent,
  createTool,
  createNetwork,
  openai,
} from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { z } from "zod";

import { PROMPT } from "@/prompt";

import { getSandbox, lastAssistantTextMessageContent } from "./utils";

import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      try {
        const sandbox = await Sandbox.create("alora-nextjs-test-3");
        return sandbox.sandboxId;
      } catch (e) {
        console.error(`Failed to create sandbox: ${e}`);
        throw new Error(`Failed to create sandbox: ${e}`);
      }
    });

    const codeAgent = createAgent({
      name: "code-agent",
      description:
        "You are an expert coding agent that creates web applications",
      system: PROMPT,

      model: openai({
        model: "gpt-4.1",
        defaultParameters: { temperature: 0.1 },
      }),

      tools: [
        createTool({
          name: "terminal",
          description:
            "Execute shell commands in the sandbox environment. Use this to run npm install, build commands, or any terminal operations needed for the project.",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            console.log("Terminal tool called with command:", command);
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };

              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  },
                });
                const output = result.stdout || buffers.stdout;
                console.log("Terminal command output:", output);
                return output;
              } catch (e) {
                console.error(
                  `Command failed: ${e} \nstdout: ${buffers.stdout} \nstderr: ${buffers.stderr}`
                );
                return `Command failed: ${e} \nstdout: ${buffers.stdout} \nstderr: ${buffers.stderr}`;
              }
            });
          },
        }),

        createTool({
          name: "createOrUpdateFiles",
          description:
            "Create new files or update existing files in the sandbox. Use this tool whenever you need to write code, create components, or modify any files in the project.",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
          handler: async ({ files }, { step, network }) => {
            console.log(
              "createOrUpdateFiles tool called with files:",
              files.map((f) => f.path)
            );
            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  // Ensure network state exists
                  if (!network.state.data) {
                    network.state.data = {};
                  }
                  const updatedFiles = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId);

                  for (const file of files) {
                    console.log(`Writing file: ${file.path}`);
                    await sandbox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }

                  console.log("Files written successfully");
                  return updatedFiles;
                } catch (e) {
                  console.error(`File operation failed: ${e}`);
                  throw new Error(`File operation failed: ${e}`);
                }
              }
            );
            if (typeof newFiles === "object" && newFiles !== null) {
              network.state.data.files = newFiles;
            }
            return "Files created/updated successfully";
          },
        }),

        createTool({
          name: "readFiles",
          description:
            "Read the contents of existing files in the sandbox. Use this to examine current code, check file structure, or understand the existing implementation.",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            console.log("readFiles tool called with files:", files);
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const fileContents = [];

                for (const file of files) {
                  console.log(`Reading file: ${file}`);
                  const content = await sandbox.files.read(file);
                  fileContents.push({ path: file, content });
                }

                console.log("Files read successfully");
                return fileContents;
              } catch (e) {
                console.error(`File read failed: ${e}`);
                throw new Error(`File read failed: ${e}`);
              }
            });
          },
        }),
      ],

      lifecycle: {
        onResponse: async ({ result, network }) => {
          console.log("Lifecycle onResponse called");
          console.log("Result output length:", result.output?.length || 0);
          console.log("Full result:", JSON.stringify(result, null, 2));

          const lastAssistantMessageText =
            lastAssistantTextMessageContent(result);

          console.log(
            "Last assistant message:",
            lastAssistantMessageText?.substring(0, 100) + "..."
          );

          if (lastAssistantMessageText && network) {
            // Ensure network state exists
            if (!network.state.data) {
              network.state.data = {};
            }

            if (lastAssistantMessageText.includes("<task_summary>")) {
              console.log("Task summary detected - saving to network state");
              network.state.data.summary = lastAssistantMessageText;
            }
          }

          return result;
        },
      },
    });

    const network = createNetwork({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      router: async ({ network }) => {
        console.log("Router called");

        // Ensure network state exists
        if (!network.state.data) {
          network.state.data = {};
        }

        const summary = network.state.data.summary;
        console.log("Current summary:", summary ? "exists" : "none");

        // If we have a summary, stop routing
        if (summary) {
          console.log("Task completed - stopping router");
          return undefined;
        }

        console.log("Continuing with code agent");
        return codeAgent;
      },
    });

    console.log("Starting network execution with input:", event.data.value);
    const result = await network.run(event.data.value);
    console.log("Network execution completed");
    console.log("Final state:", {
      hasFiles: !!result.state.data.files,
      hasSummary: !!result.state.data.summary,
      fileCount: result.state.data.files
        ? Object.keys(result.state.data.files).length
        : 0,
    });

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      try {
        const sandbox = await getSandbox(sandboxId);
        const host = sandbox.getHost(3000);
        return `https://${host}`;
      } catch (e) {
        console.error(`Failed to get sandbox URL: ${e}`);
        return null;
      }
    });

    return {
      url: sandboxUrl,
      title: "Fragmnts",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);
