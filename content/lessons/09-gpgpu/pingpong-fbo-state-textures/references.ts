import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "khronos-framebuffer-object-feedback-loops",
    type: "spec",
    title: "OpenGL Wiki — Framebuffer Object (Feedback Loops)",
    authors: ["Khronos Group"],
    url: "https://www.khronos.org/opengl/wiki/Framebuffer_Object",
    note: {
      vi: "Nguồn chuẩn định nghĩa feedback loop là undefined behavior — chính là lý do kỹ thuật ping-pong của bài này tồn tại, không phải một quy ước tuỳ ý.",
      en: "The authoritative source defining a feedback loop as undefined behavior — the exact reason this lesson's ping-pong technique exists, not an arbitrary convention.",
    },
  },
  {
    id: "webgl2fundamentals-gpgpu",
    type: "article",
    title: "WebGL2 GPGPU",
    authors: ["Gregg Tavares"],
    url: "https://webgl2fundamentals.org/webgl/lessons/webgl-gpgpu.html",
    note: {
      vi: "Trình bày kỹ thuật ping-pong bằng WebGL2 thuần, không qua Three.js — đối chiếu để thấy WebGLRenderTarget của bài này chỉ là lớp bọc tiện lợi quanh đúng các lệnh gl.* thô.",
      en: "Walks through the ping-pong technique in raw WebGL2, no Three.js involved — a useful comparison to see this lesson's WebGLRenderTarget is just a convenience wrapper around the exact same raw gl.* calls.",
    },
  },
  {
    id: "khronos-ext-color-buffer-float",
    type: "spec",
    title: "WebGL EXT_color_buffer_float Extension",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/webgl/extensions/EXT_color_buffer_float/",
    note: {
      vi: "Đặc tả chính thức của extension bắt buộc để render vào texture float/half-float — đọc để hiểu chính xác điều kiện thiết bị cần đáp ứng, thay vì chỉ tin lời bài học.",
      en: "The official spec for the extension required to render into a float/half-float texture — read it to know exactly what a device needs to support, instead of taking the lesson's word for it.",
    },
  },
  {
    id: "threejs-gpucomputationrenderer-docs",
    type: "spec",
    title: "Three.js Docs — GPUComputationRenderer",
    url: "https://threejs.org/docs/#examples/en/misc/GPUComputationRenderer",
    note: {
      vi: "Tài liệu của lớp tiện ích sẽ đóng gói đúng kỹ thuật thủ công trong bài này thành một API — đọc trước một chút để thấy mỗi khái niệm ở đây (render target, compute scene, biến) ánh xạ sang API đó ra sao.",
      en: "The docs for the utility class that packages this lesson's exact manual technique into an API — a preview showing how every concept here (render target, compute scene, variable) maps onto that API.",
    },
  },
];
