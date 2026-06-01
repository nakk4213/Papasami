import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card } from "@/components/ui/card";
import { ProfileForm } from "@/components/forms";
import { prisma } from "@/lib/db";
import { hasDatabaseUrl } from "@/lib/env";

export default async function ClientProfilePage() {
  const session = await auth();
  const user = session?.user?.email && hasDatabaseUrl()
    ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { name: true, phone: true, bio: true } }).catch(() => null)
    : null;

  return (
    <DashboardShell role="CLIENT">
      <Card>
        <h2 className="text-xl font-semibold">Profile and security</h2>
        <p className="mt-2 text-sm text-muted-foreground">Keep your contact details current so the studio can confirm project details and delivery notes.</p>
        <ProfileForm user={user ?? { name: "", phone: "", bio: "" }} />
      </Card>
    </DashboardShell>
  );
}
