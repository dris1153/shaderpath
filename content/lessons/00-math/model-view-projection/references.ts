import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "scratchapixel-opengl-perspective-projection-matrix",
    type: "article",
    title: "The Perspective and Orthographic Projection Matrix — The OpenGL Perspective Projection Matrix",
    authors: ["Scratchapixel"],
    url: "https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/opengl-perspective-projection-matrix.html",
    note: {
      vi: "Suy ra từng số hạng của ma trận perspective từ fov/aspect/near/far bằng hình học tam giác đồng dạng — nguồn gốc chính xác của công thức $f = 1/\\tan(\\text{fov}/2)$ dùng trong bài này.",
      en: "Derives every entry of the perspective matrix from fov/aspect/near/far using similar-triangle geometry — the exact origin of the $f = 1/\\tan(\\text{fov}/2)$ formula used in this lesson.",
    },
  },
  {
    id: "songho-opengl-projection-matrix",
    type: "article",
    title: "OpenGL Projection Matrix",
    authors: ["Song Ho Ahn"],
    url: "https://www.songho.ca/opengl/gl_projectionmatrix.html",
    note: {
      vi: "Bảng phân tích từng ô của ma trận 4x4 kèm ví dụ số cụ thể cho near/far — đối chiếu nhanh khi công thức trong bài này cần kiểm tra lại từng số hạng.",
      en: "A cell-by-cell breakdown of the 4x4 matrix with worked near/far examples — the quick reference to double-check any single entry from this lesson's formula.",
    },
  },
  {
    id: "learnopengl-coordinate-systems",
    type: "article",
    title: "LearnOpenGL — Coordinate Systems",
    authors: ["Joey de Vries"],
    url: "https://learnopengl.com/Getting-started/Coordinate-Systems",
    note: {
      vi: "Đi qua đúng sáu không gian (local/world/view/clip/NDC/screen) của bài này với hình minh hoạ trực quan, kèm code C++/GLM dựng ma trận view thật.",
      en: "Walks through this lesson's exact six spaces (local/world/view/clip/NDC/screen) with clear diagrams, plus real C++/GLM code building a view matrix.",
    },
  },
  {
    id: "threejs-docs-perspectivecamera",
    type: "spec",
    title: "Three.js Documentation — PerspectiveCamera",
    authors: ["Three.js"],
    url: "https://threejs.org/docs/#api/en/cameras/PerspectiveCamera",
    note: {
      vi: "Tài liệu chính thức của tham số fov/aspect/near/far trong engine bạn dùng từ Track 3 trở đi — cùng bốn con số vừa học, nhưng đã được đóng gói thành object `Camera`.",
      en: "The official reference for the fov/aspect/near/far parameters in the engine used from Track 3 onward — the same four numbers just covered, packaged into a `Camera` object.",
    },
  },
];
