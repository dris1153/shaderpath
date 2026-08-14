import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "learnopengl-pbr-theory",
    type: "article",
    title: "LearnOpenGL — PBR Theory",
    authors: ["Joey de Vries"],
    url: "https://learnopengl.com/PBR/Theory",
    note: {
      vi: "Trình bày công thức Schlick, phân biệt F0 điện môi (≤0.17) và F0 kim loại (0.5–1.0, có màu) — nguồn cho các con số so sánh trong bài.",
      en: "Walks through the Schlick formula and the dielectric-vs-metal F0 split (dielectric ≤0.17, metal 0.5–1.0 and colored) — the source for this lesson's comparison numbers.",
    },
  },
  {
    id: "filament-materials-guide",
    type: "article",
    title: "Filament — Materials Guide (Dielectrics & Reflectance)",
    authors: ["Google"],
    url: "https://google.github.io/filament/Materials.md.html",
    note: {
      vi: "Bảng IOR/phản xạ cho vật liệu điện môi (nước 2%, kính/nhựa 4–5%, đá quý 5–16%) và bảng màu F0 kim loại (vàng/đồng/sắt) dùng trong bài và trong demo.",
      en: "The dielectric IOR/reflectance table (water 2%, glass/plastics 4–5%, gemstones 5–16%) and the metal F0 color table (gold/copper/iron) this lesson and its demo pull numbers from.",
    },
  },
  {
    id: "wikipedia-refractive-indices",
    type: "article",
    title: "Wikipedia — List of Refractive Indices",
    url: "https://en.wikipedia.org/wiki/List_of_refractive_indices",
    note: {
      vi: "Nguồn IOR thô cho ba ví dụ tính tay: nước n=1.333, kính n≈1.5, kim cương n=2.417 (đo tại bước sóng natri D 589nm).",
      en: "Raw IOR source for the three worked examples: water n=1.333, glass n≈1.5, diamond n=2.417 (measured at the sodium D line, 589nm).",
    },
  },
  {
    id: "schlick-1994-inexpensive-brdf",
    type: "paper",
    title: "An Inexpensive BRDF Model for Physically-Based Rendering",
    authors: ["Christophe Schlick"],
    year: 1994,
    note: {
      vi: "Bài báo gốc đề xuất xấp xỉ F0 + (1-F0)(1-cosθ)^5 — không có URL ổn định công khai, trích dẫn làm nguồn gốc lịch sử của công thức.",
      en: "The original paper proposing the F0 + (1-F0)(1-cosθ)^5 approximation — no stable public URL, cited as the formula's historical origin.",
    },
  },
];
