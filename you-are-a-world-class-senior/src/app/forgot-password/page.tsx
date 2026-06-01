import { PublicShell } from "@/components/public-shell";
import { Card, Section } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/forms";

export default function ForgotPasswordPage() {
  return (
    <PublicShell>
      <Section className="max-w-xl">
        <Card>
          <h1 className="text-3xl font-bold">Reset password</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Enter your account email and we will send a secure reset link if the account exists.</p>
          <ForgotPasswordForm />
        </Card>
      </Section>
    </PublicShell>
  );
}
