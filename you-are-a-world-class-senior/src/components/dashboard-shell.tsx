import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, Bell, CreditCard, DatabaseBackup, FileImage, FileText, Heart, Home, Inbox, LogOut, Megaphone, MessageSquare, Package, PenLine, Settings, Shield, Users } from "lucide-react";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

const links = {
  CLIENT: [
    ["Overview", "/dashboard/client", Home],
    ["Orders", "/dashboard/client/orders", Package],
    ["Payments", "/dashboard/client/payments", CreditCard],
    ["Messages", "/dashboard/client/messages", MessageSquare],
    ["Saved", "/dashboard/client/saved", Heart],
    ["Profile", "/dashboard/client/profile", Settings]
  ],
  DESIGNER: [
    ["Overview", "/dashboard/designer", Home],
    ["Projects", "/dashboard/designer/projects", Package],
    ["Earnings", "/dashboard/designer/earnings", CreditCard],
    ["Messages", "/dashboard/designer/messages", MessageSquare],
    ["Reviews", "/dashboard/designer/reviews", Heart],
    ["Calendar", "/dashboard/designer/calendar", FileText]
  ],
  ADMIN: [
    ["Overview", "/admin", BarChart3],
    ["Orders", "/admin/orders", Package],
    ["Users", "/admin/users", Users],
    ["Services", "/admin/services", FileText],
    ["Portfolio", "/admin/portfolio", FileImage],
    ["Inbox", "/admin/inbox", Inbox],
    ["Payments", "/admin/payments", CreditCard],
    ["Messages", "/admin/messages", MessageSquare],
    ["Analytics", "/admin/analytics", BarChart3],
    ["CMS", "/admin/cms", PenLine],
    ["Notifications", "/admin/notifications", Megaphone],
    ["Security", "/admin/security", Shield],
    ["Backups", "/admin/backups", DatabaseBackup],
    ["Settings", "/admin/settings", Settings]
  ]
} as const;

export async function DashboardShell({ children, role }: { children: React.ReactNode; role: keyof typeof links }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== role) {
    if (session.user.role === "ADMIN") redirect("/admin");
    if (session.user.role === "DESIGNER") redirect("/dashboard/designer");
    redirect("/dashboard/client");
  }

  return (
    <div className="min-h-screen bg-[#050302]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-amber-200/10 bg-black/35 p-5 backdrop-blur-xl lg:block">
        <Link href="/" className="text-xl font-black">Papa Sami Studio</Link>
        <Link href="/" className="mt-5 flex items-center gap-3 rounded-xl border border-amber-200/15 px-3 py-2 text-sm text-muted-foreground transition hover:bg-primary/10 hover:text-white">
          <Home className="size-4" />
          Back to homepage
        </Link>
        <nav className="mt-8 grid gap-2">
          {links[role].map(([label, href, Icon]) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-primary/10 hover:text-white">
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction} className="absolute bottom-5 left-5 right-5">
          <Button variant="outline" className="w-full">
            <LogOut className="size-4" />
            Logout
          </Button>
        </form>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-amber-200/10 bg-[#050302]/85 px-4 backdrop-blur-xl sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">{role.toLowerCase()} dashboard</p>
            <h1 className="font-semibold">{session.user.name ?? session.user.email}</h1>
          </div>
          <Button size="icon" variant="ghost" aria-label="Notifications">
            <Bell className="size-5" />
          </Button>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
