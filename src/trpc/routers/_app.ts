import { createTRPCRouter } from "../init";

import { projectsRouter } from "@/modules/porjects/server/preocedures";
import { messagesRouter } from "@/modules/messages/server/preocedures";
import { usageRouter } from "@/modules/usage/server/prcedures";

export const appRouter = createTRPCRouter({
  usage: usageRouter,
  messages: messagesRouter,
  projects: projectsRouter,
});

export type AppRouter = typeof appRouter;
