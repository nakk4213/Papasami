"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Heart, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { portfolioItems } from "@/lib/catalog";

export function PortfolioGallery() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [active, setActive] = useState<(typeof portfolioItems)[number] | null>(null);
  const categories = ["All", ...Array.from(new Set(portfolioItems.map((item) => item.category)))];
  const items = useMemo(
    () => portfolioItems.filter((item) => (category === "All" || item.category === category) && item.title.toLowerCase().includes(query.toLowerCase())),
    [category, query]
  );

  return (
    <>
      <div className="grid gap-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search portfolio" className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none md:w-80" />
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <Button key={item} type="button" variant={item === category ? "default" : "outline"} size="sm" onClick={() => setCategory(item)}>
                {item}
              </Button>
            ))}
          </div>
        </div>
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {items.map((item, index) => (
            <Card key={item.title} className="mb-5 break-inside-avoid p-3">
              <button onClick={() => setActive(item)} className="group block w-full overflow-hidden rounded-xl text-left">
                <Image src={item.image} alt={item.title} width={900} height={index % 2 ? 1100 : 760} className="w-full object-cover transition duration-500 group-hover:scale-105" />
              </button>
              <div className="flex items-center justify-between p-3">
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" aria-label="Save design">
                    <Heart className="size-4" />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label="Share design" onClick={() => navigator.share?.({ title: item.title, url: location.href })}>
                    <Share2 className="size-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      {active ? (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/80 p-4 backdrop-blur">
          <div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[#070817]">
            <Button className="absolute right-3 top-3 z-10" size="icon" variant="secondary" onClick={() => setActive(null)} aria-label="Close preview">
              <X className="size-4" />
            </Button>
            <Image src={active.image} alt={active.title} width={1200} height={850} className="max-h-[76vh] w-full object-cover" />
            <div className="p-5">
              <h2 className="text-2xl font-semibold">{active.title}</h2>
              <p className="text-muted-foreground">{active.category}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
