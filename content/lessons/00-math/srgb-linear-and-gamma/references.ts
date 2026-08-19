import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "wikipedia-srgb-transfer-function",
    type: "article",
    title: "sRGB — Transfer Function (\"Gamma\")",
    url: "https://en.wikipedia.org/wiki/SRGB",
    note: {
      vi: "Công thức piecewise chính xác (ngưỡng 0.04045, luỹ thừa 2.4, hằng số 0.055/1.055) mà bài này dùng để tính linear ≈ 0.214 từ srgb = 0.5 — chính xác hơn xấp xỉ pow(2.2).",
      en: "The exact piecewise formula (0.04045 threshold, power 2.4, constants 0.055/1.055) this lesson uses to compute linear ≈ 0.214 from srgb = 0.5 — more precise than the pow(2.2) shorthand.",
    },
  },
  {
    id: "learnopengl-gamma-correction",
    type: "article",
    title: "LearnOpenGL — Gamma Correction",
    authors: ["Joey de Vries"],
    url: "https://learnopengl.com/Advanced-Lighting/Gamma-Correction",
    note: {
      vi: "Cùng ví dụ số với bài này — (0.5,0,0)^(1/2.2) ≈ (0.73,0,0) — và giải thích glEnable(GL_FRAMEBUFFER_SRGB) cùng texture GL_SRGB tự decode/encode ở đâu trong pipeline OpenGL.",
      en: "Works the same numeric example as this lesson — (0.5,0,0)^(1/2.2) ≈ (0.73,0,0) — and explains where glEnable(GL_FRAMEBUFFER_SRGB) and GL_SRGB textures auto decode/encode in the OpenGL pipeline.",
    },
  },
  {
    id: "threejs-color-management-manual",
    type: "article",
    title: "Three.js Manual — Color Management",
    url: "https://threejs.org/manual/en/color-management.html",
    note: {
      vi: "Nguồn cho phần Three.js r152+ của bài này: renderer.outputColorSpace, texture.colorSpace = SRGBColorSpace, và vì sao data texture phải giữ NoColorSpace.",
      en: "The source for this lesson's Three.js r152+ section: renderer.outputColorSpace, texture.colorSpace = SRGBColorSpace, and why data textures must stay NoColorSpace.",
    },
  },
];
