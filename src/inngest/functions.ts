import { Agent, openai, createAgent } from "@inngest/agent-kit";



import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event}) => {

     const codeAgent = createAgent({
      name: "code-agent",
      system: "You are an expert summarizer.  You write summarize in 2 words.",
      model: openai({ model: "gpt-4o" }),
    });

      const { output } = await codeAgent.run(`Summarisze the following text in 2 words:   ${event.data.value}`);

      console.log("Summarizer output:", output);


    return {output };
  },
);
