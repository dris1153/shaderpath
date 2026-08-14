import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "iq-dynamic-clouds",
    type: "article",
    title: "Dynamic Clouds",
    authors: ["Inigo Quilez"],
    url: "https://iquilezles.org/articles/dynclouds/",
    note: {
      vi: "Kỹ thuật march qua một trường FBM đã ngưỡng hoá để dựng mây thời gian thực — cùng ý tưởng 'falloff x fbm' của bài này, viết bởi người đã dùng nó trong demoscene từ trước cả khi shader GPU tồn tại.",
      en: "The technique of marching through a thresholded FBM field to render real-time clouds — the same 'falloff x fbm' idea this lesson uses, written by someone using it in the demoscene before GPU shaders even existed.",
    },
  },
  {
    id: "scratchapixel-volume-rendering-intro",
    type: "article",
    title: "Volume Rendering for Developers: Foundations",
    url: "https://www.scratchapixel.com/lessons/3d-basic-rendering/volume-rendering-for-developers/intro-volume-rendering.html",
    note: {
      vi: "Suy ra transmittance, absorption và phép trộn front-to-back từ đầu — chương này chứng minh chặt chẽ đúng công thức T *= exp(-density*stepLen) mà bài dùng.",
      en: "Derives transmittance, absorption and front-to-back blending from scratch — this chapter rigorously proves the exact T *= exp(-density*stepLen) formula this lesson uses.",
    },
  },
  {
    id: "gpugems3-volumetric-light-scattering",
    type: "article",
    title: "GPU Gems 3 — Chapter 13: Volumetric Light Scattering as a Post-Process",
    authors: ["Kenny Mitchell"],
    url: "https://developer.nvidia.com/gpugems/gpugems3/part-ii-light-and-shadows/chapter-13-volumetric-light-scattering-post-process",
    note: {
      vi: "Một kỹ thuật production thật cho god ray/ánh sáng xuyên khí quyển — hữu ích để thấy đạo hàm 1-2 mẫu của bài này so với một giải pháp đã tối ưu chi phí ra sao.",
      en: "A real production technique for god rays / light scattering through atmosphere — useful for seeing how this lesson's 1-2-tap derivative compares to an already cost-optimized solution.",
    },
  },
];
