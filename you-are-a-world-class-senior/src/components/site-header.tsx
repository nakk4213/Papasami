"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const nav = [
  ["Home", "/"],
  ["Services", "/services"],
  ["Portfolio", "/portfolio"],
  ["About", "/about"],
  ["Contact", "/contact"]
];

export function SiteHeader() {
  const { data } = useSession();
  const [open, setOpen] = useState(false);
  const dashboard = data?.user?.role === "ADMIN" ? "/admin" : data?.user?.role === "DESIGNER" ? "/dashboard/designer" : "/dashboard/client";

  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 border-b border-amber-200/10 bg-[#050302]/85 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-wide">
          <span className="grid size-10 place-items-center rounded-xl border border-amber-200/15 bg-black shadow-glow">
            <Image src="/papa-sami-logo.png" alt="Papa Sami Studio logo" width={34} height={34} className="object-contain" priority />
          </span>
          Papa Sami Studio
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="transition hover:text-white">
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {data?.user ? (
            <Button asChild size="sm">
              <Link href={dashboard}>Dashboard</Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href="/request-design">Start Project</Link>
            </Button>
          )}
        </div>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((value) => !value)}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>
      {open ? (
        <div className="border-t border-amber-200/10 bg-[#050302] px-4 py-4 md:hidden">
          <nav className="grid gap-2 text-sm text-muted-foreground">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-xl px-3 py-2 transition hover:bg-white/10 hover:text-white" onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
            <Link href={data?.user ? dashboard : "/request-design"} className="mt-2 rounded-xl bg-primary px-3 py-2 text-center font-semibold text-white" onClick={() => setOpen(false)}>
              {data?.user ? "Dashboard" : "Start Project"}
            </Link>
          </nav>
        </div>
      ) : null}
    </motion.header>
  );
}
