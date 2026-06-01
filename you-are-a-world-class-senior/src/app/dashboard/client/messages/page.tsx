import { DashboardShell } from "@/components/dashboard-shell";
import { DataTable } from "@/components/dashboard-widgets";
export default function ClientMessagesPage() {
  return <DashboardShell role="CLIENT"><DataTable title="Messages" rows={[{ Thread: "Project collaboration", From: "Designer", Status: "Read", Updated: "Today" }]} /></DashboardShell>;
}
