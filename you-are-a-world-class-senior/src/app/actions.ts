"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import fs from "fs/promises";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import path from "path";
import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { hasDatabaseUrl } from "@/lib/env";
import { clientIp, rateLimit, sanitizeText } from "@/lib/security";
import { contactSchema, designRequestSchema, newsletterSchema, registerSchema } from "@/lib/validation";
import { orderNumber } from "@/lib/utils";

type ActionResult = { ok?: boolean; message?: string };

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function registerAction(_: unknown, formData: FormData): Promise<ActionResult> {
  const ip = await clientIp();
  await rateLimit(`register:${ip}`, 5, 60_000);
  if (!hasDatabaseUrl()) return { ok: false, message: "Registration is temporarily unavailable." };
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password")
  });
  if (!parsed.success) return { ok: false, message: "Please check your registration details." };

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return { ok: false, message: "An account already exists for this email." };

  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: sanitizeText(parsed.data.name),
        passwordHash,
        role: "CLIENT",
        emailVerified: new Date()
      }
    });
    await sendEmail({
      to: parsed.data.email,
      subject: "Welcome to Papa Sami Studio",
      html: `<p>Your Papa Sami Studio account is ready. You can now request premium design projects and track every order.</p>`
    });
    await signIn("credentials", { email: parsed.data.email, password: parsed.data.password, redirectTo: "/request-design" });
    return { ok: true };
  } catch (error) {
    const digest = error instanceof Error && "digest" in error ? String(error.digest) : "";
    if (digest.startsWith("NEXT_REDIRECT")) throw error;
    return { ok: false, message: "Account was created, but automatic login failed. Please use Client Login." };
  }
}

export async function loginAction(_: unknown, formData: FormData): Promise<ActionResult> {
  await rateLimit(`login:${await clientIp()}`, 10, 60_000);
  if (!hasDatabaseUrl()) {
    return { ok: false, message: "Database is not connected yet. Add DATABASE_URL, then run db:push and db:seed before logging in." };
  }

  try {
    const email = String(formData.get("email") ?? "");
    const user = await prisma.user.findUnique({ where: { email }, select: { role: true } });
    const redirectTo = user?.role === "ADMIN" ? "/admin" : user?.role === "DESIGNER" ? "/dashboard/designer" : "/dashboard/client";

    await signIn("credentials", {
      email,
      password: formData.get("password"),
      redirectTo
    });
    return { ok: true };
  } catch (error) {
    const digest = error instanceof Error && "digest" in error ? String(error.digest) : "";
    if (digest.startsWith("NEXT_REDIRECT")) throw error;
    return { ok: false, message: "Login failed. Check your email, password, and database connection." };
  }
}

export async function clientLoginAction(_: unknown, formData: FormData): Promise<ActionResult> {
  await rateLimit(`client-login:${await clientIp()}`, 10, 60_000);
  if (!hasDatabaseUrl()) {
    return { ok: false, message: "Database is not connected yet." };
  }

  try {
    const email = String(formData.get("email") ?? "");
    const user = await prisma.user.findUnique({ where: { email }, select: { role: true } });
    if (!user || user.role !== "CLIENT") {
      return { ok: false, message: "This login is for client accounts only." };
    }

    await signIn("credentials", {
      email,
      password: formData.get("password"),
      redirectTo: "/dashboard/client"
    });
    return { ok: true };
  } catch (error) {
    const digest = error instanceof Error && "digest" in error ? String(error.digest) : "";
    if (digest.startsWith("NEXT_REDIRECT")) throw error;
    return { ok: false, message: "Client login failed. Check your email and password." };
  }
}

export async function googleLoginAction(): Promise<ActionResult> {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return { ok: false, message: "Google sign-in is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it." };
  }

  try {
    await signIn("google", { redirectTo: "/dashboard/client" });
    return { ok: true };
  } catch (error) {
    const digest = error instanceof Error && "digest" in error ? String(error.digest) : "";
    if (digest.startsWith("NEXT_REDIRECT")) throw error;
    return { ok: false, message: "Google sign-in failed. Please try again." };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function newsletterAction(_: unknown, formData: FormData): Promise<ActionResult> {
  if (!hasDatabaseUrl()) return { ok: false, message: "Newsletter is temporarily unavailable." };
  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { ok: false, message: "Enter a valid email address." };
  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      update: { active: true },
      create: { email: parsed.data.email }
    });
    return { ok: true, message: "You are on the Papa Sami Studio list." };
  } catch {
    return { ok: false, message: "Newsletter signup is temporarily unavailable." };
  }
}

export async function contactAction(_: unknown, formData: FormData): Promise<ActionResult> {
  await rateLimit(`contact:${await clientIp()}`, 8, 60_000);
  if (!hasDatabaseUrl()) return { ok: false, message: "Contact form is temporarily unavailable." };
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message")
  });
  if (!parsed.success) return { ok: false, message: "Please complete the contact form correctly." };
  try {
    await prisma.contactTicket.create({
      data: {
        name: sanitizeText(parsed.data.name),
        email: parsed.data.email,
        subject: sanitizeText(parsed.data.subject),
        message: sanitizeText(parsed.data.message)
      }
    });
    await sendEmail({
      to: process.env.APP_EMAIL_FROM?.match(/<(.+)>/)?.[1] ?? parsed.data.email,
      subject: `Papa Sami Studio contact: ${parsed.data.subject}`,
      html: `<p>${sanitizeText(parsed.data.message)}</p><p>From ${sanitizeText(parsed.data.name)} (${parsed.data.email})</p>`
    });
    return { ok: true, message: "Message received. We will reply shortly." };
  } catch {
    return { ok: false, message: "We could not send your message. Please try again." };
  }
}

export async function designRequestAction(_: unknown, formData: FormData): Promise<ActionResult> {
  if (!hasDatabaseUrl()) return { ok: false, message: "Ordering is temporarily unavailable." };
  const parsed = designRequestSchema.safeParse({
    serviceId: formData.get("serviceId"),
    projectName: formData.get("projectName"),
    requirements: formData.get("requirements"),
    deadline: formData.get("deadline"),
    references: formData.get("references") || undefined
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid design request." };

  const session = await auth();
  if (!session?.user?.email) return { ok: false, message: "Please create or log into your client account before submitting a project." };

  const service = await prisma.service.findUnique({ where: { id: parsed.data.serviceId }, include: { category: true } });
  if (!service || !service.active) return { ok: false, message: "Choose an available design type." };

  const client = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!client || client.role !== "CLIENT") return { ok: false, message: "Only client accounts can submit design requests." };
  if (!client.name || !client.phone) return { ok: false, message: "Please complete your profile name and phone number before submitting a project." };

  const intent = String(formData.get("intent") ?? "submit");
  const isDraft = intent === "draft";
  const deadline = new Date(parsed.data.deadline);

  const order = await prisma.order.create({
    data: {
      orderNumber: orderNumber(),
      clientId: client.id,
      serviceId: parsed.data.serviceId,
      title: sanitizeText(parsed.data.projectName),
      requirements: [
        sanitizeText(parsed.data.requirements),
        parsed.data.references ? `References: ${sanitizeText(parsed.data.references)}` : null,
        `Client: ${client.name}`,
        `Email: ${client.email}`,
        `Phone: ${client.phone}`,
        `Design type: ${service.name}`
      ].filter(Boolean).join("\n\n"),
      deadline,
      budget: service.basePrice,
      status: isDraft ? "DRAFT" : "PENDING_PAYMENT",
      events: { create: { status: isDraft ? "DRAFT" : "PENDING_PAYMENT", note: isDraft ? "Project draft saved" : "Design request submitted" } }
    }
  });

  await persistOrderUploads(order.id, client.id, formData.getAll("assets"));

  if (isDraft) {
    revalidatePath("/dashboard/client/orders");
    redirect(`/dashboard/client/projects/${order.id}`);
  }

  await prisma.notification.create({
    data: { userId: client.id, type: "ORDER", title: "Design request received", body: `${order.title} is ready for payment.`, href: `/dashboard/client/orders` }
  });
  await sendEmail({ to: client.email, subject: `Order ${order.orderNumber} received`, html: `<p>Your request for ${order.title} has been received.</p>` });
  const adminRecipients = await prisma.user.findMany({ where: { role: "ADMIN", isActive: true }, select: { email: true } });
  const adminUsers = await prisma.user.findMany({ where: { role: "ADMIN", isActive: true }, select: { id: true, email: true } });
  if (adminUsers.length) {
    await prisma.notification.createMany({
      data: adminUsers.map((admin) => ({
        userId: admin.id,
        type: "ORDER",
        title: "New design request",
        body: `${order.orderNumber}: ${order.title}`,
        href: "/admin/orders"
      }))
    });
  }
  const explicitAdminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  const recipients = [...adminRecipients.map((admin) => admin.email), ...(explicitAdminEmail ? [explicitAdminEmail] : [])];
  await Promise.all(
    Array.from(new Set(recipients)).map((email) =>
      sendEmail({
        to: email,
        subject: `New design request: ${order.orderNumber}`,
        html: `<p>A new design request was submitted.</p><p><strong>${sanitizeText(order.title)}</strong></p><p>Client: ${client.name ?? client.email}</p><p>Email: ${client.email}</p><p>Phone: ${client.phone ?? "-"}</p><p>Price: ${service.basePrice}</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000"}/admin/orders">Open admin orders</a></p>`
      })
    )
  );
  revalidatePath("/dashboard/client");
  revalidatePath("/admin/orders");
  redirect(`/dashboard/client/projects/${order.id}`);
}

async function persistOrderUploads(orderId: string, ownerId: string, entries: FormDataEntryValue[]) {
  const files = entries.filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (!files.length) return;

  const uploadRoot = path.join(process.cwd(), "public", "uploads", orderId);
  await fs.mkdir(uploadRoot, { recursive: true });

  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) continue;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const publicId = `${Date.now()}-${safeName}`;
    const target = path.join(uploadRoot, publicId);
    const bytes = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(target, bytes);
    const url = `/uploads/${orderId}/${publicId}`;

    await prisma.assetFile.create({
      data: {
        ownerId,
        orderId,
        publicId,
        url,
        secureUrl: url,
        resourceType: "file",
        bytes: file.size,
        mimeType: file.type || "application/octet-stream",
        kind: "REFERENCE"
      }
    });
  }
}

export async function requestRevisionAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) return;
  const orderId = String(formData.get("orderId") ?? "");
  const note = sanitizeText(String(formData.get("note") ?? ""));
  if (!orderId || !note) return;

  const order = await prisma.order.findFirst({ where: { id: orderId, client: { email: session.user.email } }, include: { designer: true, client: true } });
  if (!order) return;

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "REVISION_REQUESTED",
      revisionCount: { increment: 1 },
      events: { create: { status: "REVISION_REQUESTED", note } }
    }
  });
  if (order.designerId) {
    await prisma.notification.create({
      data: { userId: order.designerId, type: "ORDER", title: "Revision requested", body: `${order.title}: ${note}`, href: "/dashboard/designer/projects" }
    });
  }
  revalidatePath("/dashboard/client/orders");
  revalidatePath("/dashboard/designer/projects");
}

export async function approveOrderAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) return;
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) return;

  const order = await prisma.order.findFirst({ where: { id: orderId, client: { email: session.user.email } }, include: { designer: true } });
  if (!order) return;

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "COMPLETED",
      events: { create: { status: "COMPLETED", note: "Final design approved by client" } }
    }
  });
  if (order.designerId) {
    await prisma.notification.create({
      data: { userId: order.designerId, type: "ORDER", title: "Design approved", body: `${order.title} was approved by the client.`, href: "/dashboard/designer/projects" }
    });
  }
  revalidatePath("/dashboard/client/orders");
  revalidatePath("/dashboard/designer/projects");
}

export async function uploadDeliverableAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) return;
  const orderId = String(formData.get("orderId") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  const note = sanitizeText(String(formData.get("note") ?? "Final design uploaded"));
  if (!orderId || !url.startsWith("http")) return;

  const designer = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, role: true } });
  if (!designer || designer.role !== "DESIGNER") return;
  const order = await prisma.order.findFirst({ where: { id: orderId, designerId: designer.id }, include: { client: true } });
  if (!order) return;

  await prisma.assetFile.create({
    data: {
      ownerId: designer.id,
      orderId: order.id,
      publicId: `deliverable-${order.orderNumber}-${Date.now()}`,
      url,
      secureUrl: url,
      resourceType: "image",
      bytes: 0,
      mimeType: "external/url",
      kind: "DELIVERABLE"
    }
  });
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "IN_REVIEW",
      events: { create: { status: "IN_REVIEW", note } }
    }
  });
  await prisma.notification.create({
    data: { userId: order.clientId, type: "ORDER", title: "Design ready for review", body: `${order.title} has a new deliverable.`, href: "/dashboard/client/orders" }
  });
  await sendEmail({
    to: order.client.email,
    subject: `Design ready: ${order.orderNumber}`,
    html: `<p>Your design is ready for review.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000"}/dashboard/client/orders">Open your orders</a></p>`
  });
  revalidatePath("/dashboard/designer/projects");
  revalidatePath("/dashboard/client/orders");
}

export async function forgotPasswordAction(_: unknown, formData: FormData): Promise<ActionResult> {
  await rateLimit(`forgot-password:${await clientIp()}`, 5, 60_000);
  if (!hasDatabaseUrl()) return { ok: false, message: "Password reset is temporarily unavailable." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email.includes("@")) return { ok: false, message: "Enter a valid email address." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash: hashToken(token),
        resetTokenExpires: new Date(Date.now() + 1000 * 60 * 30)
      }
    });
    const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000"}/reset-password?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: "Reset your Papa Sami Studio password",
      html: `<p>Use this secure link to reset your password. It expires in 30 minutes.</p><p><a href="${url}">Reset password</a></p>`
    });
  }

  return { ok: true, message: "If that email exists, a password reset link has been sent." };
}

export async function resetPasswordAction(_: unknown, formData: FormData): Promise<ActionResult> {
  await rateLimit(`reset-password:${await clientIp()}`, 8, 60_000);
  if (!hasDatabaseUrl()) return { ok: false, message: "Password reset is temporarily unavailable." };

  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { ok: false, message: "Password must be 8+ characters with a capital letter and number." };
  }

  const user = await prisma.user.findFirst({
    where: {
      resetTokenHash: hashToken(token),
      resetTokenExpires: { gt: new Date() }
    }
  });
  if (!user) return { ok: false, message: "Reset link is invalid or expired." };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await bcrypt.hash(password, 12),
      resetTokenHash: null,
      resetTokenExpires: null
    }
  });
  return { ok: true, message: "Password updated. You can now log in." };
}

export async function updateProfileAction(_: unknown, formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.email) return { ok: false, message: "Login required." };
  if (!hasDatabaseUrl()) return { ok: false, message: "Profile updates are temporarily unavailable." };

  const name = sanitizeText(String(formData.get("name") ?? ""));
  const phone = sanitizeText(String(formData.get("phone") ?? ""));
  const bio = sanitizeText(String(formData.get("bio") ?? ""));

  await prisma.user.update({
    where: { email: session.user.email },
    data: { name: name || null, phone: phone || null, bio: bio || null }
  });
  revalidatePath("/dashboard/client/profile");
  return { ok: true, message: "Profile updated." };
}
