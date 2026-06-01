import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { approveOrderAction, requestRevisionAction } from "@/app/actions";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { hasDatabaseUrl } from "@/lib/env";
import { formatCurrency } from "@/lib/utils";

export default async function ProjectWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  const order = session?.user?.email && hasDatabaseUrl()
    ? await prisma.order.findFirst({
        where: { id, client: { email: session.user.email } },
        include: { service: true, designer: true, files: true, events: { orderBy: { createdAt: "desc" } } }
      }).catch(() => null)
    : null;

  if (!order) notFound();
  const references = order.files.filter((file) => file.kind === "REFERENCE");
  const deliverables = order.files.filter((file) => file.kind === "DELIVERABLE");

  return (
    <DashboardShell role="CLIENT">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Project workspace</p>
        <h1 className="mt-2 text-3xl font-black">{order.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{order.orderNumber} - {order.service.name} - {formatCurrency(String(order.budget))}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div className="grid gap-6">
          <Card>
            <h2 className="text-xl font-semibold">Project brief</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{order.requirements}</p>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold">Timeline</h2>
            <div className="mt-4 grid gap-3">
              {order.events.map((event) => (
                <div key={event.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                  <span className="font-medium">{event.status}</span>
                  <span className="text-muted-foreground"> - {event.note ?? "Updated"} - {event.createdAt.toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold">Deliverables</h2>
            <div className="mt-4 grid gap-3">
              {deliverables.length ? deliverables.map((file) => (
                <a key={file.id} href={file.secureUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-primary">
                  Open final design
                </a>
              )) : <p className="text-sm text-muted-foreground">No final design has been uploaded yet.</p>}
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
        </div>

        <div className="grid gap-6 content-start">
          <Card>
            <h2 className="text-xl font-semibold">Status</h2>
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
              <p><span className="text-white">Current:</span> {order.status}</p>
              <p><span className="text-white">Deadline:</span> {order.deadline.toLocaleDateString()}</p>
              <p><span className="text-white">Designer:</span> {order.designer?.name ?? "Not assigned yet"}</p>
              <p><span className="text-white">Revisions:</span> {order.revisionCount}</p>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold">Uploaded assets</h2>
            <div className="mt-4 grid gap-3">
              {references.length ? references.map((file) => (
                <a key={file.id} href={file.secureUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-primary">
                  {file.publicId}
                </a>
              )) : <p className="text-sm text-muted-foreground">No reference files uploaded.</p>}
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
