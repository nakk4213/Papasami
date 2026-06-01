import { DashboardShell } from "@/components/dashboard-shell";
import { DataTable } from "@/components/dashboard-widgets";
export default function DesignerReviewsPage() {
  return <DashboardShell role="DESIGNER"><DataTable title="Reviews" rows={[{ Rating: "5", Client: "Demo Client", Review: "Polished and fast", Published: "Yes" }]} /></DashboardShell>;
}
