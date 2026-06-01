import { DashboardShell } from "@/components/dashboard-shell";
import { DataTable } from "@/components/dashboard-widgets";
export default function DesignerMessagesPage() {
  return <DashboardShell role="DESIGNER"><DataTable title="Messages" rows={[{ Thread: "Client feedback", Client: "Demo Client", Status: "Unread", Updated: "Now" }]} /></DashboardShell>;
}
