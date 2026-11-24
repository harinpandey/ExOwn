import { execFileSync } from "node:child_process";

const prismaCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const fallbackTicketsUrl = "postgresql://tickets:tickets@127.0.0.1:5432/exown_tickets?schema=public";

const ticketsEnv = {
  ...process.env,
  TICKETS_DATABASE_URL: process.env.TICKETS_DATABASE_URL || fallbackTicketsUrl,
  TICKETS_DIRECT_URL: process.env.TICKETS_DIRECT_URL || process.env.TICKETS_DATABASE_URL || fallbackTicketsUrl,
};

execFileSync(
  prismaCommand,
  ["prisma", "generate", "--schema=prisma/tickets/schema.prisma"],
  { env: ticketsEnv, stdio: "inherit", shell: process.platform === "win32" }
);
