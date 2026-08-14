import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "wikipedia-orders-of-magnitude-luminance",
    type: "article",
    title: "Orders of Magnitude (Luminance)",
    authors: ["Wikipedia contributors"],
    url: "https://en.wikipedia.org/wiki/Orders_of_magnitude_(luminance)",
    note: {
      vi: "Bảng độ chói (cd/m^2) thực tế theo bậc 10 — nguồn của con số đĩa mặt trời ~1.6x10^9 cd/m^2 so với bầu trời trong ~10^4 cd/m^2 (~5 bậc độ lớn) dùng trong bài.",
      en: "A table of real-world luminance values (cd/m^2) by power of ten — the source of the ~1.6x10^9 cd/m^2 solar disk vs ~10^4 cd/m^2 clear-sky comparison (~5 orders of magnitude) used in this lesson.",
    },
  },
  {
    id: "filament-physically-based-camera",
    type: "spec",
    title: "Physically Based Rendering in Filament — Physically Based Camera / Directional Lights",
    authors: ["Google"],
    url: "https://google.github.io/filament/Filament.md.html",
    note: {
      vi: "Bảng đo thật ánh sáng ngoài trời ở California (sun-alone ~105,000 lux, sky-alone ~25,000 lux, trăng tròn ~1 lux giữa trưa) — nguồn của các con số ước lượng illuminance trong bài.",
      en: "A real measured table of outdoor light in California (sun-alone ~105,000 lux, sky-alone ~25,000 lux, full moon ~1 lux at noon) — the source of the illuminance estimates cited in this lesson.",
    },
  },
  {
    id: "polyhaven-hdris",
    type: "repo",
    title: "Poly Haven — HDRIs",
    url: "https://polyhaven.com/hdris",
    note: {
      vi: "Thư viện HDRI thật, chất lượng cao, dùng để load bằng HDRLoader trong một dự án thật thay vì DataTexture sinh bằng code như demo bài này.",
      en: "A library of real, high-quality HDRIs to load with HDRLoader in a real project, instead of the code-generated DataTexture this lesson's demo uses.",
    },
  },
  {
    id: "polyhaven-license",
    type: "article",
    title: "Poly Haven — License",
    url: "https://polyhaven.com/license",
    note: {
      vi: "Xác nhận toàn bộ thư viện Poly Haven license CC0 (Public Domain) — dùng thương mại tự do, không bắt buộc ghi công.",
      en: "Confirms Poly Haven's entire library is CC0-licensed (public domain) — free for commercial use, no attribution required.",
    },
  },
  {
    id: "threejs-hdrloader-docs",
    type: "article",
    title: "HDRLoader — three.js docs",
    authors: ["three.js contributors"],
    url: "https://threejs.org/docs/pages/HDRLoader.html",
    note: {
      vi: "Tài liệu chính thức của loader thay thế RGBELoader (deprecated từ r180) — xác nhận type mặc định HalfFloatType và cách gán mapping equirect.",
      en: "The official docs for the loader that replaces RGBELoader (deprecated as of r180) — confirms the default HalfFloatType and how to assign the equirect mapping.",
    },
  },
  {
    id: "cornell-rgbe-format",
    type: "article",
    title: "The Radiance RGBE Format",
    authors: ["Bruce Walter"],
    url: "http://www.graphics.cornell.edu/~bjw/rgbe.html",
    note: {
      vi: "Trang gốc mô tả định dạng RGBE (shared-exponent) — chính là nguồn three.js's HDRLoader.js ghi chú 'adapted from' trong code.",
      en: "The original page describing the RGBE (shared-exponent) format — the exact source three.js's HDRLoader.js credits as 'adapted from' in its own code comments.",
    },
  },
];
