import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "hart-1996-sphere-tracing",
    type: "paper",
    title:
      "Sphere Tracing: A Geometric Method for the Antialiased Ray Tracing of Implicit Surfaces",
    authors: ["John C. Hart"],
    year: 1996,
    url: "https://doi.org/10.1007/s003710050084",
    note: {
      vi: "Bài báo gốc đặt tên và chứng minh kỹ thuật của bài học: vì sao bước đúng bằng |f(p)| luôn an toàn, và giới thiệu khái niệm 'Lipschitz bound' đứng sau mọi SDF march được.",
      en: "The original paper naming and proving this lesson's technique — why stepping by exactly |f(p)| is always safe, and the Lipschitz-bound concept behind every marchable SDF.",
    },
  },
  {
    id: "iquilezles-raymarchingdf",
    type: "article",
    title: "Raymarching SDFs",
    authors: ["Inigo Quilez"],
    url: "https://iquilezles.org/articles/raymarchingdf/",
    note: {
      vi: "Tổng quan lịch sử và thực hành của raymarching SDF từ chính người phổ biến kỹ thuật này trong đồ hoạ thời gian thực — bối cảnh cho vòng lặp march ở bài học.",
      en: "A history-and-practice overview of raymarching SDFs from the person who popularized the technique in real-time graphics — the context behind this lesson's march loop.",
    },
  },
  {
    id: "iquilezles-terrainmarching",
    type: "article",
    title: "Raymarching Terrains",
    authors: ["Inigo Quilez"],
    url: "https://iquilezles.org/articles/terrainmarching/",
    note: {
      vi: "Thảo luận trực tiếp về adaptive step size và chi phí của các tia gần như song song với bề mặt — đúng cơ chế grazing ray làm thủng silhouette mà bài học giải thích.",
      en: "Discusses adaptive step sizing and the cost of rays nearly parallel to the surface directly — exactly the grazing-ray mechanism this lesson explains for silhouette holes.",
    },
  },
];
