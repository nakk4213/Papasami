import { DashboardShell } from "@/components/dashboard-shell";
import { DataTable } from "@/components/dashboard-widgets";
import { prisma } from "@/lib/db";
import { hasDatabaseUrl } from "@/lib/env";

export default async function ClientPaymentsPage() {
  const payments = hasDatabaseUrl() ? await prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 20 }).catch(() => []) : [];
  return <DashboardShell role="CLIENT"><DataTable title="Payment history" rows={payments.length ? payments.map((p) => ({ Provider: p.provider, Status: p.status, Amount: `$${p.amount}`, Reference: p.reference })) : [{ Provider: "-", Status: "No payments", Amount: "-", Reference: "-" }]} /></DashboardShell>;
}
