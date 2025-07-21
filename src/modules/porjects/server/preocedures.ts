import z from "zod";
import { generateSlug } from "random-word-slugs";

import { inngest } from "@/inngest/client";

import prisma from "@/lib/db";

import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const projectsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: "Project ID cannot be empty" }),
      })
    )
    .query(async ({ input }) => {
      const existingProject = await prisma.project.findUnique({
        where: {
          id: input.id,
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

  getMany: baseProcedure.query(async () => {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });

    return projects;
  }),
  create: baseProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: "Prompt cannot be empty" })
          .max(10000, { message: "Prompt is too long" }),
        tier: z.enum(["free", "premium"]).default("free"),
      })
    )
    .mutation(async ({ input }) => {
      const createdProject = await prisma.project.create({
        data: {
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
