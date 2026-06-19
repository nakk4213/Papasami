import { notFound } from "next/navigation";
import { OrderStatus, RoleName, TicketStatus } from "@prisma/client";
import { DashboardShell } from "@/components/dashboard-shell";
import { DataTable, StatGrid } from "@/components/dashboard-widgets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/db";
import { hasCloudinaryConfig } from "@/lib/cloudinary";
import { hasDatabaseUrl } from "@/lib/env";
import { getAdminPortfolioItems } from "@/lib/portfolio-store";
import { formatCurrency } from "@/lib/utils";
import {
  authorizeDeliverableDownloadAction,
  assignOrderAction,
  deletePortfolioAction,
  savePackageAction,
  savePortfolioAction,
  saveBlogPostAction,
  saveCmsPageAction,
  saveFeatureToggleAction,
  saveServiceAction,
  saveSettingAction,
  sendAnnouncementAction,
  updateContactStatusAction,
  updateOrderStatusAction,
  updateUserAction,
  uploadCompletedDesignAction
} from "@/app/admin/actions";

const selectClass = "h-11 rounded-xl border border-white/10 bg-[#130d09] px-4 text-sm text-white";

export default async function AdminModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  if (!["orders", "users", "services", "portfolio", "inbox", "payments", "messages", "analytics", "cms", "notifications", "security", "backups", "settings"].includes(module)) notFound();

  return (
    <DashboardShell role="ADMIN">
      {module === "orders" ? <OrdersAdminV2 /> : null}
      {module === "users" ? <UsersAdmin /> : null}
      {module === "services" ? <ServicesAdmin /> : null}
      {module === "portfolio" ? <PortfolioAdmin /> : null}
      {module === "inbox" ? <InboxAdmin /> : null}
      {module === "payments" ? <PaymentsAdmin /> : null}
      {module === "messages" ? <MessagesAdmin /> : null}
      {module === "analytics" ? <AnalyticsAdmin /> : null}
      {module === "cms" ? <CmsAdmin /> : null}
      {module === "notifications" ? <NotificationsAdmin /> : null}
      {module === "security" ? <SecurityAdmin /> : null}
      {module === "backups" ? <BackupsAdmin /> : null}
      {module === "settings" ? <SettingsAdmin /> : null}
    </DashboardShell>
  );
}

async function OrdersAdmin() {
  const orders = hasDatabaseUrl()
    ? await prisma.order.findMany({ include: { client: true, designer: true, service: true }, orderBy: { createdAt: "desc" }, take: 30 }).catch(() => [])
    : [];

  return (
    <AdminFrame title="Order Status Editor" description="Update project status, track deadlines, and keep clients informed.">
      <StatGrid stats={[{ label: "Total orders", value: orders.length }, { label: "In progress", value: orders.filter((o) => o.status === "IN_PROGRESS").length }, { label: "In review", value: orders.filter((o) => o.status === "IN_REVIEW").length }, { label: "Completed", value: orders.filter((o) => o.status === "COMPLETED").length }]} />
      <div className="mt-6 grid gap-4">
        {orders.length ? orders.map((order) => (
          <Card key={order.id} className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs text-muted-foreground">{order.orderNumber} • {order.service.name}</p>
              <h2 className="mt-1 text-xl font-semibold">{order.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">Client: {order.client.name ?? order.client.email} • Designer: {order.designer?.name ?? "Unassigned"} • Budget: {formatCurrency(String(order.budget))}</p>
            </div>
            <form action={updateOrderStatusAction} className="grid gap-3 sm:grid-cols-[170px_1fr_auto]">
              <input type="hidden" name="orderId" value={order.id} />
              <select name="status" defaultValue={order.status} className={selectClass}>
                {Object.values(OrderStatus).map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <Input name="note" placeholder="Status note" />
              <Button>Update</Button>
            </form>
          </Card>
        )) : <EmptyState text="No orders yet." />}
      </div>
    </AdminFrame>
  );
}

async function UsersAdmin() {
  const users = hasDatabaseUrl() ? await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 50 }).catch(() => []) : [];

  return (
    <AdminFrame title="Users And Designer Approval" description="Promote approved designers, disable unsafe accounts, and keep admin access private.">
      <DataTable title="User summary" rows={users.length ? users.map((user) => ({ Name: user.name ?? "-", Email: user.email, Role: user.role, Active: user.isActive ? "Yes" : "No" })) : [{ Name: "-", Email: "No users", Role: "-", Active: "-" }]} />
      <div className="mt-6 grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h2 className="font-semibold">{user.name ?? user.email}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <form action={updateUserAction} className="grid gap-3 sm:grid-cols-[160px_120px_auto]">
              <input type="hidden" name="userId" value={user.id} />
              <select name="role" defaultValue={user.role} className={selectClass}>
                {Object.values(RoleName).map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input name="isActive" type="checkbox" defaultChecked={user.isActive} className="size-4 accent-red-600" />
                Active
              </label>
              <Button>Save</Button>
            </form>
          </Card>
        ))}
      </div>
    </AdminFrame>
  );
}

async function ServicesAdmin() {
  const services = hasDatabaseUrl() ? await prisma.service.findMany({ include: { category: true, packages: true }, orderBy: { name: "asc" } }).catch(() => []) : [];

  return (
    <AdminFrame title="Edit Services And Pricing" description="Add or edit service categories, prices, delivery times, and package details without touching code.">
      <div className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <Card>
          <h2 className="text-xl font-semibold">Service editor</h2>
          <form action={saveServiceAction} className="mt-5 grid gap-4">
            <Input name="categoryName" placeholder="Category, e.g. Logo Design" required />
            <Input name="name" placeholder="Service name, e.g. Logo Design Package" required />
            <Textarea name="description" placeholder="Service description" required />
            <div className="grid gap-3 sm:grid-cols-3">
              <Input name="basePrice" type="number" min="1" placeholder="Base price" required />
              <Input name="turnaround" type="number" min="1" placeholder="Days" required />
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input name="active" type="checkbox" defaultChecked className="size-4 accent-red-600" />
                Active
              </label>
            </div>
            <Button>Save service</Button>
          </form>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">Package editor</h2>
          <form action={savePackageAction} className="mt-5 grid gap-4">
            <select name="serviceId" className={selectClass} required>
              <option value="">Choose service</option>
              {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
            </select>
            <Input name="name" placeholder="Package name, e.g. Premium" required />
            <Textarea name="description" placeholder="Package description" required />
            <div className="grid gap-3 sm:grid-cols-3">
              <Input name="price" type="number" min="1" placeholder="Price" required />
              <Input name="revisions" type="number" min="0" placeholder="Revisions" required />
              <Input name="deliveryDays" type="number" min="1" placeholder="Days" required />
            </div>
            <Input name="features" placeholder="Features separated by commas" />
            <Button>Save package</Button>
          </form>
        </Card>
      </div>
      <div className="mt-6">
        <DataTable title="Current services" rows={services.length ? services.map((service) => ({ Service: service.name, Category: service.category.name, Price: formatCurrency(String(service.basePrice)), Packages: service.packages.length, Active: service.active ? "Yes" : "No" })) : [{ Service: "No services", Category: "-", Price: "-", Packages: "-", Active: "-" }]} />
      </div>
    </AdminFrame>
  );
}

async function PortfolioAdmin() {
  const items = await getAdminPortfolioItems(30);
  const cloudinaryReady = hasCloudinaryConfig();

  return (
    <AdminFrame title="Portfolio Manager" description="Upload new work, edit project details, control publishing, and remove portfolio items from the public gallery.">
      <Card>
        <div className="mb-5">
          <h2 className="text-xl font-semibold">Add portfolio item</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {cloudinaryReady ? "Upload an image from your laptop or paste an image URL." : "Image upload needs Cloudinary settings on your hosting account. You can still paste an image URL."}
          </p>
        </div>
        <form action={savePortfolioAction} encType="multipart/form-data" className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="title" placeholder="Project title" required />
            <Input name="category" placeholder="Category" required />
          </div>
          <Textarea name="description" placeholder="Project description" required />
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="imageFile" type="file" accept="image/*" />
            <Input name="imageUrl" placeholder="Optional image URL" />
          </div>
          <Input name="tags" placeholder="Tags separated by commas" />
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input name="featured" type="checkbox" className="size-4 accent-red-600" />
              Feature this project
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input name="published" type="checkbox" defaultChecked className="size-4 accent-red-600" />
              Publish on website
            </label>
          </div>
          <Button>Save portfolio item</Button>
        </form>
      </Card>

      <div className="mt-6 grid gap-4">
        {items.length ? items.map((item) => (
          <Card key={item.id} className="grid gap-5 xl:grid-cols-[220px_1fr]">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black/25">
              <img src={item.imageUrl} alt={item.title} className="aspect-[4/3] w-full object-cover" />
            </div>
            <div className="grid gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{item.category}</p>
                  <h2 className="mt-1 text-xl font-semibold">{item.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.featured ? "Featured" : "Standard"} - {item.published ? "Published" : "Hidden"}
                  </p>
                </div>
                <form action={deletePortfolioAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <Button variant="destructive" size="sm">Delete</Button>
                </form>
              </div>

              <form action={savePortfolioAction} encType="multipart/form-data" className="grid gap-4">
                <input type="hidden" name="id" value={item.id} />
                <div className="grid gap-3 md:grid-cols-2">
                  <Input name="title" defaultValue={item.title} required />
                  <Input name="category" defaultValue={item.category} required />
                </div>
                <Textarea name="description" defaultValue={item.description} required />
                <div className="grid gap-3 md:grid-cols-2">
                  <Input name="imageFile" type="file" accept="image/*" />
                  <Input name="imageUrl" defaultValue={item.imageUrl} />
                </div>
                <Input name="tags" defaultValue={item.tags.join(", ")} placeholder="Tags separated by commas" />
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input name="featured" type="checkbox" defaultChecked={item.featured} className="size-4 accent-red-600" />
                      Featured
                    </label>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input name="published" type="checkbox" defaultChecked={item.published} className="size-4 accent-red-600" />
                      Published
                    </label>
                  </div>
                  <Button>Save changes</Button>
                </div>
              </form>
            </div>
          </Card>
        )) : <EmptyState text="No portfolio items yet. Add the first project above." />}
      </div>
    </AdminFrame>
  );
}

async function InboxAdmin() {
  const tickets = hasDatabaseUrl() ? await prisma.contactTicket.findMany({ orderBy: { createdAt: "desc" }, take: 40 }).catch(() => []) : [];

  return (
    <AdminFrame title="Contact Inbox" description="Read customer inquiries and mark each message by support status.">
      <div className="grid gap-4">
        {tickets.length ? tickets.map((ticket) => (
          <Card key={ticket.id} className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <p className="text-xs text-muted-foreground">{ticket.email}</p>
              <h2 className="mt-1 font-semibold">{ticket.subject}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{ticket.message}</p>
            </div>
            <form action={updateContactStatusAction} className="flex gap-3">
              <input type="hidden" name="ticketId" value={ticket.id} />
              <select name="status" defaultValue={ticket.status} className={selectClass}>
                {Object.values(TicketStatus).map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <Button>Update</Button>
            </form>
          </Card>
        )) : <EmptyState text="No contact messages yet." />}
      </div>
    </AdminFrame>
  );
}

async function PaymentsAdmin() {
  const payments = hasDatabaseUrl() ? await prisma.payment.findMany({ include: { order: true }, orderBy: { createdAt: "desc" }, take: 40 }).catch(() => []) : [];
  return (
    <AdminFrame title="Payments And Refunds" description="Monitor payment providers, receipts, failed transactions, and refund candidates.">
      <DataTable title="Payment history" rows={payments.length ? payments.map((payment) => ({ Provider: payment.provider, Status: payment.status, Amount: formatCurrency(String(payment.amount), payment.currency), Order: payment.order?.orderNumber ?? "-", Reference: payment.reference })) : [{ Provider: "-", Status: "No payments", Amount: "-", Order: "-", Reference: "-" }]} />
    </AdminFrame>
  );
}

async function MessagesAdmin() {
  const messages = hasDatabaseUrl() ? await prisma.message.findMany({ include: { sender: true, recipient: true }, orderBy: { createdAt: "desc" }, take: 40 }).catch(() => []) : [];
  return (
    <AdminFrame title="Messages Oversight" description="Review studio conversations, read receipts, and communication flow.">
      <DataTable title="Recent messages" rows={messages.length ? messages.map((message) => ({ From: message.sender.email, To: message.recipient.email, Read: message.readAt ? "Yes" : "No", Message: message.body.slice(0, 60) })) : [{ From: "-", To: "-", Read: "-", Message: "No messages yet" }]} />
    </AdminFrame>
  );
}

async function AnalyticsAdmin() {
  const [events, orders, payments, users] = hasDatabaseUrl()
    ? await Promise.all([
        prisma.analyticsEvent.findMany({ orderBy: { createdAt: "desc" }, take: 40 }).catch(() => []),
        prisma.order.groupBy({ by: ["status"], _count: { id: true } }).catch(() => []),
        prisma.payment.aggregate({ _sum: { amount: true }, _count: { id: true } }).catch(() => ({ _sum: { amount: 0 }, _count: { id: 0 } })),
        prisma.user.groupBy({ by: ["role"], _count: { id: true } }).catch(() => [])
      ])
    : [[], [], { _sum: { amount: 0 }, _count: { id: 0 } }, []];

  return (
    <AdminFrame title="Analytics" description="Track traffic events, order states, revenue, user roles, and conversion signals.">
      <StatGrid
        stats={[
          { label: "Tracked events", value: events.length },
          { label: "Payments", value: payments._count.id },
          { label: "Revenue", value: formatCurrency(String(payments._sum.amount ?? 0)) },
          { label: "User roles", value: users.length }
        ]}
      />
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <DataTable title="Orders by status" rows={orders.length ? orders.map((item) => ({ Status: item.status, Count: item._count.id })) : [{ Status: "No orders", Count: 0 }]} />
        <DataTable title="Users by role" rows={users.length ? users.map((item) => ({ Role: item.role, Count: item._count.id })) : [{ Role: "No users", Count: 0 }]} />
      </div>
      <div className="mt-6">
        <DataTable title="Recent analytics events" rows={events.length ? events.map((event) => ({ Event: event.name, Path: event.path ?? "-", Time: event.createdAt.toISOString() })) : [{ Event: "No events", Path: "-", Time: "-" }]} />
      </div>
    </AdminFrame>
  );
}

async function CmsAdmin() {
  const [pages, posts] = hasDatabaseUrl()
    ? await Promise.all([
        prisma.cmsPage.findMany({ orderBy: { updatedAt: "desc" }, take: 30 }).catch(() => []),
        prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" }, take: 30 }).catch(() => [])
      ])
    : [[], []];

  return (
    <AdminFrame title="CMS And Website Content" description="Edit website content, private CMS pages, SEO fields, and studio blog posts.">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-xl font-semibold">Page editor</h2>
          <form action={saveCmsPageAction} className="mt-5 grid gap-4">
            <Input name="title" placeholder="Page title" required />
            <Input name="slug" placeholder="Slug, e.g. about" />
            <Textarea name="body" placeholder="Page content" required />
            <Input name="seoTitle" placeholder="SEO title" />
            <Input name="seoDescription" placeholder="SEO description" />
            <Button>Save page</Button>
          </form>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">Blog editor</h2>
          <form action={saveBlogPostAction} className="mt-5 grid gap-4">
            <Input name="title" placeholder="Post title" required />
            <Input name="slug" placeholder="Slug" />
            <Input name="excerpt" placeholder="Short excerpt" required />
            <Textarea name="content" placeholder="Post content" required />
            <Input name="coverImage" placeholder="Cover image URL" />
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input name="published" type="checkbox" className="size-4 accent-red-600" />
              Publish
            </label>
            <Button>Save post</Button>
          </form>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <DataTable title="CMS pages" rows={pages.length ? pages.map((page) => ({ Title: page.title, Slug: page.slug, Published: page.published ? "Yes" : "No" })) : [{ Title: "No pages", Slug: "-", Published: "-" }]} />
        <DataTable title="Blog posts" rows={posts.length ? posts.map((post) => ({ Title: post.title, Slug: post.slug, Published: post.published ? "Yes" : "No" })) : [{ Title: "No posts", Slug: "-", Published: "-" }]} />
      </div>
    </AdminFrame>
  );
}

async function NotificationsAdmin() {
  const [notifications, subscribers] = hasDatabaseUrl()
    ? await Promise.all([
        prisma.notification.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 40 }).catch(() => []),
        prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" }, take: 40 }).catch(() => [])
      ])
    : [[], []];

  return (
    <AdminFrame title="Notifications And Announcements" description="Send studio-wide announcements and review notification history.">
      <Card>
        <form action={sendAnnouncementAction} className="grid gap-4">
          <Input name="title" placeholder="Announcement title" required />
          <Textarea name="body" placeholder="Announcement message" required />
          <Input name="href" placeholder="Optional link, e.g. /dashboard/client/orders" />
          <Button>Send announcement</Button>
        </form>
      </Card>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <DataTable title="Recent notifications" rows={notifications.length ? notifications.map((item) => ({ User: item.user.email, Type: item.type, Title: item.title, Read: item.readAt ? "Yes" : "No" })) : [{ User: "-", Type: "-", Title: "No notifications", Read: "-" }]} />
        <DataTable title="Newsletter subscribers" rows={subscribers.length ? subscribers.map((item) => ({ Email: item.email, Active: item.active ? "Yes" : "No", Joined: item.createdAt.toISOString() })) : [{ Email: "No subscribers", Active: "-", Joined: "-" }]} />
      </div>
    </AdminFrame>
  );
}

async function SecurityAdmin() {
  const [logs, toggles] = hasDatabaseUrl()
    ? await Promise.all([
        prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 40 }).catch(() => []),
        prisma.featureToggle.findMany({ orderBy: { key: "asc" } }).catch(() => [])
      ])
    : [[], []];
  return (
    <AdminFrame title="Security And System Health" description="Review audit logs, feature controls, rate limiting, and platform safety signals.">
      <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <Card>
          <h2 className="text-xl font-semibold">Feature toggle</h2>
          <form action={saveFeatureToggleAction} className="mt-5 grid gap-4">
            <Input name="key" placeholder="Feature key" required />
            <Input name="description" placeholder="Description" />
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input name="enabled" type="checkbox" className="size-4 accent-red-600" />
              Enabled
            </label>
            <Button>Save toggle</Button>
          </form>
        </Card>
        <DataTable title="Feature toggles" rows={toggles.length ? toggles.map((toggle) => ({ Key: toggle.key, Enabled: toggle.enabled ? "Yes" : "No", Description: toggle.description ?? "-" })) : [{ Key: "No toggles", Enabled: "-", Description: "-" }]} />
      </div>
      <div className="mt-6">
        <DataTable title="Audit logs" rows={logs.length ? logs.map((log) => ({ Action: log.action, Entity: log.entity, EntityId: log.entityId ?? "-", Time: log.createdAt.toISOString() })) : [{ Action: "No audit logs", Entity: "-", EntityId: "-", Time: "-" }]} />
      </div>
    </AdminFrame>
  );
}

async function BackupsAdmin() {
  const [users, orders, services, payments, files] = hasDatabaseUrl()
    ? await Promise.all([
        prisma.user.count().catch(() => 0),
        prisma.order.count().catch(() => 0),
        prisma.service.count().catch(() => 0),
        prisma.payment.count().catch(() => 0),
        prisma.assetFile.count().catch(() => 0)
      ])
    : [0, 0, 0, 0, 0];

  return (
    <AdminFrame title="Backups And Exports" description="Review export-ready data groups for users, orders, services, payments, files, and operational records.">
      <StatGrid
        stats={[
          { label: "Users export", value: users, helper: "CSV-ready" },
          { label: "Orders export", value: orders, helper: "CSV/PDF-ready" },
          { label: "Services export", value: services, helper: "Catalog backup" },
          { label: "Files indexed", value: files, helper: "Cloudinary records" }
        ]}
      />
      <div className="mt-6">
        <DataTable title="Backup plan" rows={[
          { Data: "Users", Frequency: "Daily", Method: "Database export", Records: users },
          { Data: "Orders", Frequency: "Daily", Method: "Database export", Records: orders },
          { Data: "Payments", Frequency: "Daily", Method: "Provider reconciliation", Records: payments },
          { Data: "Services and CMS", Frequency: "Weekly", Method: "JSON snapshot", Records: services }
        ]} />
      </div>
    </AdminFrame>
  );
}

async function SettingsAdmin() {
  const settings = hasDatabaseUrl() ? await prisma.setting.findMany({ orderBy: { key: "asc" } }).catch(() => []) : [];
  return (
    <AdminFrame title="Site Settings" description="Edit simple global values for SEO, email, theme, and studio configuration.">
      <Card>
        <form action={saveSettingAction} className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
          <Input name="key" placeholder="Setting key" required />
          <Input name="group" placeholder="Group" defaultValue="global" required />
          <Input name="value" placeholder="Value" required />
          <Button>Save setting</Button>
        </form>
      </Card>
      <div className="mt-6">
        <DataTable title="Settings" rows={settings.length ? settings.map((setting) => ({ Key: setting.key, Group: setting.group, Value: JSON.stringify(setting.value) })) : [{ Key: "No settings", Group: "-", Value: "-" }]} />
      </div>
    </AdminFrame>
  );
}

function AdminFrame({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Admin control</p>
        <h1 className="mt-2 text-3xl font-black">{title}</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <Card><p className="text-sm text-muted-foreground">{text}</p></Card>;
}

async function OrdersAdminV2() {
  const [orders, designers] = hasDatabaseUrl()
    ? await Promise.all([
        prisma.order.findMany({ include: { client: true, designer: true, service: true, files: true }, orderBy: { createdAt: "desc" }, take: 30 }).catch(() => []),
        prisma.user.findMany({ where: { role: "DESIGNER", isActive: true }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }).catch(() => [])
      ])
    : [[], []];

  return (
    <AdminFrame title="Order Assignment And Status" description="Assign designers, update project status, track deadlines, and keep clients informed.">
      <StatGrid stats={[{ label: "Total orders", value: orders.length }, { label: "Assigned", value: orders.filter((order) => Boolean(order.designerId)).length }, { label: "In review", value: orders.filter((order) => order.status === "IN_REVIEW").length }, { label: "Completed", value: orders.filter((order) => order.status === "COMPLETED").length }]} />
      <div className="mt-6 grid gap-4">
        {orders.length ? orders.map((order) => {
          const deliverables = order.files.filter((file) => file.kind === "DELIVERABLE");
          return (
            <Card key={order.id} className="grid gap-5">
              <div>
                <p className="text-xs text-muted-foreground">{order.orderNumber} - {order.service.name}</p>
                <h2 className="mt-1 text-xl font-semibold">{order.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">Client: {order.client.name ?? order.client.email} - Designer: {order.designer?.name ?? "Unassigned"} - Budget: {formatCurrency(String(order.budget))}</p>
              </div>
              <div className="grid gap-3 xl:grid-cols-2">
                <form action={assignOrderAction} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input type="hidden" name="orderId" value={order.id} />
                  <select name="designerId" defaultValue={order.designerId ?? ""} className={selectClass} required>
                    <option value="">Assign designer</option>
                    {designers.map((designer) => <option key={designer.id} value={designer.id}>{designer.name ?? designer.email}</option>)}
                  </select>
                  <Button>Assign</Button>
                </form>
                <form action={updateOrderStatusAction} className="grid gap-3 sm:grid-cols-[170px_1fr_auto]">
                  <input type="hidden" name="orderId" value={order.id} />
                  <select name="status" defaultValue={order.status} className={selectClass}>
                    {Object.values(OrderStatus).map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <Input name="note" placeholder="Status note" />
                  <Button>Update</Button>
                </form>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <h3 className="font-semibold">Design delivery</h3>
                <form action={uploadCompletedDesignAction} encType="multipart/form-data" className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
                  <input type="hidden" name="orderId" value={order.id} />
                  <Input name="deliverable" type="file" accept="image/*,.pdf,.zip" required />
                  <Input name="note" placeholder="Client update note" defaultValue="Watermarked preview uploaded for client review" />
                  <Button>Upload completed design</Button>
                </form>

                <div className="mt-4 grid gap-3">
                  {deliverables.length ? deliverables.map((file) => (
                    <div key={file.id} className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 lg:grid-cols-[1fr_auto] lg:items-center">
                      <div>
                        <p className="text-sm font-medium">{file.publicId}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {file.downloadAuthorized ? "Original download is unlocked for the client." : "Client can only view the watermarked preview."}
                        </p>
                        {file.previewSecureUrl ? (
                          <a href={file.previewSecureUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm font-semibold text-primary">View watermarked preview</a>
                        ) : (
                          <p className="mt-2 text-sm text-muted-foreground">Preview not available for this file type.</p>
                        )}
                      </div>
                      {file.downloadAuthorized ? (
                        <Button asChild variant="outline">
                          <a href={file.secureUrl} target="_blank" rel="noreferrer">Open original</a>
                        </Button>
                      ) : (
                        <form action={authorizeDeliverableDownloadAction}>
                          <input type="hidden" name="fileId" value={file.id} />
                          <Button>Authorize Download</Button>
                        </form>
                      )}
                    </div>
                  )) : <p className="text-sm text-muted-foreground">No completed designs uploaded yet.</p>}
                </div>
              </div>
            </Card>
          );
        }) : <EmptyState text="No orders yet." />}
      </div>
    </AdminFrame>
  );
}
