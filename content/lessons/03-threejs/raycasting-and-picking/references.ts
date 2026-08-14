import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-docs-raycaster",
    type: "article",
    title: "Three.js Docs — Raycaster",
    authors: ["three.js contributors"],
    url: "https://threejs.org/docs/#api/en/core/Raycaster",
    note: {
      vi: "Tài liệu chính thức của `setFromCamera`, `intersectObject(s)` và cấu trúc kết quả `.object`/`.point`/`.face`/`.distance` dùng xuyên suốt bài.",
      en: "The official reference for `setFromCamera`, `intersectObject(s)`, and the `.object`/`.point`/`.face`/`.distance` result shape used throughout this lesson.",
    },
  },
  {
    id: "threejs-example-interactive-cubes",
    type: "repo",
    title: "Three.js Example — webgl_interactive_cubes",
    authors: ["three.js contributors"],
    url: "https://threejs.org/examples/#webgl_interactive_cubes",
    note: {
      vi: "Demo chính thức: lưới hộp, hover đổi màu bằng raycast mỗi frame — cùng cấu trúc bài toán với demo bên dưới, đáng đối chiếu khi debug.",
      en: "The official demo: a grid of boxes, hover recoloring driven by a per-frame raycast — the same problem shape as the demo below, worth comparing against when debugging.",
    },
  },
  {
    id: "threejs-docs-layers",
    type: "article",
    title: "Three.js Docs — Layers",
    authors: ["three.js contributors"],
    url: "https://threejs.org/docs/#api/en/core/Layers",
    note: {
      vi: "Giải thích bitmask 32 layer dùng để loại object khỏi raycast (hoặc khỏi camera) mà không cần lọc mảng thủ công — nền tảng của phần tối ưu hiệu năng trong bài.",
      en: "Explains the 32-layer bitmask used to exclude objects from raycasting (or from a camera) without manual array filtering — the basis for this lesson's performance section.",
    },
  },
  {
    id: "mdn-getboundingclientrect",
    type: "article",
    title: "Element: getBoundingClientRect() method",
    authors: ["MDN Contributors"],
    url: "https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect",
    note: {
      vi: "Tham chiếu chính xác `rect.left/top/width/height` dùng để map chuột sang NDC đúng cả khi canvas bị CSS scale hoặc không nằm ở góc viewport.",
      en: "The precise reference for `rect.left/top/width/height`, used to map the mouse to NDC correctly even when the canvas is CSS-scaled or not pinned to the viewport's corner.",
    },
  },
];
