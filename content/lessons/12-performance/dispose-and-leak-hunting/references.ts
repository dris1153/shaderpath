import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-manual-dispose-objects",
    type: "article",
    title: "Three.js Manual — How to Dispose of Objects",
    authors: ["Three.js contributors"],
    url: "https://threejs.org/manual/en/how-to-dispose-of-objects.html",
    note: {
      vi: "Nguồn gốc của toàn bộ 'danh sách phải dispose' trong bài này — liệt kê chính xác geometry/material/texture/render target nào cấp phát tài nguyên GPU thật.",
      en: "The source of this lesson's entire 'dispose list' — spells out exactly which geometries/materials/textures/render targets allocate real GPU resources.",
    },
  },
  {
    id: "threejs-source-webgl-properties",
    type: "repo",
    title: "Three.js source — WebGLProperties.js",
    authors: ["mrdoob and contributors"],
    url: "https://github.com/mrdoob/three.js/blob/dev/src/renderers/webgl/WebGLProperties.js",
    note: {
      vi: "Mã nguồn thật của WeakMap nội bộ mà mọi manager (WebGLTextures, WebGLGeometries...) dùng để ánh xạ object Three.js sang handle GPU — nguồn xác nhận cho phần 'dispose() thực sự làm gì' của bài này.",
      en: "The actual source of the internal WeakMap every manager (WebGLTextures, WebGLGeometries...) uses to map a Three.js object to its GPU handle — the source this lesson's 'what dispose() actually does' section was verified against.",
    },
  },
  {
    id: "chrome-devtools-fix-memory-problems",
    type: "article",
    title: "Chrome DevTools — Fix Memory Problems",
    authors: ["Chrome DevTools team"],
    url: "https://developer.chrome.com/docs/devtools/memory-problems",
    note: {
      vi: "Hướng dẫn chính thức cho quy trình heap snapshot capture → act → capture, chế độ Comparison, và đọc cây Retainers — quy trình mà phần săn leak của bài này mô tả lại bằng lời.",
      en: "The official guide to the capture → act → capture heap-snapshot workflow, Comparison mode, and reading the Retainers tree — the procedure this lesson's leak-hunting section walks through in prose.",
    },
  },
  {
    id: "r3f-docs-objects-automatic-disposal",
    type: "article",
    title: "React Three Fiber — Objects, Properties and Constructor Arguments",
    url: "https://r3f.docs.pmnd.rs/api/objects",
    note: {
      vi: "Nguồn cho ranh giới auto-dispose của R3F và cờ dispose={null} — cơ sở cho phần 'R3F tự lo gì' của bài này.",
      en: "The source for R3F's auto-dispose boundary and the dispose={null} escape hatch — the basis for this lesson's 'what R3F handles' section.",
    },
  },
];
