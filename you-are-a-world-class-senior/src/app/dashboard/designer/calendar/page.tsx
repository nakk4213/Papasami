import { DashboardShell } from "@/components/dashboard-shell";
import { Card } from "@/components/ui/card";
export default function DesignerCalendarPage() {
  return <DashboardShell role="DESIGNER"><Card><h2 className="text-xl font-semibold">Calendar</h2><div className="mt-5 grid grid-cols-7 gap-2">{Array.from({ length: 35 }, (_, i) => <div key={i} className="aspect-square rounded-lg border border-white/10 bg-white/5 p-2 text-sm">{i + 1}</div>)}</div></Card></DashboardShell>;
}
