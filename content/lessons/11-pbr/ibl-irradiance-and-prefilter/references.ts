import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "karis-real-shading-ue4-2013",
    type: "paper",
    title: "Real Shading in Unreal Engine 4 (SIGGRAPH 2013 course notes)",
    authors: ["Brian Karis"],
    year: 2013,
    url: "https://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf",
    note: {
      vi: "Nguồn gốc của split-sum approximation dùng trong bài này — công thức tách tích phân specular thành prefiltered environment × BRDF LUT, đúng những gì Three.js cài đặt.",
      en: "The original source of the split-sum approximation this lesson covers — the specular integral split into prefiltered environment × BRDF LUT, exactly what Three.js implements.",
    },
  },
  {
    id: "learnopengl-diffuse-irradiance",
    type: "article",
    title: "LearnOpenGL — PBR: Diffuse Irradiance",
    authors: ["Joey de Vries"],
    url: "https://learnopengl.com/PBR/IBL/Diffuse-irradiance",
    note: {
      vi: "Giải thích từng bước cách convolve một environment map theo cosine để ra irradiance map — bản viết tay không dùng Three.js, tốt để đối chiếu với những gì PMREMGenerator làm bên trong.",
      en: "A step-by-step walkthrough of cosine-convolving an environment map into an irradiance map — a from-scratch implementation with no Three.js, useful for cross-checking what PMREMGenerator does internally.",
    },
  },
  {
    id: "learnopengl-specular-ibl",
    type: "article",
    title: "LearnOpenGL — PBR: Specular IBL",
    authors: ["Joey de Vries"],
    url: "https://learnopengl.com/PBR/IBL/Specular-IBL",
    note: {
      vi: "Giải thích prefiltered environment map (mip chain theo roughness) và BRDF integration map (LUT 2D) — chính hai thành phần bài này gọi là prefiltered environment và BRDF LUT.",
      en: "Covers the prefiltered environment map (the roughness-indexed mip chain) and the BRDF integration map (the 2D LUT) — the exact two pieces this lesson calls the prefiltered environment and the BRDF LUT.",
    },
  },
  {
    id: "filament-image-based-lights",
    type: "article",
    title: "Filament — Physically Based Rendering: Image-based lights",
    authors: ["Google"],
    url: "https://google.github.io/filament/Filament.md.html#lighting/imagebasedlights",
    note: {
      vi: "Tài liệu kỹ thuật của một PBR engine sản xuất thật (Android/Filament) mô tả cùng pipeline prefilter, kèm bảng giá trị F0 tham khảo cho vật liệu kim loại dùng trong bài checkpoint trước.",
      en: "Production-grade PBR engine documentation (Android/Filament) describing the same prefiltering pipeline, including a reference F0 table for metals used in the previous checkpoint lesson.",
    },
  },
  {
    id: "real-time-rendering-4th-edition",
    type: "book",
    title: "Real-Time Rendering, 4th Edition — Chapter 10: Local Illumination",
    authors: ["Tomas Akenine-Möller", "Eric Haines", "Naty Hoffman", "Angelo Pesce", "Michal Iwanicki", "Sébastien Hillaire"],
    year: 2018,
    note: {
      vi: "Chương sách kinh điển bao quát toàn bộ lý thuyết BRDF/IBL nền tảng cho cả track này — không có bản online chính thức miễn phí, chỉ liệt kê như tài liệu tham khảo bổ sung.",
      en: "The classic textbook chapter covering the BRDF/IBL theory underlying this whole track — no official free online copy, listed as a supplementary reference only.",
    },
  },
];
