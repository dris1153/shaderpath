import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "iquilezles-distfunctions",
    type: "article",
    title: "3D Distance Functions",
    authors: ["Inigo Quilez"],
    url: "https://iquilezles.org/articles/distfunctions/",
    note: {
      vi: "Thư viện chuẩn cho mọi SDF nguyên thuỷ — sphere, box, torus, capsule của bài học đều lấy nguyên công thức từ đây, kể cả phần bàn về cách biến đổi (translate/rotate/scale) primitive đúng cách.",
      en: "The canonical library for every SDF primitive — this lesson's sphere, box, torus and capsule formulas are lifted directly from here, including the section on correctly transforming (translate/rotate/scale) a primitive.",
    },
  },
  {
    id: "hart-1996-sphere-tracing-primitives",
    type: "paper",
    title:
      "Sphere Tracing: A Geometric Method for the Antialiased Ray Tracing of Implicit Surfaces",
    authors: ["John C. Hart"],
    year: 1996,
    url: "https://doi.org/10.1007/s003710050084",
    note: {
      vi: "Nguồn của khái niệm Lipschitz bound đứng sau phân biệt 'exact SDF' và 'bound SDF' của bài học — một SDF march được miễn là nó không bao giờ đánh giá quá (overestimate) khoảng cách thật.",
      en: "The source of the Lipschitz-bound concept behind this lesson's exact-vs-bound SDF distinction — an SDF stays marchable as long as it never overestimates the true distance.",
    },
  },
  {
    id: "iquilezles-raymarchingdf-primitives",
    type: "article",
    title: "Raymarching SDFs",
    authors: ["Inigo Quilez"],
    url: "https://iquilezles.org/articles/raymarchingdf/",
    note: {
      vi: "Bối cảnh chung cho cách các primitive của bài này ghép vào một vòng lặp raymarch hoàn chỉnh — cùng nguồn đã dẫn ở bài `sphere-tracing-principle`.",
      en: "General context for how this lesson's primitives plug into a full raymarch loop — the same source cited in the `sphere-tracing-principle` lesson.",
    },
  },
];
