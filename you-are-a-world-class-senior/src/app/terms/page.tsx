import { PublicShell } from "@/components/public-shell";
import { Card, Section } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <PublicShell>
      <Section>
        <Card>
          <h1 className="text-3xl font-black">Terms of Service</h1>
          <div className="mt-6 grid gap-4 text-sm leading-7 text-muted-foreground">
            <p>Papa Sami Studio provides custom graphic design services based on client briefs, agreed timelines, and confirmed project scope.</p>
            <p>Clients are responsible for supplying accurate text, brand assets, reference materials, and approvals. Revisions must remain within the original agreed scope unless a new quote is issued.</p>
            <p>Final design files are released after payment and project approval. Papa Sami Studio may display completed work in its portfolio unless a private-use agreement is made in writing.</p>
          </div>
        </Card>
      </Section>
    </PublicShell>
  );
}
