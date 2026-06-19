import Link from "next/link";
import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard-shell";
import { approveOrderAction, requestRevisionAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { hasDatabaseUrl } from "@/lib/env";
import { formatCurrency } from "@/lib/utils";

export default async function ClientOrdersPage() {
  const session = await auth();
  const orders = session?.user?.email && hasDatabaseUrl()
    ? await prisma.order.findMany({
        where: { client: { email: session.user.email } },
        include: { service: true, files: true, events: { orderBy: { createdAt: "desc" }, take: 5 } },
        orderBy: { createdAt: "desc" },
        take: 20
      }).catch(() => [])
    : [];
  return (
    <DashboardShell role="CLIENT">
      <div className="mb-6">
        <h1 className="text-3xl font-black">My Orders</h1>
        <p className="mt-2 text-sm text-muted-foreground">Track design progress, review deliverables, request revisions, and approve final work.</p>
      </div>
      <div className="grid gap-5">
        {orders.length ? orders.map((order) => {
          const deliverables = order.files.filter((file) => file.kind === "DELIVERABLE");
          return (
            <Card key={order.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-primary">{order.orderNumber}</p>
                  <h2 className="mt-2 text-2xl font-bold">{order.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{order.service.name} - {formatCurrency(String(order.budget))} - {order.status}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Handled by: Papa Sami Studio</p>
                  <Link href={`/dashboard/client/projects/${order.id}`} className="mt-3 inline-flex text-sm font-semibold text-primary">Open project workspace</Link>
                </div>
                <div className="rounded-xl border border-white/10 px-4 py-3 text-sm text-muted-foreground">
                  Revisions: {order.revisionCount}
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                <h3 className="font-semibold">Timeline</h3>
                {order.events.length ? order.events.map((event) => (
                  <div key={event.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                    <span className="font-medium">{event.status}</span>
                    <span className="text-muted-foreground"> - {event.note ?? "Updated"} - {event.createdAt.toLocaleDateString()}</span>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No updates yet.</p>}
              </div>
              <div className="mt-5 grid gap-3">
                <h3 className="font-semibold">Deliverables</h3>
                {deliverables.length ? deliverables.map((file) => (
                  <div key={file.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="grid gap-3 md:grid-cols-[160px_1fr_auto] md:items-center">
                      <div className="overflow-hidden rounded-lg border border-white/10 bg-black/30">
                        {file.previewSecureUrl ? (
                          <img src={file.previewSecureUrl} alt="Watermarked design preview" className="aspect-[4/3] w-full object-cover" />
                        ) : (
                          <div className="flex aspect-[4/3] items-center justify-center px-3 text-center text-xs text-muted-foreground">Preview pending</div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Watermarked preview</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {file.downloadAuthorized ? "Original file is unlocked." : "Original file is locked until Papa Sami Studio authorizes download."}
                        </p>
                      </div>
                      {file.downloadAuthorized ? (
                        <Button asChild size="sm">
                          <a href={file.secureUrl} target="_blank" rel="noreferrer">Download original</a>
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>Download locked</Button>
                      )}
                    </div>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No deliverables uploaded yet.</p>}
              </div>
              {deliverables.length ? (
                <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
                  <form action={requestRevisionAction} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <input type="hidden" name="orderId" value={order.id} />
                    <input name="note" placeholder="Revision notes" className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none" required />
                    <Button variant="outline">Request revision</Button>
                  </form>
                  <form action={approveOrderAction}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <Button>Approve final design</Button>
                  </form>
                </div>
              ) : null}
            </Card>
          );
        }) : <Card><p className="text-sm text-muted-foreground">No orders yet. Start a design request from the homepage.</p></Card>}
      </div>
    </DashboardShell>
  );
}
