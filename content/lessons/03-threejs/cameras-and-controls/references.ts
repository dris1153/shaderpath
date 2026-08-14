import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-docs-orbitcontrols",
    type: "article",
    title: "Three.js Docs — OrbitControls",
    authors: ["three.js contributors"],
    url: "https://threejs.org/docs/pages/OrbitControls.html",
    note: {
      vi: "Tài liệu tham chiếu chính thức cho target, damping, các cặp min/max clamp và pan — nguồn cho toàn bộ default value trích dẫn trong bài.",
      en: "The official reference for target, damping, the min/max clamp pairs and pan — the source for every default value cited in this lesson.",
    },
  },
  {
    id: "threejs-docs-perspective-camera",
    type: "article",
    title: "Three.js Docs — PerspectiveCamera",
    authors: ["three.js contributors"],
    url: "https://threejs.org/docs/#api/en/cameras/PerspectiveCamera",
    note: {
      vi: "Chữ ký constructor và ý nghĩa fov/aspect/near/far — tra cứu khi cần đúng API.",
      en: "The constructor signature and the meaning of fov/aspect/near/far — check here for exact API details.",
    },
  },
  {
    id: "threejs-docs-orthographic-camera",
    type: "article",
    title: "Three.js Docs — OrthographicCamera",
    authors: ["three.js contributors"],
    url: "https://threejs.org/docs/#api/en/cameras/OrthographicCamera",
    note: {
      vi: "Xác nhận Orthographic không có field aspect và dùng left/right/top/bottom để định nghĩa frustum hộp.",
      en: "Confirms Orthographic has no aspect field and uses left/right/top/bottom to define its box frustum instead.",
    },
  },
  {
    id: "threejs-source-orbitcontrols",
    type: "repo",
    title: "three.js source — examples/jsm/controls/OrbitControls.js",
    authors: ["mrdoob and three.js contributors"],
    url: "https://github.com/mrdoob/three.js/blob/dev/examples/jsm/controls/OrbitControls.js",
    note: {
      vi: "Nguồn thật của mọi con số mặc định (dampingFactor 0.05, minPolarAngle 0, maxPolarAngle Math.PI...) và ghi chú \"must call update() in your animation loop\" trích dẫn trong bài.",
      en: "The actual source behind every default value quoted here (dampingFactor 0.05, minPolarAngle 0, maxPolarAngle Math.PI...) and the \"must call update() in your animation loop\" note cited in this lesson.",
    },
  },
];
