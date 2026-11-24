import { execFileSync } from "node:child_process";

const prismaCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const fallbackDatabaseUrl = "postgresql://exown:exown@127.0.0.1:5432/exown?schema=public";

const prismaEnv = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL || fallbackDatabaseUrl,
  DIRECT_URL: process.env.DIRECT_URL || process.env.DATABASE_URL || fallbackDatabaseUrl,
};

execFileSync(
  prismaCommand,
  ["prisma", "generate"],
  { env: prismaEnv, stdio: "inherit", shell: process.platform === "win32" }
);
