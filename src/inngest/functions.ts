import { Agent, gemini, createAgent } from "@inngest/agent-kit";

import { Sandbox } from "@e2b/code-interpreter";

import { getSandbox } from "./utils";

import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step}) => {
    const  sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("alora-nextjs-test-3");
      return sandbox.sandboxId;
    });
     const codeAgent = createAgent({
      name: "code-agent",
      system: "You are an expert in nextjs.  You write code snippits in react as well as nextjs.",
      model: gemini({ model: "gemini-1.5-flash" }),
    });

      const { output } = await codeAgent.run(`write the code snippets :   ${event.data.value}`);

      console.log("Summarizer output:", output);

      const  sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
        return `https://${host}`;
      });

    return {output, sandboxUrl};
  },
);
