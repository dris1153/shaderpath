import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-manual-multiple-scenes",
    type: "article",
    title: "Three.js Fundamentals — Multiple Scenes, Multiple Canvases",
    authors: ["Gregg Tavares"],
    url: "https://threejs.org/manual/en/multiple-scenes.html",
    note: {
      vi: "Nguồn của kỹ thuật scissor test dùng trong bài — clear toàn canvas một lần, sau đó setScissor/setViewport theo từng vùng để vẽ nhiều scene bằng một renderer duy nhất.",
      en: "The source for this lesson's scissor-test technique — clear the whole canvas once, then setScissor/setViewport per region to render multiple scenes with a single renderer.",
    },
  },
  {
    id: "drei-view-docs",
    type: "article",
    title: "React Three Drei — View",
    authors: ["pmndrs"],
    url: "https://drei.docs.pmnd.rs/portals/view",
    note: {
      vi: "Tài liệu chính thức của component View — track, index, frames, và mẫu View.Port dùng khi View được viết ngoài Canvas.",
      en: "Official docs for the View component — track, index, frames, and the View.Port pattern used when View is written outside a Canvas.",
    },
  },
  {
    id: "drei-hud-docs",
    type: "article",
    title: "React Three Drei — Hud",
    authors: ["pmndrs"],
    url: "https://drei.docs.pmnd.rs/portals/hud",
    note: {
      vi: "Component Hud có sẵn của drei — bản đóng gói của đúng kỹ thuật createPortal + scene phụ + renderPriority mà bài này dựng thủ công để hiểu cơ chế bên dưới.",
      en: "drei's built-in Hud component — the packaged version of the exact createPortal + secondary scene + renderPriority technique this lesson builds by hand to show the mechanism underneath.",
    },
  },
  {
    id: "virtual-webgl-context-limit",
    type: "repo",
    title: "virtual-webgl — why WebGL context virtualization exists",
    authors: ["Gregg Tavares (greggman)"],
    url: "https://github.com/greggman/virtual-webgl",
    note: {
      vi: "Nguồn của con số '8 đến 16 context' được trích trong bài, và lý do kỹ thuật virtualization tồn tại — mỗi context không chia sẻ tài nguyên với context khác.",
      en: "The source of the '8 to 16 contexts' figure quoted in this lesson, and why context virtualization exists at all — no resource is shared between separate contexts.",
    },
  },
];
