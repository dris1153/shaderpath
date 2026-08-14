import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "iq-normals-sdf",
    type: "article",
    title: "Numerical Normals for SDFs",
    authors: ["Inigo Quilez"],
    url: "https://iquilezles.org/articles/normalsSDF/",
    note: {
      vi: "Nguồn gốc kỹ thuật tetrahedron 4 mẫu dùng trong bài — giải thích vì sao bốn điểm lấy mẫu ở đỉnh tứ diện cho cùng bậc chính xác với sáu mẫu central-difference, kèm shader mẫu chạy được trên Shadertoy.",
      en: "The origin of the four-sample tetrahedron technique used in this lesson — explains why four tetrahedron-vertex samples match six-sample central differences in accuracy, with a runnable Shadertoy example.",
    },
  },
  {
    id: "learnopengl-blinn-phong",
    type: "article",
    title: "Advanced Lighting: Blinn-Phong",
    authors: ["Joey de Vries"],
    url: "https://learnopengl.com/Advanced-Lighting/Advanced-Lighting",
    note: {
      vi: "Giải thích half-vector của Blinn-Phong và vì sao nó rẻ hơn tính vector phản xạ của Phong gốc — đúng công thức specular bài này dùng trong rig 3 đèn.",
      en: "Explains Blinn-Phong's half-vector and why it's cheaper than computing a true reflection vector as in classic Phong — the exact specular formula this lesson's 3-light rig uses.",
    },
  },
  {
    id: "iq-smooth-minimum",
    type: "article",
    title: "Smooth Minimum for SDFs",
    authors: ["Inigo Quilez"],
    url: "https://iquilezles.org/articles/smin/",
    note: {
      vi: "Công thức polynomial smooth-min mà demo dùng để hàn sphere/box/torus thành một khối liền — cần thiết để có góc hộp sắc dùng minh hoạ epsilon quá lớn.",
      en: "The polynomial smooth-min formula the demo uses to weld the sphere/box/torus into one continuous body — the sharp box corner it preserves is what makes the too-large-epsilon rounding visible.",
    },
  },
];
