"use server";

import { OrderStatus, RoleName, TicketStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole, sanitizeText } from "@/lib/security";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  return requireRole(["ADMIN"]);
}

export async function saveServiceAction(formData: FormData) {
  await requireAdmin();
  const categoryName = sanitizeText(String(formData.get("categoryName") ?? ""));
  const name = sanitizeText(String(formData.get("name") ?? ""));
  const description = sanitizeText(String(formData.get("description") ?? ""));
  const basePrice = Number(formData.get("basePrice") ?? 0);
  const turnaround = Number(formData.get("turnaround") ?? 3);
  const active = formData.get("active") === "on";

  if (!categoryName || !name || !description || basePrice <= 0) return;

  const category = await prisma.serviceCategory.upsert({
    where: { slug: slugify(categoryName) },
    update: { name: categoryName, description: `Premium ${categoryName.toLowerCase()} by Papa Sami Studio.` },
    create: {
      name: categoryName,
      slug: slugify(categoryName),
      description: `Premium ${categoryName.toLowerCase()} by Papa Sami Studio.`,
      icon: "Sparkles"
    }
  });

  await prisma.service.upsert({
    where: { slug: slugify(name) },
    update: { categoryId: category.id, name, description, basePrice, turnaround, active },
    create: { categoryId: category.id, name, slug: slugify(name), description, basePrice, turnaround, active }
  });

  revalidatePath("/admin/services");
  revalidatePath("/services");
}

export async function savePackageAction(formData: FormData) {
  await requireAdmin();
  const serviceId = String(formData.get("serviceId") ?? "");
  const name = sanitizeText(String(formData.get("name") ?? ""));
  const description = sanitizeText(String(formData.get("description") ?? ""));
  const price = Number(formData.get("price") ?? 0);
  const revisions = Number(formData.get("revisions") ?? 2);
  const deliveryDays = Number(formData.get("deliveryDays") ?? 3);
  const features = String(formData.get("features") ?? "")
    .split(",")
    .map((item) => sanitizeText(item))
    .filter(Boolean);

  if (!serviceId || !name || !description || price <= 0) return;

  await prisma.servicePackage.upsert({
    where: { serviceId_name: { serviceId, name } },
    update: { description, price, revisions, deliveryDays, features },
    create: { serviceId, name, description, price, revisions, deliveryDays, features }
  });

  revalidatePath("/admin/services");
  revalidatePath("/pricing");
}

export async function savePortfolioAction(formData: FormData) {
  await requireAdmin();
  const title = sanitizeText(String(formData.get("title") ?? ""));
  const category = sanitizeText(String(formData.get("category") ?? ""));
  const description = sanitizeText(String(formData.get("description") ?? ""));
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((item) => sanitizeText(item))
    .filter(Boolean);
  const featured = formData.get("featured") === "on";

  if (!title || !category || !description || !imageUrl) return;

  await prisma.portfolioItem.upsert({
    where: { slug: slugify(title) },
    update: { title, category, description, imageUrl, tags, featured, published: true },
    create: { title, slug: slugify(title), category, description, imageUrl, tags, featured, published: true }
  });

  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  const note = sanitizeText(String(formData.get("note") ?? ""));

  if (!orderId || !Object.values(OrderStatus).includes(status)) return;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      events: { create: { status, note: note || "Status updated by studio admin" } }
    }
  });

  revalidatePath("/admin/orders");
}

export async function assignOrderAction(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const designerId = String(formData.get("designerId") ?? "");
  if (!orderId || !designerId) return;

  const designer = await prisma.user.findFirst({ where: { id: designerId, role: "DESIGNER", isActive: true } });
  if (!designer) return;

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      designerId,
      status: "ASSIGNED",
      events: { create: { status: "ASSIGNED", note: `Assigned to ${designer.name ?? designer.email}` } }
    }
  });

  await prisma.notification.create({
    data: { userId: designerId, type: "ORDER", title: "New project assigned", body: `Order ${order.orderNumber} has been assigned to you.`, href: "/dashboard/designer/projects" }
  });
  await prisma.auditLog.create({ data: { action: "ORDER_ASSIGNED", entity: "Order", entityId: orderId, metadata: { designerId } } });
  revalidatePath("/admin/orders");
  revalidatePath("/dashboard/designer/projects");
}

export async function updateUserAction(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "") as RoleName;
  const isActive = formData.get("isActive") === "on";

  if (!userId || !Object.values(RoleName).includes(role)) return;

  await prisma.user.update({ where: { id: userId }, data: { role, isActive } });
  revalidatePath("/admin/users");
}

export async function updateContactStatusAction(formData: FormData) {
  await requireAdmin();
  const ticketId = String(formData.get("ticketId") ?? "");
  const status = String(formData.get("status") ?? "") as TicketStatus;

  if (!ticketId || !Object.values(TicketStatus).includes(status)) return;

  await prisma.contactTicket.update({ where: { id: ticketId }, data: { status } });
  revalidatePath("/admin/inbox");
}

export async function saveSettingAction(formData: FormData) {
  await requireAdmin();
  const key = sanitizeText(String(formData.get("key") ?? ""));
  const group = sanitizeText(String(formData.get("group") ?? "global"));
  const value = sanitizeText(String(formData.get("value") ?? ""));

  if (!key) return;

  await prisma.setting.upsert({
    where: { key },
    update: { group, value: { value } },
    create: { key, group, value: { value } }
  });

  revalidatePath("/admin/settings");
}

export async function saveCmsPageAction(formData: FormData) {
  await requireAdmin();
  const title = sanitizeText(String(formData.get("title") ?? ""));
  const slug = slugify(String(formData.get("slug") ?? title));
  const body = sanitizeText(String(formData.get("body") ?? ""));
  const seoTitle = sanitizeText(String(formData.get("seoTitle") ?? title));
  const seoDescription = sanitizeText(String(formData.get("seoDescription") ?? ""));

  if (!title || !slug || !body) return;

  await prisma.cmsPage.upsert({
    where: { slug },
    update: { title, content: { body }, seoTitle, seoDescription, published: true },
    create: { title, slug, content: { body }, seoTitle, seoDescription, published: true }
  });

  await prisma.auditLog.create({ data: { action: "CMS_PAGE_SAVED", entity: "CmsPage", entityId: slug } });
  revalidatePath("/admin/cms");
}

export async function saveBlogPostAction(formData: FormData) {
  await requireAdmin();
  const title = sanitizeText(String(formData.get("title") ?? ""));
  const slug = slugify(String(formData.get("slug") ?? title));
  const excerpt = sanitizeText(String(formData.get("excerpt") ?? ""));
  const content = sanitizeText(String(formData.get("content") ?? ""));
  const coverImage = String(formData.get("coverImage") ?? "").trim();
  const published = formData.get("published") === "on";

  if (!title || !slug || !excerpt || !content) return;

  await prisma.blogPost.upsert({
    where: { slug },
    update: { title, excerpt, content, coverImage: coverImage || null, published, publishedAt: published ? new Date() : null },
    create: { title, slug, excerpt, content, coverImage: coverImage || null, published, publishedAt: published ? new Date() : null }
  });

  await prisma.auditLog.create({ data: { action: "BLOG_POST_SAVED", entity: "BlogPost", entityId: slug } });
  revalidatePath("/admin/cms");
}

export async function sendAnnouncementAction(formData: FormData) {
  await requireAdmin();
  const title = sanitizeText(String(formData.get("title") ?? ""));
  const body = sanitizeText(String(formData.get("body") ?? ""));
  const href = sanitizeText(String(formData.get("href") ?? ""));

  if (!title || !body) return;

  const users = await prisma.user.findMany({ where: { isActive: true }, select: { id: true } });
  if (users.length) {
    await prisma.notification.createMany({
      data: users.map((user) => ({ userId: user.id, type: "SYSTEM", title, body, href: href || null }))
    });
  }

  await prisma.auditLog.create({ data: { action: "ANNOUNCEMENT_SENT", entity: "Notification", metadata: { recipients: users.length } } });
  revalidatePath("/admin/notifications");
}

export async function saveFeatureToggleAction(formData: FormData) {
  await requireAdmin();
  const key = slugify(String(formData.get("key") ?? ""));
  const description = sanitizeText(String(formData.get("description") ?? ""));
  const enabled = formData.get("enabled") === "on";

  if (!key) return;

  await prisma.featureToggle.upsert({
    where: { key },
    update: { description, enabled },
    create: { key, description, enabled }
  });

  await prisma.auditLog.create({ data: { action: "FEATURE_TOGGLE_SAVED", entity: "FeatureToggle", entityId: key } });
  revalidatePath("/admin/security");
  revalidatePath("/admin/settings");
}
