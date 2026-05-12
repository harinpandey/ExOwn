import prisma from "./prisma";

export async function logEvent(type: string, message: string, metadata?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}`;
  
  console.log(logMessage);
  if (metadata) console.log(JSON.stringify(metadata, null, 2));

  // Future: Store in DB or external log service
  // try {
  //   await prisma.systemLog.create({ data: { type, message, metadata } });
  // } catch (err) {
  //   console.error("Critical: Failed to save system log to DB");
  // }
}

export function logDbError(context: string, error: any) {
  logEvent("DB_ERROR", `${context}: ${error?.message || "Unknown"}`, {
    code: error?.code,
    stack: error?.stack,
  });
}
