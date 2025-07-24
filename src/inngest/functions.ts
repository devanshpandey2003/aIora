import {
  createAgent,
  createTool,
  createNetwork,
  openai,
  gemini,
  type Tool,
  type Message,
  createState,
} from "@inngest/agent-kit";
import type { Inngest } from "inngest";
import { Sandbox } from "@e2b/code-interpreter";
import { z } from "zod";

import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "@/prompt";
import { FREE_TIER_PROMPT } from "@/freePrompt";

import { getSandbox, lastAssistantTextMessageContent } from "./utils";

import { inngest } from "./client";
import prisma from "@/lib/db";

interface AgentState {
  summary?: string;
  files?: { [path: string]: string };
}

// Base files for free tier projects
const BASE_FILES = {
  "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Web Project</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Welcome to Your Project</h1>
        <p>This is a basic web project. Start customizing it!</p>
        <button id="actionBtn">Click Me</button>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
  "style.css": `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f4f4f4;
}

.container {
    max-width: 800px;
    margin: 50px auto;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    text-align: center;
}

h1 {
    color: #2c3e50;
    margin-bottom: 20px;
}

p {
    margin-bottom: 20px;
    font-size: 16px;
}

#actionBtn {
    background-color: #3498db;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
}

#actionBtn:hover {
    background-color: #2980b9;
}`,
  "script.js": `document.addEventListener('DOMContentLoaded', function() {
    const actionBtn = document.getElementById('actionBtn');
    
    actionBtn.addEventListener('click', function() {
        alert('Hello! Welcome to your web project!');
    });
    
    console.log('Project initialized successfully!');
});`,
};

// Free Tier Function using Gemini
export const freeTierCodeAgentFunction = inngest.createFunction(
  { id: "free-tier-code-agent" },
  { event: "free-tier-code-agent/run" },
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

    // Initialize sandbox with base files
    await step.run("initialize-base-files", async () => {
      try {
        const sandbox = await getSandbox(sandboxId);

        // Create the base files
        for (const [filePath, content] of Object.entries(BASE_FILES)) {
          await sandbox.files.write(filePath, content);
        }

        console.log("Base files created successfully");
        return "Base files initialized";
      } catch (e) {
        console.error(`Failed to initialize base files: ${e}`);
        throw new Error(`Failed to initialize base files: ${e}`);
      }
    });

    // Start web server for the initial files
    await step.run("start-initial-web-server", async () => {
      try {
        const sandbox = await getSandbox(sandboxId);

        // Create a simple Node.js server script
        const serverScript = `
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const server = http.createServer((req, res) => {
  let pathname = url.parse(req.url).pathname;
  if (pathname === '/') pathname = '/index.html';
  
  const filePath = path.join(process.cwd(), pathname);
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'});
      res.end('File not found');
      return;
    }
    
    const ext = path.extname(filePath);
    let contentType = 'text/html';
    if (ext === '.css') contentType = 'text/css';
    if (ext === '.js') contentType = 'application/javascript';
    
    res.writeHead(200, {'Content-Type': contentType});
    res.end(data);
  });
});

server.listen(8000, () => {
  console.log('Server running on port 8000');
});
`;

        // Write the server script
        await sandbox.files.write("server.js", serverScript);

        // Start the server using Node.js
        try {
          await sandbox.commands.run("nohup node server.js > /dev/null 2>&1 &");
          // Give it a moment to start
          await new Promise((resolve) => setTimeout(resolve, 3000));
          console.log("Custom Node.js server started on port 8000");
          return "Custom Node.js web server started";
        } catch (nodeError) {
          console.log(
            "Custom Node.js failed, trying Python approach",
            nodeError
          );
          // Fallback to Python if Node.js fails
          try {
            await sandbox.commands.run(
              "nohup python3 -m http.server 8000 > /dev/null 2>&1 &"
            );
            await new Promise((resolve) => setTimeout(resolve, 2000));
            console.log("Python HTTP server started on port 8000");
            return "Python web server started";
          } catch (pythonError) {
            console.log(
              "Both approaches failed, will retry later",
              pythonError
            );
            return "Failed to start initial server, will retry";
          }
        }
      } catch (e) {
        console.error(`Failed to start initial web server: ${e}`);
        return "Failed to start initial server";
      }
    });

    const geminiAgent = createAgent<AgentState>({
      name: "free-tier-agent",
      description:
        "You are a web development assistant that updates existing HTML, CSS, and JavaScript files based on user requests",
      system: FREE_TIER_PROMPT,

      model: gemini({
        model: "gemini-1.5-flash",
      }),

      tools: [
        createTool({
          name: "readCurrentFiles",
          description:
            "Read the current contents of the three base files (index.html, style.css, script.js) to understand the existing code before making updates.",
          parameters: z.object({}),
          handler: async ({}, { step }) => {
            console.log("Reading current files for update");
            return await step?.run("readCurrentFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const files = ["index.html", "style.css", "script.js"];
                const fileContents: { [key: string]: string } = {};

                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  fileContents[file] = content;
                }

                console.log("Current files read successfully");
                return `Current file contents:

HTML FILE (index.html):
${fileContents["index.html"]}

CSS FILE (style.css):
${fileContents["style.css"]}

JAVASCRIPT FILE (script.js):
${fileContents["script.js"]}

Please analyze these files and apply the requested changes: ${event.data.value}`;
              } catch (e) {
                console.error(`Failed to read current files: ${e}`);
                throw new Error(`Failed to read current files: ${e}`);
              }
            });
          },
        }),

        createTool({
          name: "updateFiles",
          description:
            "Update the three base files (index.html, style.css, script.js) with the new content after applying the requested changes.",
          parameters: z.object({
            html: z
              .string()
              .describe("Complete updated content for index.html"),
            css: z.string().describe("Complete updated content for style.css"),
            js: z.string().describe("Complete updated content for script.js"),
          }),
          handler: async (
            { html, css, js },
            { step, network }: Tool.Options<AgentState>
          ) => {
            console.log("Updating files with new content");
            const updatedFiles = await step?.run("updateFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);

                // Update all three files
                await sandbox.files.write("index.html", html);
                await sandbox.files.write("style.css", css);
                await sandbox.files.write("script.js", js);

                const files = {
                  "index.html": html,
                  "style.css": css,
                  "script.js": js,
                };

                console.log("Files updated successfully");
                return files;
              } catch (e) {
                console.error(`Failed to update files: ${e}`);
                throw new Error(`Failed to update files: ${e}`);
              }
            });

            // Update network state
            if (!network.state.data) {
              network.state.data = {};
            }
            network.state.data.files = updatedFiles;

            return "Files updated successfully";
          },
        }),

        createTool({
          name: "startWebServer",
          description:
            "Start a simple HTTP server to serve the HTML files on port 8000. Call this after updating the files to make the website accessible.",
          parameters: z.object({}),
          handler: async ({}, { step }) => {
            console.log("Starting web server on port 8000");
            return await step?.run("startWebServer", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);

                // Kill any existing servers on port 8000 first
                try {
                  await sandbox.commands.run(
                    "pkill -f 'node server.js' || true"
                  );
                  await sandbox.commands.run(
                    "pkill -f 'python3 -m http.server 8000' || true"
                  );
                  await sandbox.commands.run(
                    "pkill -f 'http-server.*8000' || true"
                  );
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                } catch (killError) {
                  console.log("No existing servers to kill", killError);
                }

                // Create a simple Node.js server script if it doesn't exist
                const serverScript = `
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const server = http.createServer((req, res) => {
  let pathname = url.parse(req.url).pathname;
  if (pathname === '/') pathname = '/index.html';
  
  const filePath = path.join(process.cwd(), pathname);
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'});
      res.end('File not found');
      return;
    }
    
    const ext = path.extname(filePath);
    let contentType = 'text/html';
    if (ext === '.css') contentType = 'text/css';
    if (ext === '.js') contentType = 'application/javascript';
    
    res.writeHead(200, {'Content-Type': contentType});
    res.end(data);
  });
});

server.listen(8000, () => {
  console.log('Server running on port 8000');
});
`;

                // Write the server script
                await sandbox.files.write("server.js", serverScript);

                // Start the custom Node.js server
                try {
                  await sandbox.commands.run(
                    "nohup node server.js > /dev/null 2>&1 &"
                  );
                  // Give it a moment to start
                  await new Promise((resolve) => setTimeout(resolve, 3000));

                  // Verify the server is running by checking if the process exists
                  const checkResult = await sandbox.commands.run(
                    "ps aux | grep 'node server.js' | grep -v grep || echo 'not found'"
                  );
                  if (checkResult.stdout.includes("not found")) {
                    throw new Error(
                      "Custom Node.js server didn't start properly"
                    );
                  }

                  console.log("Custom Node.js web server started on port 8000");
                  return "Custom Node.js web server started successfully on port 8000. The website should now be accessible.";
                } catch (nodeError) {
                  console.log("Custom Node.js failed, trying Python approach");

                  // Fallback to Python if custom Node.js fails
                  try {
                    await sandbox.commands.run(
                      "nohup python3 -m http.server 8000 > /dev/null 2>&1 &"
                    );
                    await new Promise((resolve) => setTimeout(resolve, 2000));

                    // Verify the server is running
                    const checkResult = await sandbox.commands.run(
                      "ps aux | grep 'python3 -m http.server 8000' | grep -v grep || echo 'not found'"
                    );
                    if (checkResult.stdout.includes("not found")) {
                      throw new Error("Python server didn't start properly");
                    }

                    console.log("Python HTTP server started on port 8000");
                    return "Python web server started successfully on port 8000.";
                  } catch (pythonError) {
                    console.error(
                      `Failed to start Python server: ${pythonError}`
                    );
                    throw new Error(
                      `Failed to start web server with both custom Node.js and Python: ${nodeError}`
                    );
                  }
                }
              } catch (e) {
                console.error(`Failed to start web server: ${e}`);
                throw new Error(`Failed to start web server: ${e}`);
              }
            });
          },
        }),
      ],

      lifecycle: {
        onResponse: async ({ result, network }) => {
          console.log("Free tier lifecycle onResponse called");

          const lastAssistantMessageText =
            lastAssistantTextMessageContent(result);

          if (lastAssistantMessageText && network) {
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

    const network = createNetwork<AgentState>({
      name: "free-tier-network",
      agents: [geminiAgent],
      maxIter: 5, // Fewer iterations for free tier
      router: async ({ network }) => {
        console.log("Free tier router called");

        if (!network.state.data) {
          network.state.data = {};
        }

        const summary = network.state.data.summary;

        if (summary) {
          console.log("Free tier task completed - stopping router");
          return undefined;
        }

        console.log("Continuing with gemini agent");
        return geminiAgent;
      },
    });

    const result = await network.run(event.data.value);

    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      try {
        const sandbox = await getSandbox(sandboxId);
        const host = sandbox.getHost(8000); // Using port 8000 for simple HTML
        return `https://${host}`;
      } catch (e) {
        console.error(`Failed to get sandbox URL: ${e}`);
        return null;
      }
    });

    await step.run("save-result", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content:
              "An error occurred during code execution. Please try again",
            role: "ASSISTANT",
            type: "ERROR",
          },
        });
      }
      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: result.state.data.summary || "",
          role: "ASSISTANT",
          type: "RESULT",
          fragments: {
            create: {
              sandboxUrl: sandboxUrl || "",
              files: result.state.data.files || {},
              title: "Free Tier Project",
            },
          },
        },
      });
    });

    return {
      url: sandboxUrl,
      title: "Free Tier Project",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);

/*

VERY LONG 

*/

// Premium Tier Function (existing GPT-4 function)
export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
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

    const previousMessage = await step.run("get-previous-message", async () => {
      const formattedMessage: Message[] = [];

      const messages = await prisma.message.findMany({
        where: {
          projectId: event.data.projectId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      for (const message of messages) {
        formattedMessage.push({
          type: "text",
          role: message.role === "ASSISTANT" ? "assistant" : "user",
          content: message.content,
        });
      }

      return formattedMessage;
    });

    const state = createState<AgentState>(
      {
        summary: "",
        files: {},
      },
      {
        messages: previousMessage,
      }
    );
    const gptcodeAgent = createAgent<AgentState>({
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
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState>
          ) => {
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

    const network = createNetwork<AgentState>({
      name: "coding-agent-network",
      agents: [gptcodeAgent],
      maxIter: 15,
      defaultState: state,
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
        return gptcodeAgent;
      },
    });

    const result = await network.run(event.data.value, { state: state });

    const fragmentTitleGenerator = createAgent({
      name: "fragment-title-generator",
      description: "A Fragment title generator",
      system: FRAGMENT_TITLE_PROMPT,
      model: openai({
        model: "gpt-4o",
      }),
    });

    const responseGenerator = createAgent({
      name: "response-generator",
      description: "A response generator",
      system: RESPONSE_PROMPT,
      model: openai({
        model: "gpt-4o",
      }),
    });

    const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(
      result.state.data.summary ?? ""
    );
    const { output: resposeOutput } = await responseGenerator.run(
      result.state.data.summary ?? ""
    );

    const generateFragmentTitle = () => {
      if (fragmentTitleOutput[0].type !== "text") {
        return "Fragment;";
      }

      if (Array.isArray(fragmentTitleOutput[0].content)) {
        return fragmentTitleOutput[0].content.map((txt) => txt).join("");
      } else {
        return fragmentTitleOutput[0].content;
      }
    };

    const generateResponse = () => {
      if (resposeOutput[0].type !== "text") {
        return "Here you go;";
      }

      if (Array.isArray(resposeOutput[0].content)) {
        return resposeOutput[0].content.map((txt) => txt).join("");
      } else {
        return resposeOutput[0].content;
      }
    };

    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

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

    await step.run("save-result", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content:
              "An error occurred during code execution. Please try again",
            role: "ASSISTANT",
            type: "ERROR",
          },
        });
      }
      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: generateResponse(),
          role: "ASSISTANT",
          type: "RESULT",
          fragments: {
            create: {
              sandboxUrl: sandboxUrl || "",
              files: result.state.data.files || {},
              title: generateFragmentTitle(),
            },
          },
        },
      });
    });

    return {
      url: sandboxUrl,
      title: "Fragmnts",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);

// Helper function to determine which agent function to use based on user tier
export const getCodeAgentFunction = (tier: "free" | "premium") => {
  return tier === "free" ? freeTierCodeAgentFunction : codeAgentFunction;
};

export const runCodeAgent = async (
  inngestClient: Inngest,
  data: Record<string, string>,
  tier: "free" | "premium"
) => {
  const eventName =
    tier === "free" ? "free-tier-code-agent/run" : "code-agent/run";
  return await inngestClient.send({
    name: eventName,
    data,
  });
};
