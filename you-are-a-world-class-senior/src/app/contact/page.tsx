import type { Metadata } from "next";
import { ContactForm } from "@/components/forms";
import { PublicShell } from "@/components/public-shell";
import { Card, Section } from "@/components/ui/card";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <PublicShell>
      <Section>
        <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Contact</p>
            <h1 className="mt-3 text-4xl font-black sm:text-5xl">Tell us what you are building</h1>
            <p className="mt-4 leading-7 text-muted-foreground">Send your inquiry and the studio team will reply with the next steps.</p>
            <Card className="mt-8">
              <h2 className="font-semibold">Studio location</h2>
              <div className="mt-4 aspect-video rounded-xl border border-white/10 bg-[linear-gradient(135deg,rgba(124,58,237,.25),rgba(37,99,235,.18))]" />
            </Card>
          </div>
          <Card>
            <ContactForm />
          </Card>
        </div>
      </Section>
    </PublicShell>
  );
}
