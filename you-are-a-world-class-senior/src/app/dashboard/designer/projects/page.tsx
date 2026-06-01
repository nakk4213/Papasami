import { auth } from "@/auth";
import { uploadDeliverableAction } from "@/app/actions";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/db";
import { hasDatabaseUrl } from "@/lib/env";
import { formatCurrency } from "@/lib/utils";

export default async function DesignerProjectsPage() {
  const session = await auth();
  const designer = session?.user?.email && hasDatabaseUrl() ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }).catch(() => null) : null;
  const orders = designer
    ? await prisma.order.findMany({ where: { designerId: designer.id }, include: { client: true, service: true, files: true, events: { orderBy: { createdAt: "desc" }, take: 3 } }, orderBy: { deadline: "asc" }, take: 30 }).catch(() => [])
    : [];

  return (
    <DashboardShell role="DESIGNER">
      <div className="mb-6">
        <h1 className="text-3xl font-black">Assigned Projects</h1>
        <p className="mt-2 text-sm text-muted-foreground">Upload completed designs, track deadlines, and respond to revision requests.</p>
      </div>
      <div className="grid gap-5">
        {orders.length ? orders.map((order) => (
          <Card key={order.id}>
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary">{order.orderNumber}</p>
                <h2 className="mt-2 text-2xl font-bold">{order.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">Client: {order.client.name ?? order.client.email} - {order.service.name} - {formatCurrency(String(order.budget))}</p>
                <p className="mt-1 text-sm text-muted-foreground">Status: {order.status} - Deadline: {order.deadline.toLocaleDateString()}</p>
              </div>
              <div className="rounded-xl border border-white/10 px-4 py-3 text-sm text-muted-foreground">
                Deliverables: {order.files.filter((file) => file.kind === "DELIVERABLE").length}
              </div>
            </div>
            <form action={uploadDeliverableAction} className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
              <input type="hidden" name="orderId" value={order.id} />
              <Input name="url" placeholder="Final design URL or Cloudinary link" required />
              <Input name="note" placeholder="Delivery note" />
              <Button>Upload deliverable</Button>
            </form>
          </Card>
        )) : <Card><p className="text-sm text-muted-foreground">No assigned projects yet.</p></Card>}
      </div>
    </DashboardShell>
  );
}
