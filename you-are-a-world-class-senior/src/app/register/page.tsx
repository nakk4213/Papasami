import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/forms";
import { PublicShell } from "@/components/public-shell";
import { Card, Section } from "@/components/ui/card";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <PublicShell>
      <Section className="max-w-xl">
        <Card>
          <h1 className="text-3xl font-bold">Create your Papa Sami Studio account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Create a client account to request designs, track orders, upload files, and manage payments.</p>
          <div className="mt-6"><RegisterForm /></div>
          <p className="mt-4 text-sm text-muted-foreground">Already registered? <Link className="text-primary" href="/login">Login</Link></p>
        </Card>
      </Section>
    </PublicShell>
  );
}
