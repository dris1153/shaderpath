import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "immersivemath-dot-product",
    type: "article",
    title: "Immersive Linear Algebra — Chapter 3: The Dot Product",
    authors: ["J. Ström", "K. Åström", "T. Akenine-Möller"],
    url: "https://immersivemath.com/ila/ch03_dotproduct/ch03.html",
    note: {
      vi: "Chứng minh trực quan (kéo thả được) vì sao công thức đại số và công thức độ dài-nhân-cosine luôn cho cùng một số — phần mà bài học chỉ nêu kết quả.",
      en: "An interactive, drag-to-explore proof of why the algebraic formula and the length-times-cosine formula always agree — the part this lesson states as a given fact.",
    },
  },
  {
    id: "immersivemath-vector-product",
    type: "article",
    title: "Immersive Linear Algebra — Chapter 4: The Vector Product",
    authors: ["J. Ström", "K. Åström", "T. Akenine-Möller"],
    url: "https://immersivemath.com/ila/ch04_vectorproduct/ch04.html",
    note: {
      vi: "Cùng bộ sách, chương về cross product — có visualization xoay được để thấy quy tắc bàn tay phải và diện tích hình bình hành cùng lúc.",
      en: "Same textbook's chapter on the cross product — a rotatable visualization that shows the right-hand rule and the parallelogram area simultaneously.",
    },
  },
  {
    id: "webglfundamentals-directional-lighting",
    type: "article",
    title: "WebGL Fundamentals — WebGL 3D: Directional Lighting",
    authors: ["Gregg Tavares"],
    url: "https://webglfundamentals.org/webgl/lessons/webgl-3d-lighting-directional.html",
    note: {
      vi: "Chỗ N·L của bài này thật sự chạy trong GLSL — đọc để thấy dot product giữa pháp tuyến và hướng sáng đi thẳng vào fragment shader thế nào.",
      en: "Where this lesson's N·L actually runs in GLSL — read it to see the normal/light-direction dot product land directly inside a fragment shader.",
    },
  },
  {
    id: "3blue1brown-dot-products",
    type: "video",
    title: "Dot products and duality — Essence of Linear Algebra, Chapter 9",
    authors: ["Grant Sanderson (3Blue1Brown)"],
    url: "https://www.youtube.com/watch?v=LyGKycYT2v0",
    note: {
      vi: "Góc nhìn sâu hơn về dot product như một phép chiếu/biến đổi tuyến tính — hữu ích sau khi đã quen công thức, để hiểu 'vì sao nó lại đúng'.",
      en: "A deeper look at the dot product as a projection/linear transform — worth watching once the formulas feel routine, to understand 'why it's even true.'",
    },
  },
];
