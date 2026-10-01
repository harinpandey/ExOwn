import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      { level: 'error', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
    errorFormat: 'pretty',
  })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

// Cache across all environments — critical for serverless (Vercel) to prevent
// new PrismaClient on every invocation which exhausts Neon's connection pool.
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()
globalThis.prismaGlobal = prisma

// Helper for connection retries
export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      // Retry on connection errors: P1001, P2024, pool closed, or timeout
      const msg = error?.message ?? '';
      if (
        error.code === 'P1001' ||
        error.code === 'P2024' ||
        msg.includes('timeout') ||
        msg.includes('Closed') ||
        msg.includes('connection')
      ) {
        console.warn(`[prisma] Attempt ${i + 1} failed (${error.code ?? 'unknown'}). Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export default prisma
