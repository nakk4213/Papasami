import "server-only";
import { headers } from "next/headers";
import { RoleName } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const buckets = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  bucket.count += 1;
  if (bucket.count > limit) throw new Error("Too many requests. Please slow down and try again.");
}

export function sanitizeText(value: string) {
  return value.replace(/[<>]/g, "").trim();
}

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

export async function requireRole(roles: RoleName[]) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Authentication required");
  if (process.env.NODE_ENV !== "production" && session.user.id.startsWith("local-") && roles.includes(session.user.role)) {
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name ?? null,
      image: session.user.image ?? null,
      role: session.user.role,
      emailVerified: new Date(),
      passwordHash: null,
      phone: null,
      bio: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } }).catch(() => null);
  if (!user && process.env.NODE_ENV !== "production" && roles.includes(session.user.role)) {
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name ?? null,
      image: session.user.image ?? null,
      role: session.user.role,
      emailVerified: new Date(),
      passwordHash: null,
      phone: null,
      bio: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  if (!user || !roles.includes(user.role)) throw new Error("You do not have permission to access this resource");
  return user;
}
