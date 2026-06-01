import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { Card, Section } from "@/components/ui/card";

export default function NotFound() {
  return (
    <PublicShell>
      <Section className="max-w-xl">
        <Card>
          <h1 className="text-3xl font-bold">Page not found</h1>
          <p className="mt-3 text-muted-foreground">That route is not available in Papa Sami Studio.</p>
          <Button asChild className="mt-6"><Link href="/">Go home</Link></Button>
        </Card>
      </Section>
    </PublicShell>
  );
}
