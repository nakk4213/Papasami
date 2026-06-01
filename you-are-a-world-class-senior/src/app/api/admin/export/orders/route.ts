import { NextResponse } from "next/server";
import { RoleName } from "@prisma/client";
import { requireRole } from "@/lib/security";
import { prisma } from "@/lib/db";

export async function GET() {
  await requireRole([RoleName.ADMIN]);
  const orders = await prisma.order.findMany({ include: { client: true, designer: true, service: true }, orderBy: { createdAt: "desc" } });
  const header = ["orderNumber", "title", "service", "client", "designer", "status", "budget", "createdAt"];
  const rows = orders.map((order) => [
    order.orderNumber,
    order.title,
    order.service.name,
    order.client.email,
    order.designer?.email ?? "",
    order.status,
    String(order.budget),
    order.createdAt.toISOString()
  ]);
  const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=papa-sami-orders.csv"
    }
  });
}
