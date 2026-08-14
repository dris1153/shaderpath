import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "learnopengl-depth-testing",
    type: "article",
    title: "LearnOpenGL — Depth Testing",
    authors: ["Joey de Vries"],
    url: "https://learnopengl.com/Advanced-OpenGL/Depth-testing",
    note: {
      vi: "Nguồn của công thức depth phi tuyến $\\text{depth}(d)$ mà bài này đảo ngược để lấy lại khoảng cách march — đọc lại bài Depth Buffer Track 1 trước nếu công thức chưa quen.",
      en: "The source of the non-linear depth formula $\\text{depth}(d)$ this lesson inverts to recover a marching distance — revisit Track 1's Depth Buffer lesson first if the formula feels unfamiliar.",
    },
  },
  {
    id: "threejs-webglrendertarget-docs",
    type: "spec",
    title: "Three.js Docs — WebGLRenderTarget",
    authors: ["Three.js"],
    url: "https://threejs.org/docs/#api/en/renderers/WebGLRenderTarget",
    note: {
      vi: "Tài liệu chính thức của lớp render target dùng ở pass 1 của demo — kiểm tra API thật (constructor, `depthTexture`) thay vì đoán theo trí nhớ, vì API đổi giữa các version.",
      en: "The official docs for the render-target class used in the demo's pass 1 — verify the real API (constructor, `depthTexture`) instead of guessing from memory, since it shifts between versions.",
    },
  },
  {
    id: "threejs-depthtexture-docs",
    type: "spec",
    title: "Three.js Docs — DepthTexture",
    authors: ["Three.js"],
    url: "https://threejs.org/docs/#api/en/textures/DepthTexture",
    note: {
      vi: "Định nghĩa chính thức của texture lưu depth — nguồn xác nhận `type`/`format` mặc định mà đoạn code tạo `meshTarget` trong demo dựa vào.",
      en: "The official definition of the depth-storing texture class — confirms the default `type`/`format` the demo's `meshTarget` construction relies on.",
    },
  },
  {
    id: "r3f-hooks-docs",
    type: "article",
    title: "React Three Fiber Docs — Hooks (useFrame render priority)",
    authors: ["Poimandres"],
    url: "https://r3f.docs.pmnd.rs/api/hooks",
    note: {
      vi: "Xác nhận hành vi `priority > 0` tắt hẳn auto-render của R3F — cơ chế đứng sau kiến trúc 'hai lần gl.render() mỗi frame' của demo bài này, cùng kỹ thuật portal đã gặp ở Track 4.",
      en: "Confirms that `priority > 0` disables R3F's auto-render entirely — the mechanism behind this demo's 'two gl.render() calls per frame' architecture, the same portal technique from Track 4.",
    },
  },
];
