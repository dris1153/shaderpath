// Bilingual labels shared across the principle-stage demo files.

export type PrincipleKind =
  | "anticipation"
  | "overlap"
  | "secondary"
  | "squash"
  | "slowInOut";

export interface PanelLabels {
  bad: string;
  good: string;
}

export const PANEL_LABELS: Record<"vi" | "en", PanelLabels> = {
  vi: { bad: "Chưa áp dụng", good: "Có nguyên tắc" },
  en: { bad: "Without it", good: "With it" },
};

export const PRINCIPLE_OPTIONS: Record<"vi" | "en", Record<PrincipleKind, string>> = {
  vi: {
    anticipation: "Anticipation (cú rướn)",
    overlap: "Follow-through / Overlap",
    secondary: "Secondary motion",
    squash: "Squash & stretch",
    slowInOut: "Slow-in / slow-out",
  },
  en: {
    anticipation: "Anticipation",
    overlap: "Follow-through / Overlap",
    secondary: "Secondary motion",
    squash: "Squash & stretch",
    slowInOut: "Slow-in / slow-out",
  },
};

export const STAGE_TEXT = {
  vi: {
    replay: "Phát lại",
    reduced:
      "Hệ điều hành đang bật Reduced Motion — animation trong demo được rút ngắn còn ~5% thời lượng gốc.",
  },
  en: {
    replay: "Replay",
    reduced:
      "Your OS has Reduced Motion enabled — this demo's animations are shortened to ~5% of their original duration.",
  },
} as const;
