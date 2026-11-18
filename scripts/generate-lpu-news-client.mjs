import { execFileSync } from "node:child_process";

const prismaCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const fallbackNewsUrl = "postgresql://news:news@127.0.0.1:5432/lpu_news?schema=public";

const newsEnv = {
  ...process.env,
  LPU_NEWS_DATABASE_URL: process.env.LPU_NEWS_DATABASE_URL || fallbackNewsUrl,
  LPU_NEWS_DIRECT_URL: process.env.LPU_NEWS_DIRECT_URL || process.env.LPU_NEWS_DATABASE_URL || fallbackNewsUrl,
};

execFileSync(
  prismaCommand,
  ["prisma", "generate", "--schema=prisma/lpu-news/schema.prisma"],
  { env: newsEnv, stdio: "inherit", shell: process.platform === "win32" }
);
