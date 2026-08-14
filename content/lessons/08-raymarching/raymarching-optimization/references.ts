import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "iquilezles-sdfbounding",
    type: "article",
    title: "Inigo Quilez — Bounding Volumes for SDF Raymarching",
    authors: ["Inigo Quilez"],
    url: "https://iquilezles.org/articles/sdfbounding/",
    note: {
      vi: "Bài gốc mô tả kỹ thuật bounding volume cho raymarching — nguồn của phần ray-box slab test trong bài này, cùng bàn luận về cấu trúc tăng tốc phức tạp hơn.",
      en: "The original writeup on bounding volumes for raymarching — the source of this lesson's ray-box slab test, plus discussion of more advanced acceleration structures.",
    },
  },
  {
    id: "keinert-enhanced-sphere-tracing",
    type: "paper",
    title: "Enhanced Sphere Tracing",
    authors: [
      "Benjamin Keinert",
      "Henry Schäfer",
      "Johann Korndörfer",
      "Urs Ganse",
      "Marc Stamminger",
    ],
    year: 2014,
    url: "https://diglib.eg.org/items/8ea5fa60-fe2f-4fef-8fd0-3783cb3200f0",
    note: {
      vi: "Paper Eurographics 2014 định nghĩa over-relaxation an toàn và cơ chế phát hiện overshoot — bài này chỉ dùng một bản rút gọn của thuật toán đầy đủ trong paper.",
      en: "The Eurographics 2014 paper defining safe over-relaxation and overshoot detection — this lesson's demo uses only a simplified heuristic from the full algorithm described here.",
    },
  },
  {
    id: "hart-sphere-tracing-1996",
    type: "paper",
    title:
      "Sphere Tracing: A Geometric Method for the Antialiased Ray Tracing of Implicit Surfaces",
    authors: ["John C. Hart"],
    year: 1996,
    url: "https://graphics.stanford.edu/courses/cs348b-20-spring-content/uploads/hart.pdf",
    note: {
      vi: "Paper gốc đặt tên và định nghĩa sphere tracing — đọc để hiểu vì sao bước march tiêu chuẩn (không relax) vốn đã được chứng minh an toàn, làm rõ tại sao relax cần một cơ chế bù trừ riêng.",
      en: "The original paper that named and defined sphere tracing — read it to see why the unrelaxed step was proven safe in the first place, which clarifies exactly why relaxation needs its own compensating mechanism.",
    },
  },
  {
    id: "spectorjs-repo",
    type: "repo",
    title: "Spector.js — WebGL Frame Debugger and Profiler",
    authors: ["BabylonJS"],
    url: "https://github.com/BabylonJS/Spector.js",
    note: {
      vi: "Công cụ capture từng draw call thật trên GPU — điểm tham chiếu khi cần số đo đáng tin hơn con số ước lượng trong demo của bài này.",
      en: "A tool that captures real per-draw-call GPU data — the reference point for when this lesson's demo estimate isn't precise enough.",
    },
  },
];
