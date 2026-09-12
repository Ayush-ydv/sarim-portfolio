import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { bunnyUrls, createBunnyVideo, signTusUpload } from "@/lib/bunnyStream";

// First step of an admin video upload: create the video on Bunny and hand the
// browser a signed, single-use permission to upload it there directly (tus,
// resumable, no size limit). The video itself never passes through Vercel.
export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const title = String(body.title ?? "").trim().slice(0, 200) || "Untitled upload";

  try {
    const videoId = await createBunnyVideo(title);
    const { embedUrl, thumbnailUrl } = bunnyUrls(videoId);
    return NextResponse.json({
      ...signTusUpload(videoId),
      // Where the video will live, in case processing outlasts the admin's wait.
      predicted: { mediaUrl: embedUrl, thumbnailUrl },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}
