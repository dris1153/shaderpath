import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/db/client";
import { settings } from "@/db/schema";
import type { QualityTier } from "@/lib/quality";

// Server-side reads — RSC only, never client (spec §8.7).

const VALID_TIERS = new Set<string>(["low", "medium", "high"]);

export async function getSetting(key: string): Promise<string | undefined> {
  return db.select().from(settings).where(eq(settings.key, key)).then((r) => r[0]?.value);
}

// The root layout reads this on every request, so it is cached instead of
// round-tripping each time. `use cache` is the current directive but needs
// cacheComponents enabled for the whole app, which this does not warrant.
const readQualityTier = unstable_cache(
  () => getSetting("quality_tier"),
  ["quality_tier"],
  { revalidate: 300 },
);

/** null means "never detected/persisted" — the provider falls back to DEFAULT_TIER. */
export async function getQualityTierSetting(): Promise<QualityTier | null> {
  // The catch is OUTSIDE the cache deliberately: unstable_cache stores resolved
  // values, so catching inside would keep a null from one bad second for the
  // entire revalidate window. Out here the failure stays uncached and the next
  // request retries.
  try {
    const value = await readQualityTier();
    return value && VALID_TIERS.has(value) ? (value as QualityTier) : null;
  } catch (err) {
    // This runs in the root layout, so a read that cannot reach the database
    // has to degrade rather than 500 every route — null is the provider's
    // "never detected" path and the client detects the tier itself.
    console.warn("quality_tier read failed, falling back to detection:", err);
    return null;
  }
}
