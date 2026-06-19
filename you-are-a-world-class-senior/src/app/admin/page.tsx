import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard-shell";
import { DataTable, RevenueBars, StatGrid } from "@/components/dashboard-widgets";
import { prisma } from "@/lib/db";
import { hasDatabaseUrl } from "@/lib/env";
import { formatCurrency } from "@/lib/utils";

export default async function AdminPanelPage() {
  const session = await auth();
  const useDatabase = hasDatabaseUrl() && !session?.user.id.startsWith("local-");
  const [users, orders, revenue, tickets, services, portfolio, subscribers] = await Promise.all([
    useDatabase ? prisma.user.count().catch(() => 0) : 0,
    useDatabase ? prisma.order.count().catch(() => 0) : 0,
    useDatabase ? prisma.payment.aggregate({ _sum: { amount: true } }).catch(() => ({ _sum: { amount: 0 } })) : { _sum: { amount: 0 } },
    useDatabase ? prisma.contactTicket.count().catch(() => 0) : 0,
    useDatabase ? prisma.service.count().catch(() => 0) : 0,
    useDatabase ? prisma.portfolioItem.count().catch(() => 0) : 0,
    useDatabase ? prisma.newsletterSubscriber.count().catch(() => 0) : 0
  ]);

  return (
    <DashboardShell role="ADMIN">
      <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-600/10 p-5 shadow-glow">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Secure admin panel</p>
        <h1 className="mt-2 text-3xl font-black">Papa Sami Studio Admin</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          This area is separated from client pages and protected by admin-only access checks.
        </p>
      </div>
      <StatGrid
        stats={[
          { label: "Users", value: users, helper: "Clients, designers, admins" },
          { label: "Orders", value: orders, helper: "All project states" },
          { label: "Revenue", value: formatCurrency(String(revenue._sum.amount ?? 0)), helper: "Stripe, Paystack, manual" },
          { label: "Inbox", value: tickets, helper: "Contact and support" }
        ]}
      />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-muted-foreground">Services live</p>
          <div className="mt-2 text-2xl font-black">{services}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-muted-foreground">Portfolio pieces</p>
          <div className="mt-2 text-2xl font-black">{portfolio}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-muted-foreground">Newsletter audience</p>
          <div className="mt-2 text-2xl font-black">{subscribers}</div>
        </div>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <RevenueBars values={[1200, 2400, 3100, 2800, 4200, 5700]} />
        <DataTable
          title="Admin controls"
          rows={[
            { Module: "Orders", Access: "Admin only", Link: "/admin/orders" },
            { Module: "Users", Access: "Admin only", Link: "/admin/users" },
            { Module: "Services and pricing", Access: "Admin only", Link: "/admin/services" },
            { Module: "Portfolio", Access: "Admin only", Link: "/admin/portfolio" },
            { Module: "Contact inbox", Access: "Admin only", Link: "/admin/inbox" },
            { Module: "Payments", Access: "Admin only", Link: "/admin/payments" },
            { Module: "Analytics", Access: "Admin only", Link: "/admin/analytics" },
            { Module: "CMS", Access: "Admin only", Link: "/admin/cms" },
            { Module: "Notifications", Access: "Admin only", Link: "/admin/notifications" },
            { Module: "Security", Access: "Admin only", Link: "/admin/security" },
            { Module: "Backups", Access: "Admin only", Link: "/admin/backups" }
          ]}
        />
      </div>
    </DashboardShell>
  );
}
