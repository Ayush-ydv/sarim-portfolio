// One-off move of the uploaded videos from Cloudflare Stream to Bunny Stream.
// Uploads the ORIGINAL files from public/videos (full quality), keeps each
// item's title, description and poster frame, and backs up every row before
// changing it. Steps:
//
//   npx tsx --env-file=.env.local  scripts/migrate-to-bunny.ts plan      what will happen
//   npx tsx --env-file=.env.local  scripts/migrate-to-bunny.ts upload    upload + wait for Bunny
//   npx tsx --env-file=.env.local  scripts/migrate-to-bunny.ts apply     switch the dev database
//   npx tsx --env-file=.env.vercel scripts/migrate-to-bunny.ts apply     switch the live database
//   npx tsx --env-file=<same>      scripts/migrate-to-bunny.ts restore scripts/backups/<file>.json
//
// scripts/.bunny-map.json remembers which Stream video became which Bunny
// video, so upload is safe to re-run and apply works for both databases.
import { createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { Upload } from "tus-js-client";
import {
  bunnyUrls,
  createBunnyVideo,
  getBunnyVideoStatus,
  signTusUpload,
  updateBunnyVideo,
} from "../lib/bunnyStream";
import { thumbnailTime } from "../lib/media";

const prisma = new PrismaClient();
const MAP_FILE = path.join("scripts", ".bunny-map.json");
const BACKUP_DIR = path.join("scripts", "backups");
const VIDEOS_DIR = path.join("public", "videos");
const BUNNY_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-/i;

type MapEntry = { guid: string; file: string };
const readMap = (): Record<string, MapEntry> =>
  existsSync(MAP_FILE) ? JSON.parse(readFileSync(MAP_FILE, "utf8")) : {};
const writeMap = (map: Record<string, MapEntry>) =>
  writeFileSync(MAP_FILE, JSON.stringify(map, null, 2));

function localFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? localFiles(full) : [full];
  });
}

// The original filename Cloudflare kept for each video lets us find it on disk.
async function streamFileName(uid: string) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/${uid}`,
    { headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_API_TOKEN}` } },
  );
  const data = await res.json();
  return (data.result?.meta?.name as string | undefined) ?? null;
}

async function streamItems() {
  const items = await prisma.galleryItem.findMany({
    where: { streamVideoId: { not: null } },
    orderBy: { title: "asc" },
  });
  return items.filter((item) => !BUNNY_ID.test(item.streamVideoId!));
}

async function plan() {
  const items = await streamItems();
  const files = localFiles(VIDEOS_DIR);
  const map = readMap();
  console.log(`${items.length} gallery items still on Cloudflare Stream:\n`);
  for (const item of items) {
    const uid = item.streamVideoId!;
    const name = await streamFileName(uid);
    const file = files.find((f) => path.basename(f) === name);
    console.log(
      `${item.published ? "●" : "○"} ${item.title}\n    stream ${uid}  poster ${thumbnailTime(item.thumbnailUrl)}s\n    file   ${file ?? `NOT FOUND (${name})`}${map[uid] ? `\n    bunny  ${map[uid].guid} (uploaded)` : ""}`,
    );
  }

  // Any other field still pointing at Stream (hero, quick links, covers…).
  const columns = await prisma.$queryRaw<{ table_name: string; column_name: string }[]>`
    SELECT table_name, column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND data_type IN ('text', 'character varying')`;
  const stragglers: string[] = [];
  for (const { table_name, column_name } of columns) {
    const rows = await prisma.$queryRawUnsafe<{ n: bigint }[]>(
      `SELECT count(*) AS n FROM "${table_name}" WHERE "${column_name}" LIKE '%cloudflarestream%'`,
    );
    const n = Number(rows[0].n);
    if (n > 0 && !(table_name === "GalleryItem" && ["mediaUrl", "thumbnailUrl"].includes(column_name))) {
      stragglers.push(`${table_name}.${column_name}: ${n}`);
    }
  }
  console.log(
    stragglers.length
      ? `\nOther fields still using Stream URLs:\n  ${stragglers.join("\n  ")}`
      : "\nNo other fields use Stream URLs.",
  );
}

function tusUpload(file: string, videoId: string) {
  const signed = signTusUpload(videoId);
  const size = statSync(file).size;
  return new Promise<void>((resolve, reject) => {
    let lastLogged = -10;
    const upload = new Upload(createReadStream(file), {
      endpoint: signed.endpoint,
      uploadSize: size,
      chunkSize: 50 * 1024 * 1024,
      retryDelays: [0, 3000, 5000, 10000, 20000, 30000],
      headers: {
        AuthorizationSignature: signed.signature,
        AuthorizationExpire: String(signed.expires),
        VideoId: signed.videoId,
        LibraryId: String(signed.libraryId),
      },
      metadata: { filetype: "video/mp4", title: path.basename(file) },
      onProgress(sent, total) {
        const pct = Math.floor((sent / total) * 100);
        if (pct >= lastLogged + 10) {
          lastLogged = pct;
          console.log(`    ${pct}%`);
        }
      },
      onError: reject,
      onSuccess: () => resolve(),
    });
    upload.start();
  });
}

async function upload() {
  const items = await streamItems();
  const files = localFiles(VIDEOS_DIR);
  const map = readMap();

  for (const item of items) {
    const uid = item.streamVideoId!;
    if (map[uid]) {
      console.log(`✓ already uploaded: ${item.title}`);
      continue;
    }
    const name = await streamFileName(uid);
    const file = files.find((f) => path.basename(f) === name);
    if (!file) {
      console.log(`✗ SKIPPED (no local file "${name}"): ${item.title}`);
      continue;
    }

    console.log(`↑ ${item.title}  (${Math.round(statSync(file).size / 1024 / 1024)} MB)`);
    const guid = await createBunnyVideo(item.title, thumbnailTime(item.thumbnailUrl) || undefined);
    await tusUpload(file, guid);
    if (item.description) await updateBunnyVideo(guid, { description: item.description });
    map[uid] = { guid, file };
    writeMap(map);
  }

  console.log("\nWaiting for Bunny to finish processing…");
  for (;;) {
    const statuses = await Promise.all(
      Object.values(map).map(async ({ guid, file }) => ({
        file: path.basename(file),
        ...(await getBunnyVideoStatus(guid)),
      })),
    );
    const pending = statuses.filter((s) => !s.readyToStream);
    const failed = statuses.filter((s) => s.failed);
    if (failed.length) {
      console.log(`✗ Bunny failed to process: ${failed.map((s) => s.file).join(", ")}`);
      return;
    }
    if (pending.length === 0) break;
    console.log(`  ${pending.map((s) => `${s.file} ${s.encodeProgress}%`).join("  |  ")}`);
    await new Promise((r) => setTimeout(r, 20000));
  }
  console.log(`\nAll ${Object.keys(map).length} videos are ready on Bunny.`);
}

async function apply() {
  const items = await streamItems();
  const map = readMap();
  const db = new URL(process.env.DATABASE_URL!).hostname.split(".")[0];

  mkdirSync(BACKUP_DIR, { recursive: true });
  const backupFile = path.join(BACKUP_DIR, `gallery-${db}-${Date.now()}.json`);
  writeFileSync(
    backupFile,
    JSON.stringify(
      items.map(({ id, title, streamVideoId, mediaUrl, thumbnailUrl, aspectRatio }) => ({
        id, title, streamVideoId, mediaUrl, thumbnailUrl, aspectRatio,
      })),
      null,
      2,
    ),
  );
  console.log(`Backup of ${items.length} rows: ${backupFile}\n`);

  for (const item of items) {
    const entry = map[item.streamVideoId!];
    if (!entry) {
      console.log(`✗ not uploaded yet, left on Stream: ${item.title}`);
      continue;
    }
    const status = await getBunnyVideoStatus(entry.guid);
    if (!status.readyToStream) {
      console.log(`✗ still processing on Bunny, left on Stream: ${item.title}`);
      continue;
    }
    const start = thumbnailTime(item.thumbnailUrl);
    const { embedUrl } = bunnyUrls(entry.guid);
    await prisma.galleryItem.update({
      where: { id: item.id },
      data: {
        streamVideoId: entry.guid,
        mediaUrl: embedUrl,
        thumbnailUrl: start ? `${status.thumbnail}#t=${start}` : status.thumbnail,
        aspectRatio:
          item.aspectRatio ?? (status.width && status.height ? status.width / status.height : null),
      },
    });
    console.log(`✓ ${item.title}`);
  }

  // Category covers can also be a Stream poster; point them at Bunny's.
  const sections = await prisma.section.findMany({
    where: { coverUrl: { contains: "cloudflarestream" } },
    select: { id: true, navLabel: true, coverUrl: true },
  });
  if (sections.length) {
    const sectionBackup = path.join(BACKUP_DIR, `sections-${db}-${Date.now()}.json`);
    writeFileSync(sectionBackup, JSON.stringify(sections, null, 2));
    console.log(`\nBackup of ${sections.length} category covers: ${sectionBackup}`);
  }
  for (const section of sections) {
    const uid = section.coverUrl!.match(/cloudflarestream\.com\/([0-9a-f]{32})\//)?.[1];
    const entry = uid ? map[uid] : undefined;
    if (!entry) {
      console.log(`✗ cover not migrated (video not on Bunny): ${section.navLabel}`);
      continue;
    }
    const status = await getBunnyVideoStatus(entry.guid);
    await prisma.section.update({
      where: { id: section.id },
      data: { coverUrl: status.thumbnail },
    });
    console.log(`✓ cover: ${section.navLabel}`);
  }
}

async function restoreSections(rows: { id: string; navLabel: string; coverUrl: string | null }[]) {
  for (const { id, navLabel, coverUrl } of rows) {
    await prisma.section.update({ where: { id }, data: { coverUrl } });
    console.log(`↺ cover: ${navLabel}`);
  }
}

async function restore(file: string) {
  if (path.basename(file).startsWith("sections-")) {
    return restoreSections(JSON.parse(readFileSync(file, "utf8")));
  }
  const rows = JSON.parse(readFileSync(file, "utf8")) as {
    id: string;
    title: string;
    streamVideoId: string | null;
    mediaUrl: string | null;
    thumbnailUrl: string | null;
    aspectRatio: number | null;
  }[];
  for (const { id, title, ...data } of rows) {
    await prisma.galleryItem.update({ where: { id }, data });
    console.log(`↺ ${title}`);
  }
}

const [command, arg] = process.argv.slice(2);
const run = { plan, upload, apply, restore: () => restore(arg) }[command ?? ""];
if (!run || (command === "restore" && !arg)) {
  console.error("Usage: migrate-to-bunny.ts plan | upload | apply | restore <backup.json>");
  process.exit(1);
}
run()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
