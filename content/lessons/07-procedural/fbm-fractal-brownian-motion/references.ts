import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "book-of-shaders-fbm",
    type: "article",
    title: "The Book of Shaders — Chapter 13: Fractal Brownian Motion",
    authors: ["Patricio Gonzalez Vivo", "Jen Lowe"],
    url: "https://thebookofshaders.com/13/",
    note: {
      vi: "Chương giới thiệu FBM bằng GLSL thật, cùng vòng lặp amplitude/frequency mà bài học này dùng làm nền tảng.",
      en: "The chapter introducing FBM with real GLSL, using the same amplitude/frequency loop this lesson builds on.",
    },
  },
  {
    id: "iq-fbm-article",
    type: "article",
    title: "fBM (Fractional Brownian Motion)",
    authors: ["Inigo Quilez"],
    url: "https://iquilezles.org/articles/fbm/",
    note: {
      vi: "Phân tích fBm dưới góc nhìn phổ tần số (spectral) — nguồn của khung tư duy 'octave là điểm lấy mẫu trên một phổ, không phải mức chi tiết thiết kế thủ công' ở cuối bài.",
      en: "Analyzes fBm through a spectral lens — the source of this lesson's closing 'octaves are spectrum samples, not hand-designed detail levels' framing.",
    },
  },
  {
    id: "gpu-gems-3-procedural-terrains",
    type: "article",
    title: "GPU Gems 3, Chapter 1 — Generating Complex Procedural Terrains Using the GPU",
    authors: ["Ryan Geiss"],
    year: 2007,
    url: "https://developer.nvidia.com/gpugems/gpugems3/part-i-geometry/chapter-1-generating-complex-procedural-terrains-using-gpu",
    note: {
      vi: "Ứng dụng thực tế của ridged FBM cho địa hình núi đá trên GPU — bối cảnh sản xuất cho biến thể 'ridged FBM (1-abs)' bài học giới thiệu.",
      en: "A real production use of ridged FBM for rocky terrain on the GPU — the production context behind this lesson's 'ridged FBM (1-abs)' variant.",
    },
  },
];
