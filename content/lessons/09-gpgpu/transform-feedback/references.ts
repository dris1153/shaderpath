import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "webgl2fundamentals-gpgpu",
    type: "article",
    title: "WebGL2 GPGPU",
    authors: ["Gregg Tavares"],
    url: "https://webgl2fundamentals.org/webgl/lessons/webgl-gpgpu.html",
    note: {
      vi: "So sánh transform feedback với các đường GPGPU khác trong WebGL2 từ góc nhìn viết WebGL thuần — cùng cấp độ chi tiết API mà bài này dùng.",
      en: "Compares transform feedback against WebGL2's other GPGPU paths from a raw-WebGL author's perspective — the same level of API detail this lesson works at.",
    },
  },
  {
    id: "mdn-webgltransformfeedback",
    type: "article",
    title: "WebGLTransformFeedback — Web APIs | MDN",
    authors: ["MDN Contributors"],
    url: "https://developer.mozilla.org/en-US/docs/Web/API/WebGLTransformFeedback",
    note: {
      vi: "Tài liệu tham chiếu cho object `WebGLTransformFeedback` và các hàm liên quan (`beginTransformFeedback`, `bindBufferBase`...) — tra cứu chữ ký hàm chính xác khi viết code.",
      en: "Reference documentation for the `WebGLTransformFeedback` object and its related functions (`beginTransformFeedback`, `bindBufferBase`...) — the place to check exact function signatures while coding.",
    },
  },
  {
    id: "khronos-webgl2-spec-transform-feedback",
    type: "spec",
    title: "WebGL 2.0 Specification",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/webgl/specs/latest/2.0/",
    note: {
      vi: "Đặc tả chuẩn định nghĩa hành vi chính xác của transform feedback (thứ tự gọi, ràng buộc buffer không được vừa đọc vừa ghi) — nguồn thẩm quyền khi hành vi trình duyệt/driver có vẻ mâu thuẫn.",
      en: "The authoritative spec defining transform feedback's exact behavior (call ordering, the no-read-and-write-same-buffer constraint) — the source to check when a browser/driver's behavior seems to contradict a tutorial.",
    },
  },
];
