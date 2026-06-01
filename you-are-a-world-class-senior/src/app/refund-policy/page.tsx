import { PublicShell } from "@/components/public-shell";
import { Card, Section } from "@/components/ui/card";

export default function RefundPolicyPage() {
  return (
    <PublicShell>
      <Section>
        <Card>
          <h1 className="text-3xl font-black">Refund Policy</h1>
          <div className="mt-6 grid gap-4 text-sm leading-7 text-muted-foreground">
            <p>Refund eligibility depends on project stage. Orders not yet assigned or started may qualify for a full or partial refund.</p>
            <p>Once design work has begun, refunds are reviewed based on time spent, delivered concepts, and project scope. Completed and approved designs are not refundable.</p>
            <p>Disputes are reviewed by the studio admin team with the order brief, messages, submitted files, and delivery history.</p>
          </div>
        </Card>
      </Section>
    </PublicShell>
  );
}
