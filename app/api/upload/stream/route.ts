import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createDirectUploadUrl } from "@/lib/cloudflareStream";

export async function POST() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { uploadURL, uid } = await createDirectUploadUrl();
    return NextResponse.json({ uploadURL, uid });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}
