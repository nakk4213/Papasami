import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "@/components/forms";
import { PublicShell } from "@/components/public-shell";
import { Card, Section } from "@/components/ui/card";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <PublicShell>
      <Section className="max-w-xl">
        <Card>
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Login to manage orders, messages, payments, and files.</p>
          <div className="mt-6"><LoginForm /></div>
          <p className="mt-4 text-sm text-muted-foreground">No account? <Link className="text-primary" href="/register">Create one</Link></p>
        </Card>
      </Section>
    </PublicShell>
  );
}
