import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "immersivemath-vectors",
    type: "article",
    title: "Immersive Linear Algebra — Chapter 2: Vectors",
    authors: ["J. Ström", "K. Åström", "T. Akenine-Möller"],
    url: "https://immersivemath.com/ila/ch02_vectors/ch02.html",
    note: {
      vi: "Sách tuyến tính đại số tương tác — mỗi hình vẽ vector kéo được bằng chuột, đúng thứ trực giác tip-to-tail mà bài này giải thích bằng lời.",
      en: "An interactive linear algebra textbook — every vector diagram is mouse-draggable, giving hands-on intuition for the tip-to-tail rule this lesson explains in prose.",
    },
  },
  {
    id: "3blue1brown-vectors",
    type: "video",
    title: "Vectors | Chapter 1, Essence of linear algebra",
    authors: ["Grant Sanderson (3Blue1Brown)"],
    url: "https://www.youtube.com/watch?v=fNk_zzaMoSs",
    note: {
      vi: "Gần 10 phút hình dung vector từ ba góc nhìn (vật lý, khoa học máy tính, toán học) — trực quan hoá chính xác phần 'mũi tên vs bộ số' đầu bài.",
      en: "Under 10 minutes visualizing vectors from three angles (physics, computer science, math) — a precise animated version of this lesson's opening 'arrow vs tuple' section.",
    },
  },
  {
    id: "scratchapixel-points-vectors-ops",
    type: "article",
    title: "Scratchapixel — Math Operations on Points and Vectors",
    url: "https://www.scratchapixel.com/lessons/mathematics-physics-for-computer-graphics/geometry/math-operations-on-points-and-vectors.html",
    note: {
      vi: "Viết riêng cho lập trình viên đồ hoạ, không phải cho sinh viên toán — nhấn mạnh đúng chỗ hay gây lỗi: phân biệt point và vector, cộng/trừ có ý nghĩa gì khi nào.",
      en: "Written for graphics programmers rather than math students — it stresses exactly the failure points this lesson calls out: telling points from vectors, and when add/subtract are even meaningful.",
    },
  },
];
