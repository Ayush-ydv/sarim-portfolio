import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createTusUpload } from "@/lib/cloudflareStream";

// First step of a resumable (tus) upload. The admin's browser sends only the
// file's size and name here; we ask Cloudflare for a one-time upload URL and
// hand it back in Location. The browser then sends the video itself straight
// to Cloudflare in chunks, so neither Vercel's request size limit nor
// Cloudflare's 200 MB one-shot limit applies.
export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const uploadLength = request.headers.get("Upload-Length");
  if (!uploadLength) {
    return NextResponse.json({ error: "Missing Upload-Length" }, { status: 400 });
  }

  try {
    const { location, uid } = await createTusUpload(
      uploadLength,
      request.headers.get("Upload-Metadata"),
    );
    return new Response(null, {
      status: 201,
      headers: {
        Location: location,
        "stream-media-id": uid,
        "Tus-Resumable": "1.0.0",
        "Access-Control-Expose-Headers": "Location, stream-media-id",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}
