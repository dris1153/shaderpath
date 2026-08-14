import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "worley-1996-cellular-texture-basis-function",
    type: "paper",
    title: "A Cellular Texture Basis Function",
    authors: ["Steven Worley"],
    year: 1996,
    url: "https://dl.acm.org/doi/10.1145/237170.237267",
    note: {
      vi: "Bài báo SIGGRAPH '96 gốc đặt tên và định nghĩa kỹ thuật này — kể cả cách cắt bớt số ô cần quét khi F1 đã đủ nhỏ, phần bài học chỉ nhắc qua ở mục chi phí.",
      en: "The original SIGGRAPH '96 paper that named and defined the technique — including the neighborhood-pruning optimization this lesson only briefly mentions in the cost section.",
    },
  },
  {
    id: "iq-voronoi-edges",
    type: "article",
    title: "Voronoi Edges",
    authors: ["Inigo Quilez"],
    url: "https://iquilezles.org/articles/voronoilines/",
    note: {
      vi: "Nguồn của lưu ý F2−F1 không phải khoảng cách có dấu thật — giải thích chi tiết vì sao độ rộng viền co giãn theo khoảng cách giữa hai điểm hạt giống, đúng nội dung Callout của bài.",
      en: "The source of this lesson's warning that F2−F1 isn't a true signed distance — explains in detail why the resulting border width stretches with the distance between the two neighboring feature points.",
    },
  },
  {
    id: "iq-smooth-voronoi",
    type: "article",
    title: "Smooth Voronoi",
    authors: ["Inigo Quilez"],
    url: "https://iquilezles.org/articles/smoothvoronoi/",
    note: {
      vi: "Bài viết gốc của kỹ thuật log-sum-exp dùng trong chế độ 'Voronoi mượt' của demo — xoá điểm gãy đạo hàm bằng một tổng trọng số mềm thay cho min() cứng.",
      en: "The original article for the log-sum-exp technique behind the demo's 'smooth voronoi' mode — replacing a hard min() with a soft weighted sum to erase the derivative kink.",
    },
  },
  {
    id: "book-of-shaders-cellular-noise",
    type: "article",
    title: "The Book of Shaders — Chapter 12: Cellular Noise",
    authors: ["Patricio Gonzalez Vivo", "Jen Lowe"],
    url: "https://thebookofshaders.com/12/",
    note: {
      vi: "Diễn giải trực quan, từng bước dựng Voronoi bằng GLSL thật — tốt để đối chiếu song song với đoạn code 3×3 của bài này.",
      en: "A visual, step-by-step build-up of Voronoi in real GLSL — a good side-by-side reference against this lesson's own 3x3 scan code.",
    },
  },
];
