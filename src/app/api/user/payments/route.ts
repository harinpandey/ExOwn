import { NextResponse } from "next/server";
import prisma, { withRetry } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const limited = await enforceRateLimit(req, {
    namespace: "payments:read",
    limit: 30,
    windowSeconds: 60,
  });
  if (limited) return limited;

  try {
    const currentUser = await requireUser();
    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get("userId");

    if (requestedUserId && requestedUserId !== currentUser.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payments = await withRetry(() => prisma.payment.findMany({
      where: { userId: currentUser.uid },
      orderBy: { createdAt: "desc" },
    }));

    return NextResponse.json(payments);
  } catch (err: any) {
    console.error("Error fetching user payments:", err);
    const status = err.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
