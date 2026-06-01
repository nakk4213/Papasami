import { DashboardShell } from "@/components/dashboard-shell";
import { DataTable, RevenueBars, StatGrid } from "@/components/dashboard-widgets";
import { prisma } from "@/lib/db";
import { hasDatabaseUrl } from "@/lib/env";

export default async function DesignerDashboardPage() {
  const assigned = hasDatabaseUrl() ? await prisma.order.count({ where: { designerId: { not: null } } }).catch(() => 0) : 0;
  return (
    <DashboardShell role="DESIGNER">
      <StatGrid stats={[{ label: "Assigned projects", value: assigned }, { label: "Earnings", value: "$8.2k" }, { label: "Rating", value: "4.9" }, { label: "Availability", value: "Online" }]} />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <RevenueBars values={[650, 900, 1200, 880, 1600, 2200]} />
        <DataTable title="Deadlines" rows={[{ Project: "Flyer campaign", Due: "2026-06-02", Status: "In review" }, { Project: "Packaging", Due: "2026-06-08", Status: "Assigned" }]} />
      </div>
    </DashboardShell>
  );
}
