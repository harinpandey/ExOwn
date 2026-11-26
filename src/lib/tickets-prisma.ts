import "server-only";
import { PrismaClient } from "@/generated/tickets-client";
const globalForTickets=globalThis as unknown as {ticketsPrisma?:PrismaClient};
const ticketsPrisma=globalForTickets.ticketsPrisma??new PrismaClient({log:process.env.NODE_ENV==="development"?["error","warn"]:["error"]});
if(process.env.NODE_ENV!=="production")globalForTickets.ticketsPrisma=ticketsPrisma;
export default ticketsPrisma;
