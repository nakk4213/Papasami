import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-bold">
            <span className="grid size-9 place-items-center rounded-xl bg-black">
              <Image src="/papa-sami-logo.png" alt="Papa Sami Studio logo" width={30} height={30} className="object-contain" />
            </span>
            Papa Sami Studio
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
            Premium graphic design marketplace for polished brands, campaigns, ministries, startups, and creators.
          </p>
        </div>
        <div>
          <h3 className="font-semibold">Platform</h3>
          <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
            <Link href="/services">Services</Link>
            <Link href="/portfolio">Portfolio</Link>
            <Link href="/request-design">Request Design</Link>
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Company</h3>
          <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/refund-policy">Refund Policy</Link>
            <Link href="/sitemap.xml">Sitemap</Link>
            <Link href="/robots.txt">Robots</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
