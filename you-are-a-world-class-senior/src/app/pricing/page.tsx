import Link from "next/link";
import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { Card, Section } from "@/components/ui/card";
import { packages } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <PublicShell>
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Pricing</p>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">Packages that scale from single flyers to full campaigns</h1>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {packages.map((pack) => (
            <Card key={pack.name}>
              <h2 className="text-2xl font-bold">{pack.name}</h2>
              <div className="mt-4 text-5xl font-black">{formatCurrency(pack.price)}</div>
              <p className="text-sm text-muted-foreground">{pack.cadence}</p>
              <ul className="mt-6 grid gap-3 text-sm text-muted-foreground">
                {pack.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <BadgeCheck className="size-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-6 w-full">
                <Link href="/request-design">Start checkout</Link>
              </Button>
            </Card>
          ))}
        </div>
        <Card className="mt-8">
          <h2 className="text-2xl font-bold">Feature comparison and coupons</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-muted-foreground">
                <tr><th className="py-3">Feature</th><th>Starter</th><th>Growth</th><th>Signature</th></tr>
              </thead>
              <tbody>
                {["Secure payment", "Invoices", "Source files", "Priority delivery", "Creative direction", "Promo code support"].map((row) => (
                  <tr key={row} className="border-t border-white/10"><td className="py-3">{row}</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Section>
    </PublicShell>
  );
}
