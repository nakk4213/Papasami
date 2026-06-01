import { DashboardShell } from "@/components/dashboard-shell";
import { RevenueBars } from "@/components/dashboard-widgets";
export default function DesignerEarningsPage() {
  return <DashboardShell role="DESIGNER"><RevenueBars values={[400, 850, 780, 1300, 1650, 1900]} /></DashboardShell>;
}
