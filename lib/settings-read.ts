import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { settings } from "@/db/schema";
import type { QualityTier } from "@/lib/quality";

// Sync server-side reads (better-sqlite3) — RSC only, never client (spec §8.7).

const VALID_TIERS = new Set<string>(["low", "medium", "high"]);

export function getSetting(key: string): string | undefined {
  return db.select().from(settings).where(eq(settings.key, key)).get()?.value;
}

/** null means "never detected/persisted" — the provider falls back to DEFAULT_TIER. */
export function getQualityTierSetting(): QualityTier | null {
  const value = getSetting("quality_tier");
  return value && VALID_TIERS.has(value) ? (value as QualityTier) : null;
}
