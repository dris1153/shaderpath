import type { Citation } from "../../types";

// ≥2 citations with REAL verifiable URLs (spec §3.2). Books without URLs are
// allowed only as extras. NOTE: adjust the relative path depth when copying
// into a track folder (../../../types).
export const references: Citation[] = [
  {
    id: "todo-source",
    type: "article",
    title: "TODO",
    url: "https://example.com",
    note: {
      vi: "TODO: vì sao nên đọc",
      en: "TODO: why it's worth reading",
    },
  },
];
