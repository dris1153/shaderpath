import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-manual-webgpurenderer",
    type: "article",
    title: "Three.js Manual — WebGPURenderer",
    authors: ["three.js contributors"],
    url: "https://threejs.org/manual/en/webgpurenderer.html",
    note: {
      vi: "Nguồn chính thức xác nhận WebGPURenderer tự fallback sang backend WebGL2 khi trình duyệt thiếu WebGPU, cách dùng forceWebGL, và vì sao phải await renderer.init() trước lần render đầu.",
      en: "The official source confirming WebGPURenderer auto-falls-back to a WebGL2 backend when the browser lacks WebGPU, how forceWebGL works, and why you must await renderer.init() before the first render.",
    },
  },
  {
    id: "threejs-wiki-tsl",
    type: "repo",
    title: "Three.js Shading Language (TSL) Wiki",
    authors: ["mrdoob", "three.js contributors"],
    url: "https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language",
    note: {
      vi: "Wiki chính thức của TSL — nguồn tra cứu cho tên node, cú pháp import và ví dụ colorNode/positionNode, dùng để xác nhận API trong bài này đúng với bản three.js hiện hành.",
      en: "TSL's official wiki — the reference for node names, import syntax and colorNode/positionNode examples, used to verify this lesson's API against the current three.js release.",
    },
  },
  {
    id: "mdn-webgpu-api",
    type: "article",
    title: "WebGPU API — MDN Web Docs",
    authors: ["MDN contributors"],
    url: "https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API",
    note: {
      vi: "Tổng quan độc lập với Three.js về WebGPU API của trình duyệt — giải thích compute shader như một pipeline hạng nhất, đối chiếu với phần TSL/WebGPURenderer chỉ nói qua lăng kính Three.js.",
      en: "A Three.js-independent overview of the browser's WebGPU API — explains compute shaders as a first-class pipeline, a useful counterpoint to the Three.js-only lens the rest of this lesson uses.",
    },
  },
  {
    id: "w3c-webgpu-spec",
    type: "spec",
    title: "WebGPU (W3C Candidate Recommendation Draft)",
    authors: ["W3C GPU for the Web Community Group"],
    url: "https://www.w3.org/TR/webgpu/",
    note: {
      vi: "Đặc tả chuẩn (không phải bài diễn giải lại) định nghĩa GPURenderPipeline, GPUCommandEncoder và các khái niệm WGSL biên dịch ra — nơi tra cứu khi phần WebGPU của bài chưa đủ chi tiết.",
      en: "The authoritative spec (not a paraphrase) defining GPURenderPipeline, GPUCommandEncoder and the concepts WGSL compiles down to — the reference to reach for when this lesson's WebGPU parts need more depth.",
    },
  },
];
