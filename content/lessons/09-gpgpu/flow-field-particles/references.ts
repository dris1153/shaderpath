import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-source-gpucomputationrenderer",
    type: "repo",
    title: "three.js — examples/jsm/misc/GPUComputationRenderer.js (tag r185)",
    authors: ["mrdoob and contributors"],
    url: "https://github.com/mrdoob/three.js/blob/r185/examples/jsm/misc/GPUComputationRenderer.js",
    note: {
      vi: "Nguồn thật của `addVariable`/`setVariableDependencies`/`compute` — xác nhận `texturePosition`/`textureVelocity` được tự động khai báo uniform, và vì sao uniform tuỳ biến phải gán trước khi gọi `init()`.",
      en: "The real source of `addVariable`/`setVariableDependencies`/`compute` — confirms `texturePosition`/`textureVelocity` are auto-declared as uniforms, and why custom uniforms must be assigned before calling `init()`.",
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
      vi: "Bài báo SIGGRAPH 2007 gốc — chứng minh đầy đủ công thức curl 3D $F=\\nabla\\times\\Psi$ mà bài này chỉ tóm tắt, cùng phần bàn về life-cycle/respawn cho hệ particle vô hạn.",
      en: "The original SIGGRAPH 2007 paper — the full derivation of the 3D curl formula $F=\\nabla\\times\\Psi$ this lesson only summarizes, plus a discussion of particle life-cycle/respawn for unbounded systems.",
    },
  },
  {
    id: "mdn-ext-color-buffer-float",
    type: "spec",
    title: "MDN — EXT_color_buffer_float",
    url: "https://developer.mozilla.org/en-US/docs/Web/API/EXT_color_buffer_float",
    note: {
      vi: "Extension WebGL2 bắt buộc để render vào texture Float đầy đủ — lý do bài này gọi `setDataType(THREE.HalfFloatType)` làm mặc định an toàn thay vì FloatType.",
      en: "The WebGL2 extension required to render into full Float textures — the reason this lesson calls `setDataType(THREE.HalfFloatType)` as the safe default instead of FloatType.",
    },
  },
  {
    id: "threejs-docs-points",
    type: "article",
    title: "Three.js Docs — Points",
    url: "https://threejs.org/docs/#api/en/objects/Points",
    note: {
      vi: "Tài liệu chính thức của đối tượng `Points` dùng để render đám mây particle — đối chiếu với cách demo này override hoàn toàn `gl_Position` bằng texture thay vì attribute position tĩnh.",
      en: "The official docs for the `Points` object used to render the particle cloud — compare against how this demo fully overrides `gl_Position` from a texture instead of a static position attribute.",
    },
  },
];
