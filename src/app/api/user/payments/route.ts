import { NextResponse } from "next/server";
import prisma, { withRetry } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const payments = await withRetry(() => prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }));

    return NextResponse.json(payments);
  } catch (err: any) {
    console.error("Error fetching user payments:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
