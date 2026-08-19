import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "mdn-webgl2-bufferdata",
    type: "article",
    title: "WebGL2RenderingContext: bufferData() method",
    authors: ["MDN Contributors"],
    url: "https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/bufferData",
    note: {
      vi: "Tài liệu tham chiếu chính xác cho gl.bufferData — các overload nhận TypedArray/ArrayBuffer và ý nghĩa của usage hint (STATIC_DRAW/DYNAMIC_DRAW/STREAM_DRAW).",
      en: "The precise reference for gl.bufferData — the TypedArray/ArrayBuffer overloads and what the usage hint (STATIC_DRAW/DYNAMIC_DRAW/STREAM_DRAW) actually means.",
    },
  },
  {
    id: "mdn-webgl2-vertexattribpointer",
    type: "article",
    title: "WebGLRenderingContext: vertexAttribPointer() method",
    authors: ["MDN Contributors"],
    url: "https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer",
    note: {
      vi: "Định nghĩa chính xác từng tham số của vertexAttribPointer (size, type, normalized, stride, offset) — đọc để kiểm chứng lại ví dụ stride 20 byte của bài này.",
      en: "The exact definition of every vertexAttribPointer parameter (size, type, normalized, stride, offset) — read it to cross-check this lesson's 20-byte-stride example.",
    },
  },
  {
    id: "mdn-webgl2-bindvertexarray",
    type: "article",
    title: "WebGL2RenderingContext: bindVertexArray() method",
    authors: ["MDN Contributors"],
    url: "https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/bindVertexArray",
    note: {
      vi: "Xác nhận VAO là bắt buộc (không tuỳ chọn) trong WebGL2, và mô tả chính xác trạng thái nào được ghi vào một VAO.",
      en: "Confirms VAOs are mandatory (not optional) in WebGL2, and precisely describes what state gets captured inside one.",
    },
  },
  {
    id: "khronos-webgl2-spec-buffers",
    type: "spec",
    title: "WebGL 2.0 Specification",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/webgl/specs/latest/2.0/",
    note: {
      vi: "Nguồn chuẩn định nghĩa hành vi bufferData, vertexAttribPointer và vertex array object — nơi tra cứu khi tài liệu diễn giải chưa đủ chi tiết.",
      en: "The authoritative source defining bufferData, vertexAttribPointer and vertex array object behavior — the reference to reach for when explainer docs aren't precise enough.",
    },
  },
];
