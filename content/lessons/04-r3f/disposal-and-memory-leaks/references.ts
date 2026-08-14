import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "r3f-docs-objects-automatic-disposal",
    type: "article",
    title: "React Three Fiber — Objects, Properties and Constructor Arguments",
    url: "https://r3f.docs.pmnd.rs/api/objects",
    note: {
      vi: "Trang chính thức mô tả cơ chế auto-dispose và câu chốt hạ về primitive: 'Primitives will not dispose of the object they carry on unmount' — nguồn cho toàn bộ phần 'R3F tự dispose gì' của bài này.",
      en: "The official page describing the auto-dispose mechanism, including the key line: 'Primitives will not dispose of the object they carry on unmount' — the source for this lesson's 'what R3F disposes' section.",
    },
  },
  {
    id: "threejs-manual-dispose-objects",
    type: "article",
    title: "Three.js Manual — How to Dispose of Objects",
    authors: ["Three.js contributors"],
    url: "https://threejs.org/manual/en/how-to-dispose-of-objects.html",
    note: {
      vi: "Giải thích vì sao geometry/material/texture không tự giải phóng theo GC của JS, và những gì thực sự cần gọi .dispose() — nền tảng lý thuyết mà R3F chỉ tự động hoá một phần.",
      en: "Explains why geometries/materials/textures aren't reclaimed by JS's GC and exactly what needs an explicit .dispose() call — the underlying theory R3F only partially automates.",
    },
  },
  {
    id: "threejs-docs-webglrenderer-info",
    type: "spec",
    title: "Three.js Docs — WebGLRenderer.info",
    authors: ["Three.js contributors"],
    url: "https://threejs.org/docs/#api/en/renderers/WebGLRenderer",
    note: {
      vi: "Tài liệu API cho `renderer.info.memory.geometries`/`.textures`, công cụ đo leak dùng trong demo của bài này thay cho `performance.memory` không chuẩn hoá.",
      en: "The API reference for `renderer.info.memory.geometries`/`.textures`, the leak-measuring tool this lesson's demo relies on instead of the non-standard `performance.memory`.",
    },
  },
];
