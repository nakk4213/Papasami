import { NextResponse } from "next/server";
import { signedUploadSignature } from "@/lib/cloudinary";
import { rateLimit, clientIp } from "@/lib/security";

export async function POST() {
  await rateLimit(`upload:${await clientIp()}`, 30, 60_000);
  return NextResponse.json(signedUploadSignature());
}
