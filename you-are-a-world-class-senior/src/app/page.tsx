import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, BarChart3, Clock, MessageSquare, ShieldCheck, Sparkles, UploadCloud } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { Card, Section } from "@/components/ui/card";
import { Reveal } from "@/components/motion";
import { NewsletterForm } from "@/components/forms";
import { portfolioItems, serviceCategories } from "@/lib/catalog";

export default function HomePage() {
  return (
    <PublicShell>
      <section className="relative overflow-hidden">
        <div className="premium-grid absolute inset-0 opacity-70" />
        <Section className="relative grid min-h-[calc(100vh-4rem)] items-center gap-10 py-20 lg:grid-cols-[1.05fr_.95fr]">
          <Reveal>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted-foreground">
                <Sparkles className="size-4 text-primary" />
                Premium design marketplace for serious brands
              </div>
              <h1 className="mt-6 max-w-4xl text-5xl font-black leading-tight tracking-normal sm:text-6xl lg:text-7xl">
                Papa Sami Studio
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Browse polished work, request custom graphics, pay securely, message designers, track delivery, and manage every creative asset from one luxury-grade dashboard.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/request-design">
                    Start a project <ArrowRight className="size-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/portfolio">View portfolio</Link>
                </Button>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-4 text-center">
                {[
                  ["4.9/5", "Average rating"],
                  ["2.4k+", "Projects shipped"],
                  ["48h", "Fast starts"]
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="text-2xl font-bold">{value}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid gap-4">
              <Image
                src="https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80"
                alt="Papa Sami Studio design board"
                width={1200}
                height={900}
                priority
                className="rounded-3xl border border-white/10 object-cover shadow-glow"
              />
              <div className="grid grid-cols-3 gap-4">
                {portfolioItems.slice(0, 3).map((item) => (
                  <Image key={item.title} src={item.image} alt={item.title} width={320} height={220} className="h-28 rounded-2xl border border-white/10 object-cover" />
                ))}
              </div>
            </div>
          </Reveal>
        </Section>
      </section>

      <Section>
        <Reveal>
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Services</p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Everything your visual campaign needs</h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/services">Explore all</Link>
            </Button>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {serviceCategories.slice(0, 8).map((service) => (
            <Reveal key={service}>
              <Card className="h-full transition hover:-translate-y-1 hover:border-primary/40">
                <BadgeCheck className="size-6 text-primary" />
                <h3 className="mt-4 font-semibold">{service}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Premium concepts, editable files, revisions, and delivery tracking.</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-6 lg:grid-cols-4">
          {[
            [UploadCloud, "Request", "Submit your brief, references, package, budget, and deadline."],
            [ShieldCheck, "Pay", "Stripe and Paystack checkout protect every transaction."],
            [MessageSquare, "Collaborate", "Message designers, review proofs, and request revisions."],
            [Clock, "Receive", "Download final files, invoices, and production assets."]
          ].map(([Icon, title, body]) => (
            <Card key={String(title)}>
              <Icon className="size-6 text-accent" />
              <h3 className="mt-4 text-xl font-semibold">{String(title)}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{String(body)}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Starting prices</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Choose the design you need</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">No subscription plans. Pick a design service, send your brief, and the studio will confirm the final cost before production.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/services">View services</Link>
          </Button>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["Flyer Design", "$49+", "Church, business, political, event, and social media flyers."],
            ["Logo Design", "$129+", "Clean brand marks for businesses, churches, campaigns, and creators."],
            ["Brand Kit", "$299+", "Logo system, colors, typography, social templates, and launch assets."]
          ].map(([title, price, body]) => (
            <Card key={title}>
              <h3 className="text-2xl font-bold">{title}</h3>
              <div className="mt-4 text-4xl font-black">{price}</div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{body}</p>
              <Button asChild className="mt-6 w-full">
                <Link href={`/request-design?service=${encodeURIComponent(title)}`}>Start this project</Link>
              </Button>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <Card>
            <BarChart3 className="size-7 text-primary" />
            <h2 className="mt-4 text-3xl font-bold">Built-in analytics from first click to final delivery.</h2>
            <p className="mt-4 leading-7 text-muted-foreground">Clients see project progress, payments, files, messages, revisions, and delivery history in one polished workspace.</p>
          </Card>
          <Card>
            <h3 className="text-xl font-semibold">FAQ</h3>
            <div className="mt-4 grid gap-4">
              {["Can I choose a designer?", "Are source files included?", "Do you support refunds?", "Can I track my project?"].map((question) => (
                <details key={question} className="rounded-xl border border-white/10 p-4">
                  <summary className="cursor-pointer font-medium">{question}</summary>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">Yes. The workflow supports managed requests, secure payments, revisions, files, invoices, messages, and delivery tracking.</p>
                </details>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      <Section>
        <Card className="grid gap-6 md:grid-cols-[.9fr_1.1fr] md:items-center">
          <div>
            <h2 className="text-3xl font-bold">Get design drops, launch ideas, and marketplace updates.</h2>
            <p className="mt-3 text-muted-foreground">No noise. Just useful creative operations notes.</p>
          </div>
          <NewsletterForm />
        </Card>
      </Section>
    </PublicShell>
  );
}
