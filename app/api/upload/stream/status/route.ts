import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBunnyVideoStatus } from "@/lib/bunnyStream";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const uid = new URL(request.url).searchParams.get("uid");
  if (!uid) {
    return NextResponse.json({ error: "Missing uid" }, { status: 400 });
  }

  try {
    const status = await getBunnyVideoStatus(uid);
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Status check failed" },
      { status: 500 },
    );
  }
}
