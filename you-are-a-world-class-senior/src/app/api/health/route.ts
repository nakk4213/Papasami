import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const startedAt = Date.now();
  await prisma.$queryRaw`SELECT 1`;
  return NextResponse.json({ ok: true, database: "healthy", latencyMs: Date.now() - startedAt, timestamp: new Date().toISOString() });
}
