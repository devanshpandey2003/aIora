import z from "zod";
import { generateSlug } from "random-word-slugs";

import { inngest } from "@/inngest/client";

import prisma from "@/lib/db";

import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { consumeCreits } from "@/lib/usage";

export const projectsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: "Project ID cannot be empty" }),
      })
    )
    .query(async ({ input, ctx }) => {
      const existingProject = await prisma.project.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.userId,
        },
      });
      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }
      return existingProject;
    }),

  getMany: protectedProcedure.query(async ({ ctx }) => {
    const projects = await prisma.project.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      orderBy: { createdAt: "desc" },
    });

    return projects;
  }),
  create: protectedProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: "Prompt cannot be empty" })
          .max(10000, { message: "Prompt is too long" }),
        tier: z.enum(["free", "premium"]).default("free"),
      })
    )
    .mutation(async ({ input, ctx }) => {
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

      const createdProject = await prisma.project.create({
        data: {
          userId: ctx.auth.userId,
          name: generateSlug(2, {
            format: "kebab",
          }),
          messages: {
            create: {
              content: input.value,
              role: "USER",
              type: "RESULT",
            },
          },
        },
      });

      // Determine which event to send based on tier
      const eventName =
        input.tier === "free" ? "free-tier-code-agent/run" : "code-agent/run";

      await inngest.send({
        name: eventName,
        data: {
          value: input.value,
          projectId: createdProject.id,
        },
      });

      return createdProject;
    }),
});
