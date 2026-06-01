import { PublicShell } from "@/components/public-shell";
import { Card, Section } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <PublicShell>
      <Section>
        <Card>
          <h1 className="text-3xl font-black">Privacy Policy</h1>
          <div className="mt-6 grid gap-4 text-sm leading-7 text-muted-foreground">
            <p>Papa Sami Studio collects account, contact, order, payment, and uploaded project information only to deliver design services and operate the platform.</p>
            <p>Payment details are processed by secure providers such as Stripe and Paystack. The studio does not store full card details.</p>
            <p>Client files and project conversations are treated as confidential and are only available to authorized client, designer, and admin accounts.</p>
          </div>
        </Card>
      </Section>
    </PublicShell>
  );
}
