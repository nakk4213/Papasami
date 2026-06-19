import "server-only";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import { slugify } from "@/lib/utils";

const WATERMARK_TEXT = "PREVIEW ONLY - PAPA SAMI STUDIOS";

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeFileName(name: string, fallback = "file") {
  const extension = path.extname(name).toLowerCase();
  const base = slugify(path.basename(name, extension)) || fallback;
  return `${base}${extension || ""}`;
}

export async function saveUploadedFile(file: File, folder: string) {
  const cloudUpload = await uploadFileToCloudinary(file, `papa-sami-studio/${folder}`);
  if (cloudUpload) {
    return {
      publicId: cloudUpload.publicId,
      url: cloudUpload.url,
      secureUrl: cloudUpload.secureUrl,
      resourceType: cloudUpload.resourceType,
      bytes: cloudUpload.bytes
    };
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true });
  const fileName = `${Date.now()}-${safeFileName(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, fileName), buffer);
  const url = `/uploads/${folder}/${fileName}`;

  return {
    publicId: fileName,
    url,
    secureUrl: url,
    resourceType: file.type.startsWith("image/") ? "image" : "file",
    bytes: file.size
  };
}

export async function createWatermarkedPreview(originalUrl: string, orderId: string, fileName: string) {
  const previewDir = path.join(process.cwd(), "public", "uploads", "deliveries", orderId, "previews");
  await mkdir(previewDir, { recursive: true });

  const previewName = `${Date.now()}-${safeFileName(fileName, "preview")}.svg`;
  const previewPath = path.join(previewDir, previewName);
  const publicUrl = `/uploads/deliveries/${orderId}/previews/${previewName}`;
  const escapedUrl = xmlEscape(originalUrl);
  const escapedText = xmlEscape(WATERMARK_TEXT);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" role="img" aria-label="Watermarked design preview">
  <rect width="1200" height="900" fill="#0b0706"/>
  <image href="${escapedUrl}" x="0" y="0" width="1200" height="900" preserveAspectRatio="xMidYMid meet"/>
  <g opacity="0.2" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="800" text-anchor="middle" transform="rotate(-28 600 450)">
    <text x="600" y="90">${escapedText}</text>
    <text x="600" y="250">${escapedText}</text>
    <text x="600" y="410">${escapedText}</text>
    <text x="600" y="570">${escapedText}</text>
    <text x="600" y="730">${escapedText}</text>
    <text x="600" y="890">${escapedText}</text>
  </g>
</svg>`;

  await writeFile(previewPath, svg, "utf8");
  return publicUrl;
}
