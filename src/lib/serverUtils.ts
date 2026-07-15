import "server-only";

import { createHash } from "node:crypto";

export function hash(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}
