import { createTRPCRouter } from "../init";

import { projectsRouter } from "@/modules/porjects/server/preocedures";
import { messagesRouter } from "@/modules/messages/server/preocedures";

export const appRouter = createTRPCRouter({
  messages: messagesRouter,
  projects: projectsRouter,
});

export type AppRouter = typeof appRouter;
