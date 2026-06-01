import { DashboardShell } from "@/components/dashboard-shell";
import { DataTable, StatGrid } from "@/components/dashboard-widgets";
import { prisma } from "@/lib/db";
import { hasDatabaseUrl } from "@/lib/env";

export default async function ClientDashboardPage() {
  const [orders, payments, notifications] = await Promise.all([
    hasDatabaseUrl() ? prisma.order.count().catch(() => 0) : 0,
    hasDatabaseUrl() ? prisma.payment.count().catch(() => 0) : 0,
    hasDatabaseUrl() ? prisma.notification.count().catch(() => 0) : 0
  ]);
  return (
    <DashboardShell role="CLIENT">
      <StatGrid stats={[
        { label: "Current orders", value: orders, helper: "Real-time status tracking" },
        { label: "Payments", value: payments, helper: "Invoices and receipts" },
        { label: "Notifications", value: notifications, helper: "Unread project updates" },
        { label: "Saved designs", value: 0, helper: "Bookmarks and inspiration" }
      ]} />
      <div className="mt-6">
        <DataTable title="Recent orders" rows={[{ Order: "DC-DEMO", Service: "Brand Kit", Status: "In progress", Deadline: "2026-06-05" }]} />
      </div>
    </DashboardShell>
  );
}
