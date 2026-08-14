import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "three-gpucomputationrenderer-source",
    type: "repo",
    title: "three.js — examples/jsm/misc/GPUComputationRenderer.js (tag r185)",
    authors: ["mrdoob and contributors"],
    url: "https://github.com/mrdoob/three.js/blob/r185/examples/jsm/misc/GPUComputationRenderer.js",
    note: {
      vi: "Nguồn thật của lớp học xuyên suốt capstone này — dùng để xác minh hành vi `setDataType`/`addVariable`/`dispose()` thay vì suy đoán qua doc, đúng phiên bản three cài trong dự án.",
      en: "The actual source of the class this capstone is built on — used to verify `setDataType`/`addVariable`/`dispose()` behavior instead of guessing from docs, matching the three version installed in this project.",
    },
  },
  {
    id: "bridson-2007-curl-noise",
    type: "paper",
    title: "Curl-Noise for Procedural Fluid Flow",
    authors: ["Robert Bridson", "Jim Hourihan", "Marcus Nordenstam"],
    year: 2007,
    url: "https://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph2007-curlnoise.pdf",
    note: {
      vi: "Bài báo SIGGRAPH 2007 gốc chứng minh công thức curl 3D $F=\\nabla\\times\\Psi$ mà flow field của capstone này dùng, cùng phần bàn về life-cycle/respawn cho hệ particle vô hạn — đúng vấn đề mốc 2 giải quyết.",
      en: "The original SIGGRAPH 2007 paper — the 3D curl formula $F=\\nabla\\times\\Psi$ this capstone's flow field is built on, plus a discussion of particle life-cycle/respawn for unbounded systems — exactly what milestone 2 solves.",
    },
  },
  {
    id: "three-webgl-gpgpu-birds-example",
    type: "article",
    title: "three.js — webgl_gpgpu_birds (official example)",
    authors: ["mrdoob and contributors"],
    url: "https://threejs.org/examples/webgl_gpgpu_birds.html",
    note: {
      vi: "Ví dụ chính thức dùng GPUComputationRenderer ở quy mô lớn cho một đàn chim — kiến trúc state-texture + instanced render gần giống hệt những gì capstone này mở rộng lên một triệu particle.",
      en: "The official example using GPUComputationRenderer at scale for a flock of birds — nearly the same state-texture + instanced-render architecture this capstone scales up to one million particles.",
    },
  },
  {
    id: "khronos-ext-color-buffer-float",
    type: "spec",
    title: "WebGL EXT_color_buffer_float Extension Specification",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/webgl/extensions/EXT_color_buffer_float/",
    note: {
      vi: "Đặc tả extension bắt buộc để render vào một state texture float/half-float trên WebGL2 — cơ sở cho yêu cầu `HalfFloatType` của capstone thay vì `FloatType` mặc định.",
      en: "The spec for the extension required to render into a float/half-float state texture on WebGL2 — the basis for this capstone's `HalfFloatType` requirement instead of the default `FloatType`.",
    },
  },
];
