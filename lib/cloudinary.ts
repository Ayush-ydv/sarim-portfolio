import crypto from "crypto";

export function generateUploadSignature(timestamp: number) {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiSecret) throw new Error("CLOUDINARY_API_SECRET is not configured");

  const toSign = `timestamp=${timestamp}${apiSecret}`;
  return crypto.createHash("sha1").update(toSign).digest("hex");
}
