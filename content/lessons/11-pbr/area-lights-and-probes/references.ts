import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "heitz-ltc-2016",
    type: "paper",
    title: "Real-Time Polygonal-Light Shading with Linearly Transformed Cosines",
    authors: ["Eric Heitz", "Jonathan Dupuy", "Stephen Hill", "David Neubelt"],
    year: 2016,
    url: "https://eheitzresearch.wordpress.com/415-2/",
    note: {
      vi: "Bài báo gốc SIGGRAPH 2016 giới thiệu LTC — nguồn của toàn bộ ý tưởng 'xấp xỉ GGX bằng cosine biến đổi tuyến tính' trong bài, kèm mã nguồn tham khảo (ltc_code) three.js dùng để tính LUT.",
      en: "The original SIGGRAPH 2016 paper introducing LTC — the source of this lesson's whole 'approximate GGX with a linearly transformed cosine' idea, including the reference code (ltc_code) three.js's LUT is built from.",
    },
  },
  {
    id: "learnopengl-area-lights",
    type: "article",
    title: "LearnOpenGL — Area Lights",
    authors: ["Joey de Vries", "Wen Xu (guest article)"],
    url: "https://learnopengl.com/Guest-Articles/2022/Area-Lights",
    note: {
      vi: "Giải thích LTC bằng ngôn ngữ ít công thức hơn bản gốc, tốt để đối chiếu trực giác 'biến đổi tuyến tính rồi tích phân cosine kẹp' trước khi đọc mã nguồn three.js.",
      en: "Explains LTC with fewer formulas than the original paper — a good cross-check for the 'linearly transform, then integrate a clamped cosine' intuition before reading the three.js source.",
    },
  },
  {
    id: "ramamoorthi-hanrahan-sh-2001",
    type: "paper",
    title: "An Efficient Representation for Irradiance Environment Maps",
    authors: ["Ravi Ramamoorthi", "Pat Hanrahan"],
    year: 2001,
    url: "https://graphics.stanford.edu/papers/envmap/envmap.pdf",
    note: {
      vi: "Nguồn gốc kỹ thuật SH9 mà `SphericalHarmonics3`/`LightProbeGenerator` của three.js cài đặt — chính bài báo này được trích dẫn thẳng trong comment đầu file `SphericalHarmonics3.js`.",
      en: "The origin of the SH9 technique three.js's `SphericalHarmonics3`/`LightProbeGenerator` implement — this exact paper is cited directly in the doc comment at the top of `SphericalHarmonics3.js`.",
    },
  },
  {
    id: "threejs-docs-lightprobegenerator",
    type: "article",
    title: "Three.js Docs — LightProbeGenerator",
    authors: ["Three.js contributors"],
    url: "https://threejs.org/docs/pages/LightProbeGenerator.html",
    note: {
      vi: "Chữ ký chính thức của `fromCubeTexture`/`fromCubeRenderTarget` dùng trong demo và ví dụ code của bài — đối chiếu với mã nguồn thật đọc trong `node_modules`.",
      en: "The official signatures for `fromCubeTexture`/`fromCubeRenderTarget` used in this lesson's demo and code examples — cross-checked against the real source read from `node_modules`.",
    },
  },
];
