import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import {
  codeAgentFunction,
  freeTierCodeAgentFunction,
} from "@/inngest/functions";

// Create an API that serves both free and premium tier functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [codeAgentFunction, freeTierCodeAgentFunction],
});
