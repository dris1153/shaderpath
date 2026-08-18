import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { settings } from "@/db/schema";
import type { QualityTier } from "@/lib/quality";

// Server-side reads — RSC only, never client (spec §8.7).

const VALID_TIERS = new Set<string>(["low", "medium", "high"]);

export async function getSetting(key: string): Promise<string | undefined> {
  return db.select().from(settings).where(eq(settings.key, key)).then((r) => r[0]?.value);
}

/** null means "never detected/persisted" — the provider falls back to DEFAULT_TIER. */
export async function getQualityTierSetting(): Promise<QualityTier | null> {
  const value = await getSetting("quality_tier");
  return value && VALID_TIERS.has(value) ? (value as QualityTier) : null;
}
