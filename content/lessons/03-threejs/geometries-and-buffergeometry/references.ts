import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-manual-primitives",
    type: "article",
    title: "Three.js Primitives",
    authors: ["three.js contributors"],
    url: "https://threejs.org/manual/en/primitives.html",
    note: {
      vi: "Giới thiệu widthSegments/heightSegments trên geometry built-in — bài này đo lại số tam giác thật trên phiên bản Three.js đang dùng thay vì suy đoán công thức, vì thuật toán sphere bỏ tam giác suy biến ở hai cực.",
      en: "Introduces widthSegments/heightSegments on built-in geometries — this lesson measures the real triangle counts on the installed Three.js version rather than guessing a formula, since the sphere algorithm skips a degenerate triangle at each pole.",
    },
  },
  {
    id: "threejs-manual-custom-buffergeometry",
    type: "article",
    title: "Three.js — Custom BufferGeometry",
    authors: ["three.js contributors"],
    url: "https://threejs.org/manual/en/custom-buffergeometry.html",
    note: {
      vi: "Bài chính thức dựng một cube tay bằng position/normal/uv thô và setIndex — nguồn của ví dụ '24 entry, 36 chỉ số' trích dẫn trong phần index vs non-indexed.",
      en: "The official article building a cube by hand from raw position/normal/uv arrays and setIndex — the source of the '24 entries, 36 indices' example cited in the index vs non-indexed section.",
    },
  },
  {
    id: "threejs-docs-buffergeometry",
    type: "article",
    title: "Three.js Docs — BufferGeometry",
    authors: ["three.js contributors"],
    url: "https://threejs.org/docs/#api/en/core/BufferGeometry",
    note: {
      vi: "Tài liệu tham chiếu chính thức cho setAttribute/setIndex/dispose() — tra cứu chữ ký API chính xác khi tự dựng geometry.",
      en: "The official reference for setAttribute/setIndex/dispose() — check here for exact API signatures when building a geometry by hand.",
    },
  },
  {
    id: "threejs-docs-bufferattribute",
    type: "article",
    title: "Three.js Docs — BufferAttribute",
    authors: ["three.js contributors"],
    url: "https://threejs.org/docs/#api/en/core/BufferAttribute",
    note: {
      vi: "Giải thích tham số count/itemSize và mối quan hệ giữa BufferAttribute với TypedArray bên dưới — đúng phần Float32Array bài này nhắc lại từ Track 1.",
      en: "Explains the count/itemSize parameters and the relationship between a BufferAttribute and the TypedArray underneath — the exact Float32Array point this lesson recalls from Track 1.",
    },
  },
];
