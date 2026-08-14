import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "threejs-manual-fundamentals",
    type: "article",
    title: "Three.js Fundamentals",
    authors: ["three.js contributors"],
    url: "https://threejs.org/manual/en/fundamentals.html",
    note: {
      vi: "Bài nhập môn chính thức dựng đúng bộ ba Scene/Camera/Renderer và render loop bằng requestAnimationFrame — nguồn cho ví dụ loop() trong bài này.",
      en: "The official introductory article building the Scene/Camera/Renderer trio and the requestAnimationFrame render loop — the source for this lesson's loop() example.",
    },
  },
  {
    id: "threejs-manual-responsive",
    type: "article",
    title: "Three.js — Responsive Design",
    authors: ["three.js contributors"],
    url: "https://threejs.org/manual/en/responsive.html",
    note: {
      vi: "Giải thích chi tiết setSize, canvas.style vs drawing buffer, và vì sao phải clamp devicePixelRatio — đúng nội dung phần WebGLRenderer của bài này.",
      en: "Explains setSize, canvas.style vs the drawing buffer, and why devicePixelRatio needs clamping — exactly this lesson's WebGLRenderer section.",
    },
  },
  {
    id: "threejs-docs-perspective-camera",
    type: "article",
    title: "Three.js Docs — PerspectiveCamera",
    authors: ["three.js contributors"],
    url: "https://threejs.org/docs/#api/en/cameras/PerspectiveCamera",
    note: {
      vi: "Tài liệu tham chiếu chính thức cho fov/aspect/near/far và updateProjectionMatrix() — tra cứu khi cần đúng chữ ký API.",
      en: "The official reference for fov/aspect/near/far and updateProjectionMatrix() — check here for exact API signatures.",
    },
  },
  {
    id: "learnopengl-depth-testing",
    type: "article",
    title: "LearnOpenGL — Depth Testing",
    authors: ["Joey de Vries"],
    url: "https://learnopengl.com/Advanced-OpenGL/Depth-testing",
    note: {
      vi: "Nguồn công thức depth phi tuyến $1/z$ trích dẫn ở bài này — giải thích vì sao tỉ lệ far/near lớn làm hỏng độ chính xác depth, lý do đằng sau khuyến nghị near/far chặt.",
      en: "The source of the non-linear $1/z$ depth formula cited in this lesson — explains why a large far/near ratio destroys depth precision, the reasoning behind the tight near/far recommendation.",
    },
  },
];
