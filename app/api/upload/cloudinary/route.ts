import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateUploadSignature } from "@/lib/cloudinary";

export async function POST() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!apiKey || !cloudName) {
    return NextResponse.json(
      { error: "Cloudinary is not fully configured yet" },
      { status: 500 },
    );
  }

  try {
    const timestamp = Math.round(Date.now() / 1000);
    const signature = generateUploadSignature(timestamp);
    return NextResponse.json({ signature, timestamp, apiKey, cloudName });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Signing failed" },
      { status: 500 },
    );
  }
}
