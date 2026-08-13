import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "khronos-glsl-es-300-spec",
    type: "spec",
    title: "The OpenGL ES Shading Language, Version 3.00 (GLSL ES 3.00 Spec)",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/OpenGL/specs/es/3.0/GLSL_ES_Specification_3.00.pdf",
    note: {
      vi: "Nguồn chuẩn định nghĩa gl_Position, quy tắc khớp in/out giữa các shader stage, và cách varying được nội suy — chương liên quan trực tiếp tới toàn bộ bài này.",
      en: "The authoritative source defining gl_Position, the in/out matching rules between shader stages, and how varyings get interpolated — the chapters this lesson draws on directly.",
    },
  },
  {
    id: "webgl-fundamentals-how-it-works",
    type: "article",
    title: "WebGL Fundamentals — WebGL How It Works",
    authors: ["Gregg Tavares"],
    url: "https://webglfundamentals.org/webgl/lessons/webgl-how-it-works.html",
    note: {
      vi: "Giải thích trực quan rasterization và nội suy varying bằng ví dụ vẽ tay, không cần biết trước ma trận — đọc trước khi vào phần barycentric coordinates của bài này.",
      en: "A visual, hand-drawn walkthrough of rasterization and varying interpolation that needs no matrix background — read before this lesson's barycentric coordinates section.",
    },
  },
  {
    id: "scratchapixel-rasterization",
    type: "article",
    title: "Scratchapixel — Rasterization: a Practical Implementation",
    url: "https://www.scratchapixel.com/lessons/3d-basic-rendering/rasterization-practical-implementation/rasterization-stage.html",
    note: {
      vi: "Bài viết chặt chẽ nhất về công thức toạ độ trọng tâm (barycentric) và cách nó vừa quyết định coverage vừa nội suy varying trong cùng một phép tính.",
      en: "The most rigorous treatment of the barycentric coordinate formula, and how it simultaneously decides coverage and drives varying interpolation in a single computation.",
    },
  },
  {
    id: "khronos-webgl2-spec-frag",
    type: "spec",
    title: "WebGL 2.0 Specification",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/webgl/specs/latest/2.0/",
    note: {
      vi: "Nguồn chuẩn cho hành vi drawArrays, primitive assembly và cách WebGL2 gọi tới rasterizer cố định của GPU.",
      en: "The authoritative source for drawArrays behavior, primitive assembly, and how WebGL2 hands off to the GPU's fixed-function rasterizer.",
    },
  },
];
