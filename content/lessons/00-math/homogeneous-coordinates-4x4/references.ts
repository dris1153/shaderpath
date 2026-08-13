import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "scratchapixel-4x4-matrices-transform-objects",
    type: "article",
    title: "Using 4x4 Matrices to Transform Objects in 3D",
    url: "https://www.scratchapixel.com/lessons/3d-basic-rendering/transforming-objects-using-matrices/using-4x4-matrices-transform-objects-3D.html",
    note: {
      vi: "Đi từ đúng vấn đề bài này mở đầu — translation không tuyến tính — tới cách 4×4 giải quyết nó, kèm code C++ thật cho vertex và ray transform.",
      en: "Starts from the exact problem this lesson opens with — translation isn't linear — and walks to how 4×4 matrices fix it, with real C++ code for vertex and ray transforms.",
    },
  },
  {
    id: "scratchapixel-transforming-normals",
    type: "article",
    title: "Transforming Normals",
    url: "https://www.scratchapixel.com/lessons/mathematics-physics-for-computer-graphics/geometry/transforming-normals.html",
    note: {
      vi: "Chứng minh toán học đầy đủ vì sao pháp tuyến cần nghịch đảo chuyển vị thay vì model matrix thường — bài này chỉ nêu kết luận, nguồn này chứng minh nó.",
      en: "The full mathematical proof of why normals need the inverse transpose instead of the plain model matrix — this lesson only states the conclusion, this source proves it.",
    },
  },
  {
    id: "songho-opengl-transform",
    type: "article",
    title: "OpenGL Transformation",
    authors: ["Song Ho Ahn"],
    url: "https://www.songho.ca/opengl/gl_transform.html",
    note: {
      vi: "Bài viết kinh điển giải thích homogeneous coordinates và ma trận MODELVIEW từng bước, có sơ đồ rõ ràng cho cột thứ tư và ý nghĩa của w — tham khảo nhanh khi công thức bài này cần nhắc lại.",
      en: "A classic step-by-step explainer of homogeneous coordinates and the MODELVIEW matrix, with clear diagrams of the fourth column and what w means — a fast reference whenever this lesson's formulas need a refresher.",
    },
  },
  {
    id: "scratchapixel-perspective-projection-matrix",
    type: "article",
    title: "The Perspective and Orthographic Projection Matrix",
    url: "https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/projection-matrix-GPU-rendering-pipeline-clipping.html",
    note: {
      vi: "Đi tiếp đúng chỗ bài này dừng lại — cách ma trận phối cảnh cố ý ghi -z vào w, và phép chia phối cảnh thật sự chạy trong pipeline GPU ra sao.",
      en: "Picks up exactly where this lesson stops — how the perspective matrix deliberately writes -z into w, and how the perspective divide actually runs in the GPU pipeline.",
    },
  },
];
