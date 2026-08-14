import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "arm-tile-based-rendering-overview",
    type: "article",
    title: "Tile-Based Rendering — Arm Developer Documentation",
    authors: ["Arm Limited"],
    url: "https://developer.arm.com/documentation/102662/latest/Overview",
    note: {
      vi: "Nguồn chính thức mô tả tile 16×16px của Mali, giai đoạn tiling/binning và vì sao toàn bộ tile sống trong on-chip memory — nền tảng của cả bài học này.",
      en: "The official description of Mali's 16×16px tiles, the tiling/binning stage, and why a whole tile lives in on-chip memory — the foundation this whole lesson builds on.",
    },
  },
  {
    id: "imagination-tbdr-overview",
    type: "article",
    title: "Tile-Based Deferred Rendering (TBDR) — PowerVR Architecture Guide",
    authors: ["Imagination Technologies"],
    url: "https://docs.imgtec.com/starter-guides/powervr-architecture/html/topics/tile-based-deferred-rendering-index.html",
    note: {
      vi: "Giải thích Hidden Surface Removal (HSR) của PowerVR và vì sao nó loại bỏ được overdraw hoàn toàn trên cảnh opaque — nguồn cho phần 'early-Z/HSR' của bài.",
      en: "Explains PowerVR's Hidden Surface Removal (HSR) and why it eliminates overdraw entirely on opaque scenes — the source for this lesson's early-Z/HSR section.",
    },
  },
  {
    id: "arm-gpu-best-practices-guide",
    type: "article",
    title: "Arm GPU Best Practices Developer Guide",
    authors: ["Arm Limited"],
    url: "https://developer.arm.com/documentation/101897/latest/",
    note: {
      vi: "Chương về blending và Forward Pixel Kill (FPK) — nguồn cho giới hạn thực tế của FPK (tam giác nhỏ, truy cập framebuffer, late ZS) được trích trong bài.",
      en: "The blending and Forward Pixel Kill (FPK) chapters — the source for FPK's real-world limits (small triangles, framebuffer access, late ZS) cited in this lesson.",
    },
  },
  {
    id: "threejs-render-lists-source",
    type: "repo",
    title: "three.js — WebGLRenderLists.js (painterSortStable / reversePainterSortStable)",
    authors: ["mrdoob and three.js contributors"],
    url: "https://github.com/mrdoob/three.js/blob/dev/src/renderers/webgl/WebGLRenderLists.js",
    note: {
      vi: "Mã nguồn thật của hàm sort opaque/transparent mà bài này trích dẫn — tự đọc thay vì tin lời diễn giải, đúng tinh thần 'đọc source' của platform.",
      en: "The real source of the opaque/transparent sort functions this lesson cites — read it yourself instead of trusting a paraphrase, in the platform's own 'read the source' spirit.",
    },
  },
];
