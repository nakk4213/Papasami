import Link from "next/link";
import { ResetPasswordForm } from "@/components/forms";
import { PublicShell } from "@/components/public-shell";
import { Card, Section } from "@/components/ui/card";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;

  return (
    <PublicShell>
      <Section className="max-w-xl">
        <Card>
          <h1 className="text-3xl font-bold">Choose a new password</h1>
          {token ? (
            <>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Use a strong password with at least one capital letter and one number.</p>
              <ResetPasswordForm token={token} />
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              This reset link is missing a token. Request a new link from <Link className="text-primary" href="/forgot-password">forgot password</Link>.
            </p>
          )}
        </Card>
      </Section>
    </PublicShell>
  );
}
