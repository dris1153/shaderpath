// The "one config object, not if/else scattered everywhere" pattern the
// theory describes: every tier-dependent number lives here, and every piece
// of the scene just reads it.

export type QualityTierId = "low" | "medium" | "high";

export interface QualityConfig {
  id: QualityTierId;
  label: { vi: string; en: string };
  dpr: number;
  particleCount: number;
  postfxPasses: 0 | 1 | 2;
  material: "simple" | "lit";
}

export const TIER_ORDER: QualityTierId[] = ["low", "medium", "high"];

export const QUALITY_TIERS: Record<QualityTierId, QualityConfig> = {
  low: {
    id: "low",
    label: { vi: "Thấp", en: "Low" },
    dpr: 1,
    particleCount: 4000,
    postfxPasses: 0,
    material: "simple",
  },
  medium: {
    id: "medium",
    label: { vi: "Trung bình", en: "Medium" },
    dpr: 1.5,
    particleCount: 16000,
    postfxPasses: 1,
    material: "lit",
  },
  high: {
    id: "high",
    label: { vi: "Cao", en: "High" },
    dpr: 2,
    particleCount: 65000,
    postfxPasses: 2,
    material: "lit",
  },
};
