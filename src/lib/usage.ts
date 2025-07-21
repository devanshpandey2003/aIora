import { RateLimiterPrisma } from "rate-limiter-flexible";

import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

const FREE_POINTS = 2; // Set this to the desired number of free points
const DURATION = 30 * 24 * 60 * 60; //30days
const GENERATION_COST = 1;

export async function getUsageTracker() {
  const usageTracker = new RateLimiterPrisma({
    storeClient: prisma,
    tableName: "Usage",
    points: FREE_POINTS,
    duration: DURATION,
  });
  return usageTracker;
}

export async function consumeCreits() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const usageTracker = await getUsageTracker();
  const result = await usageTracker.consume(userId, GENERATION_COST);

  return result;
}

export async function getUsageStatus() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const usageTracker = await getUsageTracker();
  const result = await usageTracker.get(userId);
  return result;
}
