import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-webglrenderer-info",
    type: "spec",
    title: "Three.js Docs — WebGLRenderer.info",
    url: "https://threejs.org/docs/#api/en/renderers/WebGLRenderer.info",
    note: {
      vi: "Nguồn chuẩn cho `render.calls`, `render.triangles`, `memory.geometries/textures` — kể cả hành vi reset mỗi frame mà bài này dựa vào.",
      en: "The authoritative source for `render.calls`, `render.triangles`, `memory.geometries/textures` — including the per-frame reset behavior this lesson relies on.",
    },
  },
  {
    id: "chrome-devtools-performance",
    type: "article",
    title: "Chrome DevTools — Performance Panel",
    authors: ["Google Chrome Team"],
    url: "https://developer.chrome.com/docs/devtools/performance",
    note: {
      vi: "Hướng dẫn chính thức cách đọc flame chart, track Main/GPU và cách nhận diện Long Task — thực hành trực tiếp trên demo bên dưới.",
      en: "The official guide to reading the flame chart, the Main/GPU tracks, and spotting Long Tasks — practice it directly on the demo below.",
    },
  },
  {
    id: "web-dev-long-tasks",
    type: "article",
    title: "web.dev — Optimize Long Tasks",
    authors: ["Philip Walton"],
    url: "https://web.dev/articles/optimize-long-tasks",
    note: {
      vi: "Giải thích chuẩn ngưỡng 50ms cho một 'Long Task' và vì sao main thread bị chặn 150ms (như nút spike trong demo) làm hỏng trải nghiệm dù FPS trung bình không đổi.",
      en: "Explains the standard 50ms 'Long Task' threshold and why blocking the main thread for 150ms (like the demo's spike button) wrecks the experience even when average FPS doesn't move.",
    },
  },
  {
    id: "spectorjs-repo",
    type: "repo",
    title: "Spector.js — WebGL Debugger",
    authors: ["BabylonJS / Microsoft"],
    url: "https://github.com/BabylonJS/Spector.js",
    note: {
      vi: "Repo chính thức của Spector.js — cài đặt extension và tài liệu về cách đọc một frame capture, đúng công cụ được mô tả trong phần 'mổ xẻ từng draw call'.",
      en: "Spector.js's official repo — installation as an extension plus docs on reading a frame capture, the exact tool described in the 'dissecting every draw call' section.",
    },
  },
  {
    id: "renderdoc-site",
    type: "article",
    title: "RenderDoc — Graphics Debugger",
    authors: ["Baldur Karlsson"],
    url: "https://renderdoc.org/",
    note: {
      vi: "Trang chủ RenderDoc, kèm ghi chú hỗ trợ trình duyệt/ANGLE — nguồn cho đoạn nói vì sao capture native khó áp dụng trực tiếp lên WebGL.",
      en: "RenderDoc's homepage, including its browser/ANGLE support notes — the source behind this lesson's paragraph on why native capture doesn't map cleanly onto WebGL.",
    },
  },
];
