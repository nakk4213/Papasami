import Link from "next/link";
import { auth } from "@/auth";
import type { Metadata } from "next";
import { DesignRequestForm } from "@/components/forms";
import { PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { Card, Section } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { hasDatabaseUrl } from "@/lib/env";

export const metadata: Metadata = { title: "Request Design" };

export default async function RequestDesignPage() {
  const session = await auth();
  const client = session?.user?.email && hasDatabaseUrl()
    ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { name: true, email: true, phone: true, role: true } }).catch(() => null)
    : null;
  const services = hasDatabaseUrl()
    ? await prisma.service.findMany({ where: { active: true }, select: { id: true, name: true, basePrice: true }, orderBy: { name: "asc" } }).catch(() => [])
    : [];

  return (
    <PublicShell>
      <Section>
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Design request</p>
            <h1 className="mt-3 text-4xl font-black sm:text-5xl">Start a project</h1>
            <p className="mt-4 leading-7 text-muted-foreground">Your client details are filled from your account. Choose a service, add the brief, upload assets, review the summary, then save a draft or submit the project.</p>
          </div>
          <Card>
            {!client ? (
              <div>
                <h2 className="text-2xl font-bold">Client account required</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">Create or log into your client account first so your name, email, and phone can be attached to the project automatically.</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button asChild><Link href="/register">Create account</Link></Button>
                  <Button asChild variant="outline"><Link href="/client-login">Client login</Link></Button>
                </div>
              </div>
            ) : client.role !== "CLIENT" ? (
              <p className="text-sm text-red-300">Only client accounts can submit design requests.</p>
            ) : !client.name || !client.phone ? (
              <div>
                <h2 className="text-2xl font-bold">Complete your client profile</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">Add your name and phone number before submitting a project.</p>
                <Button asChild className="mt-6"><Link href="/dashboard/client/profile">Update profile</Link></Button>
              </div>
            ) : (
              <DesignRequestForm services={services.map((service) => ({ ...service, basePrice: String(service.basePrice) }))} client={client} />
            )}
          </Card>
        </div>
      </Section>
    </PublicShell>
  );
}
