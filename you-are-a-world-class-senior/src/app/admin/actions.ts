"use server";

import { OrderStatus, RoleName, TicketStatus } from "@prisma/client";
import { mkdir, writeFile } from "fs/promises";
import { revalidatePath } from "next/cache";
import path from "path";
import { createWatermarkedPreview, saveUploadedFile } from "@/lib/delivery";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { deleteLocalPortfolioItem, saveLocalPortfolioItem } from "@/lib/portfolio-store";
import { requireRole, sanitizeText } from "@/lib/security";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  return requireRole(["ADMIN"]);
}

async function savePortfolioImage(file: File | null) {
  if (!file || file.size === 0) return null;
  if (!file.type.startsWith("image/")) return null;
  if (file.size > 10 * 1024 * 1024) return null;

  const cloudUpload = await uploadFileToCloudinary(file, "papa-sami-studio/portfolio");
  if (cloudUpload?.secureUrl) return cloudUpload.secureUrl;

  if (process.env.NODE_ENV === "production") return null;

  const uploadDir = path.join(process.cwd(), "public", "uploads", "portfolio");
  await mkdir(uploadDir, { recursive: true });

  const extension = path.extname(file.name).toLowerCase() || ".png";
  const safeName = slugify(path.basename(file.name, extension)) || "portfolio";
  const fileName = `${Date.now()}-${safeName}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(path.join(uploadDir, fileName), buffer);
  return `/uploads/portfolio/${fileName}`;
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
  const id = String(formData.get("id") ?? "").trim();
  const title = sanitizeText(String(formData.get("title") ?? ""));
  const category = sanitizeText(String(formData.get("category") ?? ""));
  const description = sanitizeText(String(formData.get("description") ?? ""));
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const imageFile = formData.get("imageFile");
  const uploadedImage = await savePortfolioImage(imageFile instanceof File ? imageFile : null);
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((item) => sanitizeText(item))
    .filter(Boolean);
  const featured = formData.get("featured") === "on";
  const published = formData.get("published") === "on";

  if (!title || !category || !description) return;

  try {
    if (id) {
      const existing = await prisma.portfolioItem.findUnique({ where: { id } });
      const finalImageUrl = uploadedImage ?? (imageUrl || existing?.imageUrl);
      if (!existing || !finalImageUrl) throw new Error("Portfolio database update unavailable");

      await prisma.portfolioItem.update({
        where: { id },
        data: { title, category, description, imageUrl: finalImageUrl, tags, featured, published }
      });
      await prisma.auditLog.create({ data: { action: "PORTFOLIO_UPDATED", entity: "PortfolioItem", entityId: id } });
    } else {
      const finalImageUrl = uploadedImage ?? imageUrl;
      if (!finalImageUrl) return;

      await prisma.portfolioItem.create({
        data: { title, slug: slugify(`${title}-${Date.now()}`), category, description, imageUrl: finalImageUrl, tags, featured, published }
      });
      await prisma.auditLog.create({ data: { action: "PORTFOLIO_CREATED", entity: "PortfolioItem", entityId: title } });
    }
  } catch {
    if (process.env.NODE_ENV === "production") return;
    const finalImageUrl = uploadedImage ?? imageUrl;
    if (!finalImageUrl) return;
    await saveLocalPortfolioItem({ id: id || undefined, title, category, description, imageUrl: finalImageUrl, tags, featured, published });
  }

  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
}

export async function deletePortfolioAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  try {
    await prisma.portfolioItem.delete({ where: { id } });
    await prisma.auditLog.create({ data: { action: "PORTFOLIO_DELETED", entity: "PortfolioItem", entityId: id } });
  } catch {
    if (process.env.NODE_ENV === "production") return;
    await deleteLocalPortfolioItem(id);
  }

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

export async function uploadCompletedDesignAction(formData: FormData) {
  const admin = await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const note = sanitizeText(String(formData.get("note") ?? "Watermarked preview uploaded for client review"));
  const file = formData.get("deliverable");

  if (!orderId || !(file instanceof File) || file.size === 0) return;
  if (file.size > 50 * 1024 * 1024) return;

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { client: true } });
  if (!order) return;

  const upload = await saveUploadedFile(file, `deliveries/${order.id}/originals`);
  const isImage = file.type.startsWith("image/") || upload.resourceType === "image";
  const previewUrl = isImage ? await createWatermarkedPreview(upload.secureUrl, order.id, file.name) : null;

  await prisma.assetFile.create({
    data: {
      ownerId: admin.id,
      orderId: order.id,
      publicId: upload.publicId,
      url: upload.url,
      secureUrl: upload.secureUrl,
      previewUrl,
      previewSecureUrl: previewUrl,
      resourceType: upload.resourceType,
      bytes: upload.bytes,
      mimeType: file.type || "application/octet-stream",
      kind: "DELIVERABLE",
      downloadAuthorized: false
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
    data: {
      userId: order.clientId,
      type: "ORDER",
      title: "Design preview ready",
      body: `${order.title} is ready for review. The original download will be unlocked after approval.`,
      href: `/dashboard/client/projects/${order.id}`
    }
  });

  await sendEmail({
    to: order.client.email,
    subject: `Design preview ready: ${order.orderNumber}`,
    html: `<p>Your design preview is ready.</p><p>The original file download will be unlocked by Papa Sami Studio after approval.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000"}/dashboard/client/projects/${order.id}">Open project workspace</a></p>`
  });

  await prisma.auditLog.create({ data: { actorId: admin.id, action: "DELIVERABLE_UPLOADED", entity: "Order", entityId: order.id } });
  revalidatePath("/admin/orders");
  revalidatePath("/dashboard/client/orders");
  revalidatePath(`/dashboard/client/projects/${order.id}`);
}

export async function authorizeDeliverableDownloadAction(formData: FormData) {
  const admin = await requireAdmin();
  const fileId = String(formData.get("fileId") ?? "");
  if (!fileId) return;

  const file = await prisma.assetFile.findUnique({ where: { id: fileId }, include: { order: { include: { client: true } } } });
  if (!file || file.kind !== "DELIVERABLE" || !file.order) return;

  await prisma.assetFile.update({
    where: { id: file.id },
    data: {
      downloadAuthorized: true,
      authorizedAt: new Date(),
      authorizedById: admin.id
    }
  });

  await prisma.notification.create({
    data: {
      userId: file.order.clientId,
      type: "ORDER",
      title: "Final design download unlocked",
      body: `${file.order.title} is now available for download.`,
      href: `/dashboard/client/projects/${file.order.id}`
    }
  });

  await prisma.orderEvent.create({
    data: {
      orderId: file.order.id,
      status: file.order.status,
      note: "Original design download authorized by admin"
    }
  });

  await sendEmail({
    to: file.order.client.email,
    subject: `Download unlocked: ${file.order.orderNumber}`,
    html: `<p>Your original design file is now available.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000"}/dashboard/client/projects/${file.order.id}">Download your file</a></p>`
  });

  await prisma.auditLog.create({ data: { actorId: admin.id, action: "DELIVERABLE_AUTHORIZED", entity: "AssetFile", entityId: file.id } });
  revalidatePath("/admin/orders");
  revalidatePath("/dashboard/client/orders");
  revalidatePath(`/dashboard/client/projects/${file.order.id}`);
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
