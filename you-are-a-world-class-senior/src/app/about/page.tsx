import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { Card, Section } from "@/components/ui/card";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <PublicShell>
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">About</p>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">A design operations studio built like software</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
          Papa Sami Studio blends creative direction, secure payments, asset management, and dashboard visibility so every client can move fast without losing polish.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {["Mission", "Values", "Team"].map((item) => (
            <Card key={item}>
              <h2 className="text-2xl font-bold">{item}</h2>
              <p className="mt-3 leading-7 text-muted-foreground">Premium craft, clear communication, accountable delivery, and useful systems for every project.</p>
            </Card>
          ))}
        </div>
      </Section>
    </PublicShell>
  );
}
