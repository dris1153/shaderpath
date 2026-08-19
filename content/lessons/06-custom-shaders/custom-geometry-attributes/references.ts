import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-docs-bufferattribute",
    type: "spec",
    title: "Three.js Docs — BufferAttribute",
    authors: ["Three.js contributors"],
    url: "https://threejs.org/docs/#api/en/core/BufferAttribute",
    note: {
      vi: "Nguồn chuẩn cho constructor `(array, itemSize)`, cờ `needsUpdate` và các hàm `setX/setXYZ` dùng để regenerate seed trong demo — tra khi cần chữ ký hàm chính xác.",
      en: "The authoritative source for the `(array, itemSize)` constructor, the `needsUpdate` flag and the `setX/setXYZ` helpers the demo's regenerate button calls — check here for exact signatures.",
    },
  },
  {
    id: "threejs-manual-how-to-update-things",
    type: "article",
    title: "Three.js Manual — How to Update Things",
    authors: ["Three.js contributors"],
    url: "https://threejs.org/manual/en/how-to-update-things.html",
    note: {
      vi: "Giải thích rõ vì sao sửa một `Float32Array` không tự đẩy lại GPU, và `needsUpdate`/`setUsage` giải quyết việc đó thế nào — đúng cơ chế bài này dùng cho nút 'đổi seed'.",
      en: "Explains exactly why editing a Float32Array in place does not re-upload it to the GPU, and how needsUpdate/setUsage solve that — the exact mechanism this lesson's regenerate button relies on.",
    },
  },
  {
    id: "threejs-docs-bufferattribute-usage",
    type: "spec",
    title: "Three.js Docs — Buffer Attribute Usage Constants",
    authors: ["Three.js contributors"],
    url: "https://threejs.org/docs/#api/en/constants/BufferAttributeUsage",
    note: {
      vi: "Danh sách đầy đủ `StaticDrawUsage`/`DynamicDrawUsage`/`StreamDrawUsage` — tra khi cần quyết định usage hint đúng cho một attribute cập nhật thường xuyên (điều demo này KHÔNG cần, vì regenerate chỉ chạy theo click).",
      en: "The full list of StaticDrawUsage/DynamicDrawUsage/StreamDrawUsage — check here when deciding the right usage hint for a frequently-updated attribute (which this demo deliberately does NOT need, since regenerate only runs on click).",
    },
  },
  {
    id: "khronos-webgl2-spec-attributes",
    type: "spec",
    title: "WebGL 2.0 Specification",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/webgl/specs/latest/2.0/",
    note: {
      vi: "Nguồn chuẩn định nghĩa vertex attribute ở tầng GPU (vertexAttribPointer, per-vertex data rate) mà `THREE.BufferAttribute` bọc lại — đối chiếu khi muốn hiểu điều gì thật sự xảy ra dưới lớp trừu tượng của Three.",
      en: "The authoritative spec defining vertex attributes at the GPU level (vertexAttribPointer, per-vertex data rate) that THREE.BufferAttribute wraps — cross-reference this to see what actually happens beneath Three's abstraction.",
    },
  },
];
