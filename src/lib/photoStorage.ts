import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Kept out of the Next.js `public/` build output on purpose — production
// bind-mounts a host directory here so uploads survive every deploy (the
// deploy script only ever rewrites docker-compose.prod.yml/.env, never this
// path). See docker-compose.prod.yml + docs/DEPLOYMENT.md.
// Relative (not path.join(process.cwd(), ...)) on purpose — Node resolves a
// relative fs path against process.cwd() at runtime on its own, and writing
// it as a literal here avoids Next's build-time file tracer mistaking this
// for a dynamic path it needs to statically resolve (which otherwise sweeps
// the entire project into the standalone build output as a false positive).
// Production always sets UPLOADS_DIR via the Dockerfile anyway.
const UPLOADS_DIR = process.env.UPLOADS_DIR ?? "uploads";

const MAX_WIDTH = 2000;
// UUID (36 chars) + ".webp" — validated on every read/delete so a crafted
// fileName from the DB (or a malformed request) can never escape UPLOADS_DIR.
const FILE_NAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/;

export type ProcessedImage = {
  fileName: string;
  width: number;
  height: number;
  wasResized: boolean;
};

export class UnsupportedImageError extends Error {}

// Shards files across 65536 leaf directories (first 2 hex chars / next 2 hex
// chars of the UUID) instead of one flat directory — the same layout Git
// uses for loose objects. Purely a disk-layout detail: it's computed from
// fileName alone, so the DB (which only ever stores the bare fileName) and
// the /api/photos/[file] URL never need to know about it.
function shardedPath(fileName: string): string {
  return path.join(
    UPLOADS_DIR,
    fileName.slice(0, 2),
    fileName.slice(2, 4),
    fileName,
  );
}

/**
 * Resizes (if needed) and re-encodes an uploaded image to webp, then writes
 * it to UPLOADS_DIR under a fresh UUID filename. Throws UnsupportedImageError
 * if the buffer isn't a format sharp can decode as an image.
 */
export async function processAndSaveImage(
  buffer: Buffer,
): Promise<ProcessedImage> {
  let pipeline: ReturnType<typeof sharp>;
  let metadata: Awaited<ReturnType<typeof pipeline.metadata>>;
  try {
    pipeline = sharp(buffer).rotate();
    metadata = await pipeline.metadata();
  } catch {
    throw new UnsupportedImageError("Nepavyko nuskaityti nuotraukos failo.");
  }
  if (!metadata.width || !metadata.height) {
    throw new UnsupportedImageError("Nepavyko nuskaityti nuotraukos failo.");
  }

  const wasResized = metadata.width > MAX_WIDTH;
  const output = await pipeline
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  const fileName = `${randomUUID()}.webp`;
  const fullPath = shardedPath(fileName);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, output.data);

  return {
    fileName,
    width: output.info.width,
    height: output.info.height,
    wasResized,
  };
}

export function isValidPhotoFileName(fileName: string): boolean {
  return FILE_NAME_PATTERN.test(fileName);
}

export async function readPhotoFile(fileName: string): Promise<Buffer | null> {
  if (!isValidPhotoFileName(fileName)) return null;
  try {
    return await readFile(shardedPath(fileName));
  } catch {
    return null;
  }
}

export async function deletePhotoFile(fileName: string): Promise<void> {
  if (!isValidPhotoFileName(fileName)) return;
  try {
    await unlink(shardedPath(fileName));
  } catch {
    // Already gone — nothing left to clean up.
  }
}
