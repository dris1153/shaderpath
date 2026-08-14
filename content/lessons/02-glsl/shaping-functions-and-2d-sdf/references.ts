import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "book-of-shaders-shaping-functions",
    type: "article",
    title: "The Book of Shaders — Chapter 5: Shaping Functions",
    authors: ["Patricio Gonzalez Vivo", "Jen Lowe"],
    url: "https://thebookofshaders.com/05/",
    note: {
      vi: "Nguồn gốc khung tư duy 'shaping function' của bài này — pow, step, smoothstep như những công cụ uốn nắn đường cong input→output, trước khi áp dụng vào distance field.",
      en: "The source of this lesson's 'shaping function' framing — pow, step, smoothstep as tools for bending the input→output curve, before applying them to a distance field.",
    },
  },
  {
    id: "book-of-shaders-shapes",
    type: "article",
    title: "The Book of Shaders — Chapter 7: Shapes",
    authors: ["Patricio Gonzalez Vivo", "Jen Lowe"],
    url: "https://thebookofshaders.com/07/",
    note: {
      vi: "Chương vẽ hình bằng distance field — cùng công thức length(p)-r cho hình tròn mà demo của bài này dùng, giải thích bằng chính GLSL thật.",
      en: "The chapter on drawing shapes with distance fields — the exact length(p)-r circle formula this lesson's demo uses, explained with real GLSL.",
    },
  },
  {
    id: "iq-2d-distance-functions",
    type: "article",
    title: "2D Signed Distance Functions",
    authors: ["Inigo Quilez"],
    url: "https://iquilezles.org/articles/distfunctions2d/",
    note: {
      vi: "Bộ sưu tập SDF 2D chuẩn mực (tròn, box, tam giác, đa giác...) từ tác giả đặt nền móng cho kỹ thuật này — tra cứu khi cần SDF phức tạp hơn hình tròn của bài học.",
      en: "The canonical collection of 2D SDFs (circle, box, triangle, polygon...) from the author who pioneered the technique — the reference to reach for once you need shapes beyond this lesson's circle.",
    },
  },
  {
    id: "khronos-glsl-es-300-spec",
    type: "spec",
    title: "The OpenGL ES Shading Language, Version 3.00",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/OpenGL/specs/es/3.0/GLSL_ES_Specification_3.00.pdf",
    note: {
      vi: "Nguồn chuẩn định nghĩa smoothstep, fwidth, dFdx/dFdy trong GLSL ES 3.00 (WebGL2) — dùng để kiểm chứng đoạn về fwidth trong bài không phải suy đoán.",
      en: "The authoritative source defining smoothstep, fwidth, and dFdx/dFdy in GLSL ES 3.00 (WebGL2) — grounds this lesson's fwidth discussion in the actual spec, not guesswork.",
    },
  },
];
