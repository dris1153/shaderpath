import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "iq-better-fog",
    type: "article",
    title: "Better Fog",
    authors: ["Inigo Quilez"],
    url: "https://iquilezles.org/articles/fog/",
    note: {
      vi: "Nguồn gốc trực tiếp của mọi công thức trong bài: distance fog, height fog dạng tích phân đóng, và cách trộn màu fog theo góc nhìn-mặt trời (inscattering).",
      en: "The direct source of every formula in this lesson: distance fog, the closed-form height-fog integral, and blending fog color by view-sun angle (inscattering).",
    },
  },
  {
    id: "gpugems2-atmospheric-scattering",
    type: "article",
    title: "GPU Gems 2 — Chapter 16: Accurate Atmospheric Scattering",
    authors: ["Sean O'Neil"],
    url: "https://developer.nvidia.com/gpugems/gpugems2/part-ii-shading-lighting-and-shadows/chapter-16-accurate-atmospheric-scattering",
    note: {
      vi: "Mô hình Rayleigh/Mie thật, tích phân theo bước sóng — đọc để thấy rõ sky trong bài này (pow() + gradient) là một xấp xỉ nghệ thuật rẻ tiền tới mức nào so với bản đầy đủ.",
      en: "The real Rayleigh/Mie model, integrated per wavelength — read this to see just how cheap and artistic this lesson's pow()-and-gradient sky really is next to the full thing.",
    },
  },
  {
    id: "scratchapixel-volume-rendering-intro",
    type: "article",
    title: "Volume Rendering for Developers: Foundations",
    url: "https://www.scratchapixel.com/lessons/3d-basic-rendering/volume-rendering-for-developers/intro-volume-rendering.html",
    note: {
      vi: "Suy ra định luật Beer-Lambert (T = exp(-distance*sigma)) từ đầu bằng lập luận xác suất — nền tảng toán học phía sau công thức transmittance dùng suốt bài này.",
      en: "Derives the Beer-Lambert law (T = exp(-distance*sigma)) from first principles with a probabilistic argument — the math underneath every transmittance formula this lesson uses.",
    },
  },
];
