import "server-only";

import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { hasDatabaseUrl } from "@/lib/env";
import { slugify } from "@/lib/utils";

export type PortfolioRecord = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  imageUrl: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

const localPortfolioPath = path.join(process.cwd(), "data", "portfolio-items.json");

function sortPortfolio(items: PortfolioRecord[]) {
  return [...items].sort((a, b) => Number(b.featured) - Number(a.featured) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function normalizeDbItem(item: {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  imageUrl: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}): PortfolioRecord {
  return {
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString()
  };
}

async function readLocalPortfolio() {
  try {
    const data = await readFile(localPortfolioPath, "utf8");
    return JSON.parse(data) as PortfolioRecord[];
  } catch {
    return [];
  }
}

async function writeLocalPortfolio(items: PortfolioRecord[]) {
  await mkdir(path.dirname(localPortfolioPath), { recursive: true });
  await writeFile(localPortfolioPath, JSON.stringify(sortPortfolio(items), null, 2));
}

export async function getAdminPortfolioItems(take = 30) {
  if (hasDatabaseUrl()) {
    try {
      const items = await prisma.portfolioItem.findMany({ orderBy: { createdAt: "desc" }, take });
      return items.map(normalizeDbItem);
    } catch {
      return sortPortfolio(await readLocalPortfolio()).slice(0, take);
    }
  }
  return sortPortfolio(await readLocalPortfolio()).slice(0, take);
}

export async function getPublishedPortfolioItems(take = 60) {
  if (hasDatabaseUrl()) {
    try {
      const items = await prisma.portfolioItem.findMany({
        where: { published: true },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take
      });
      return items.map(normalizeDbItem);
    } catch {
      return sortPortfolio(await readLocalPortfolio()).filter((item) => item.published).slice(0, take);
    }
  }
  return sortPortfolio(await readLocalPortfolio()).filter((item) => item.published).slice(0, take);
}

export async function saveLocalPortfolioItem(input: {
  id?: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  tags: string[];
  featured: boolean;
  published: boolean;
}) {
  const items = await readLocalPortfolio();
  const now = new Date().toISOString();
  const index = input.id ? items.findIndex((item) => item.id === input.id) : -1;

  if (index >= 0) {
    items[index] = {
      ...items[index],
      title: input.title,
      category: input.category,
      description: input.description,
      imageUrl: input.imageUrl,
      tags: input.tags,
      featured: input.featured,
      published: input.published,
      updatedAt: now
    };
  } else {
    items.push({
      id: input.id || `local-${randomUUID()}`,
      title: input.title,
      slug: slugify(`${input.title}-${Date.now()}`),
      category: input.category,
      description: input.description,
      imageUrl: input.imageUrl,
      tags: input.tags,
      featured: input.featured,
      published: input.published,
      createdAt: now,
      updatedAt: now
    });
  }

  await writeLocalPortfolio(items);
}

export async function deleteLocalPortfolioItem(id: string) {
  const items = await readLocalPortfolio();
  await writeLocalPortfolio(items.filter((item) => item.id !== id));
}
