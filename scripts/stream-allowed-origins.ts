// Locks every Cloudflare Stream video in the account to STREAM_ALLOWED_ORIGINS.
// New admin uploads get this automatically; run this after changing the list
// (e.g. once a custom domain is added):  npm run stream:origins
import { setStreamAllowedOrigins, streamAllowedOrigins } from "../lib/cloudflareStream";

async function main() {
  const origins = streamAllowedOrigins();
  if (origins.length === 0) {
    throw new Error("STREAM_ALLOWED_ORIGINS is empty; refusing to unlock every video.");
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream`,
    { headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_API_TOKEN}` } },
  );
  const data = await res.json();
  if (!data.success) throw new Error(data.errors?.[0]?.message ?? "Could not list videos");

  const videos = data.result as { uid: string; meta?: { name?: string } }[];
  for (const video of videos) {
    await setStreamAllowedOrigins(video.uid, origins);
    console.log(`✓ ${video.meta?.name ?? video.uid}`);
  }
  console.log(`\n${videos.length} videos now play only on: ${origins.join(", ")}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
