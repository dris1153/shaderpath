import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "three-gpucomputationrenderer-source",
    type: "repo",
    title: "three.js — GPUComputationRenderer.js (source)",
    authors: ["mrdoob and contributors"],
    url: "https://github.com/mrdoob/three.js/blob/master/examples/jsm/misc/GPUComputationRenderer.js",
    note: {
      vi: "Nguồn thật của lớp học trong bài này — dùng để xác minh mọi khẳng định về hành vi (dispose(), thiếu fallback HalfFloatType, cách chèn uniform dependency) thay vì suy đoán qua doc.",
      en: "The actual source of the class this lesson teaches — used to verify every behavioral claim here (dispose(), the missing HalfFloatType fallback, how dependency uniforms get injected) instead of guessing from docs.",
    },
  },
  {
    id: "three-webgl-gpgpu-birds-example",
    type: "article",
    title: "three.js — webgl_gpgpu_birds (official example)",
    authors: ["mrdoob and contributors"],
    url: "https://threejs.org/examples/webgl_gpgpu_birds.html",
    note: {
      vi: "Ví dụ chính thức dùng GPUComputationRenderer với hai biến phụ thuộc lẫn nhau (position/velocity) cho một đàn chim — cấu trúc gần giống hệt demo của bài này, ở quy mô lớn hơn.",
      en: "The official example using GPUComputationRenderer with two mutually dependent variables (position/velocity) for a flock of birds — nearly the same structure as this lesson's demo, at larger scale.",
    },
  },
  {
    id: "khronos-ext-color-buffer-float",
    type: "spec",
    title: "WebGL EXT_color_buffer_float Extension Specification",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/webgl/extensions/EXT_color_buffer_float/",
    note: {
      vi: "Đặc tả extension bắt buộc để render vào render target kiểu FloatType trên WebGL2 — nguồn cho phần thảo luận fallback kiểu texture trong bài.",
      en: "The spec for the extension required to render into a FloatType render target on WebGL2 — the source behind this lesson's texture-type fallback discussion.",
    },
  },
];
