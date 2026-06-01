import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { Section } from "@/components/ui/card";
import { ServiceExplorer } from "@/components/forms";

export const metadata: Metadata = { title: "Services" };

export default function ServicesPage() {
  return (
    <PublicShell>
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Services</p>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">Graphic design services</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">Search, sort, filter, and order premium design categories with production-ready delivery.</p>
        <div className="mt-8">
          <ServiceExplorer />
        </div>
      </Section>
    </PublicShell>
  );
}
