import "server-only";

import { PrismaClient } from "@/generated/lpu-news-client";

const globalForLpuNews = globalThis as unknown as {
  lpuNewsPrisma?: PrismaClient;
};

const lpuNewsPrisma =
  globalForLpuNews.lpuNewsPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForLpuNews.lpuNewsPrisma = lpuNewsPrisma;
}

export default lpuNewsPrisma;
