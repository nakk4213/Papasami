import "server-only";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export function signedUploadSignature(folder = "designcraft") {
  if (!process.env.CLOUDINARY_API_SECRET) throw new Error("Missing Cloudinary configuration");
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, process.env.CLOUDINARY_API_SECRET);
  return {
    timestamp,
    signature,
    folder,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY
  };
}

export function hasCloudinaryConfig() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

export async function uploadFileToCloudinary(file: File, folder = "papa-sami-studio") {
  if (!hasCloudinaryConfig()) return null;

  const buffer = Buffer.from(await file.arrayBuffer());
  return uploadBufferToCloudinary(buffer, file.name, file.type || "application/octet-stream", folder);
}

export async function uploadBufferToCloudinary(buffer: Buffer, fileName: string, mimeType: string, folder = "papa-sami-studio") {
  if (!hasCloudinaryConfig()) return null;

  return new Promise<{
    publicId: string;
    url: string;
    secureUrl: string;
    resourceType: string;
    bytes: number;
    format?: string;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        filename_override: fileName,
        type: "upload",
        format: mimeType === "image/svg+xml" ? "svg" : undefined,
        use_filename: true,
        unique_filename: true,
        overwrite: false
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }

        resolve({
          publicId: result.public_id,
          url: result.url,
          secureUrl: result.secure_url,
          resourceType: result.resource_type,
          bytes: result.bytes,
          format: result.format
        });
      }
    );

    stream.end(buffer);
  }).catch(() => null);
}
