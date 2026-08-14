"use server";

import { db } from "@/db/client";
import { settings } from "@/db/schema";

// Generic key/value writes — currently only the quality tier uses this, but
// the settings table (spec §5) is shared, hence the string key rather than
// a dedicated column.

const QUALITY_TIER_KEY = "quality_tier";
const VALID_TIERS = new Set<string>(["low", "medium", "high"]);

export async function setQualityTier(tier: string) {
  if (!VALID_TIERS.has(tier)) throw new Error(`Invalid quality tier: ${tier}`);
  db.insert(settings)
    .values({ key: QUALITY_TIER_KEY, value: tier })
    .onConflictDoUpdate({ target: settings.key, set: { value: tier } })
    .run();
}
