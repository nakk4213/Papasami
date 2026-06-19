import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { Section } from "@/components/ui/card";
import { PortfolioGallery } from "@/components/portfolio-gallery";
import { getPublishedPortfolioItems } from "@/lib/portfolio-store";

export const metadata: Metadata = { title: "Portfolio" };
export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const items = await getPublishedPortfolioItems(60);

  return (
    <PublicShell>
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Portfolio</p>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">Interactive design gallery</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">Browse featured projects, save inspiration, share work, and preview designs in a focused modal.</p>
        <div className="mt-8">
          <PortfolioGallery items={items.map((item) => ({ title: item.title, category: item.category, image: item.imageUrl }))} />
        </div>
      </Section>
    </PublicShell>
  );
}
