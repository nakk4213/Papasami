import Link from "next/link";
import type { Metadata } from "next";
import { ClientLoginForm } from "@/components/forms";
import { PublicShell } from "@/components/public-shell";
import { Card, Section } from "@/components/ui/card";

export const metadata: Metadata = { title: "Client Login" };

export default function ClientLoginPage() {
  return (
    <PublicShell>
      <Section className="max-w-xl">
        <Card>
          <h1 className="text-3xl font-bold">Client Login</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Access your orders, files, payments, messages, and project tracking.
          </p>
          <div className="mt-6">
            <ClientLoginForm />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            New client? <Link className="text-primary" href="/register">Create an account</Link>
          </p>
        </Card>
      </Section>
    </PublicShell>
  );
}
