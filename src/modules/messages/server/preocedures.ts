import z from "zod";

import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { consumeCreits } from "@/lib/usage";

export const messagesRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, { message: "Project ID cannot be empty" }),
      })
    )
    .query(async ({ input, ctx }) => {
      const messages = await prisma.message.findMany({
        where: {
          projectId: input.projectId,
          project: {
            userId: ctx.auth.userId,
          },
        },
        include: {
          fragments: true,
        },
        orderBy: { createdAt: "asc" },
      });

      return messages;
    }),
  create: protectedProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: "Prompt cannot be empty" })
          .max(10000, { message: "Prompt is too long" }),
        projectId: z.string().min(1, { message: "Project ID cannot be empty" }),
        tier: z.enum(["free", "premium"]).default("free"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existingProject = await prisma.project.findUnique({
        where: {
          id: input.projectId,
          userId: ctx.auth.userId,
        },
      });

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      if (input.tier !== "free") {
        try {
          await consumeCreits();
        } catch (error) {
          if (error instanceof Error) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Something went wrong",
            });
          } else {
            throw new TRPCError({
              code: "TOO_MANY_REQUESTS",
              message: "You hvae run out of credits",
            });
          }
        }
      }
      const createdMessage = await prisma.message.create({
        data: {
          projectId: existingProject.id,
          content: input.value,
          role: "USER",
          type: "RESULT",
        },
      });

      const eventName =
        input.tier === "free" ? "free-tier-code-agent/run" : "code-agent/run";

      await inngest.send({
        name: eventName,
        data: {
          value: input.value,
          projectId: input.projectId,
        },
      });

      return createdMessage;
    }),
});
