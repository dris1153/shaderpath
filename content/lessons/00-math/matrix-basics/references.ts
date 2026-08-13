import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "3blue1brown-linear-transformations",
    type: "video",
    title:
      "Linear transformations and matrices — Essence of Linear Algebra, Chapter 3",
    authors: ["Grant Sanderson (3Blue1Brown)"],
    url: "https://www.youtube.com/watch?v=kYB8IZa5AuE",
    note: {
      vi: "Visualization xoay/kéo lưới tọa độ theo thời gian thực — chỗ tốt nhất để \"nhìn thấy\" ý nghĩa của cột ma trận thay vì chỉ đọc công thức.",
      en: "A real-time grid-warping visualization — the best place to actually *see* what a matrix's columns mean instead of just reading the formula.",
    },
  },
  {
    id: "immersivemath-matrices",
    type: "article",
    title: "Immersive Linear Algebra — Chapter 6: The Matrix",
    authors: ["J. Ström", "K. Åström", "T. Akenine-Möller"],
    url: "https://immersivemath.com/ila/ch06_matrices/ch06.html",
    note: {
      vi: "Sách tương tác cùng series đã dùng ở bài dot/cross product — chương này cho kéo-thả trực tiếp các cột ma trận và xem hình vuông đơn vị biến dạng ngay lập tức.",
      en: "The same interactive textbook used in the dot/cross product lesson — this chapter lets you drag a matrix's columns directly and watch the unit square deform in real time.",
    },
  },
  {
    id: "immersivemath-linear-mappings",
    type: "article",
    title: "Immersive Linear Algebra — Chapter 9: Linear Mappings",
    authors: ["J. Ström", "K. Åström", "T. Akenine-Möller"],
    url: "https://immersivemath.com/ila/ch09_linear_mappings/ch09.html",
    note: {
      vi: "Chứng minh chặt chẽ vì sao chỉ cần biết ảnh của basis vector là đủ xác định toàn bộ phép biến đổi tuyến tính — phần lý thuyết bài học này chỉ nêu mà không chứng minh.",
      en: "A rigorous proof of why knowing only the images of the basis vectors is enough to pin down an entire linear transformation — the part this lesson states without proving.",
    },
  },
  {
    id: "real-time-rendering-transforms",
    type: "book",
    title: "Real-Time Rendering, 4th Edition — Chapter 4: Transforms",
    authors: ["Tomas Akenine-Möller", "Eric Haines", "Naty Hoffman"],
    year: 2018,
    note: {
      vi: "Chương tham khảo chuẩn ngành cho mọi ma trận biến đổi dùng trong đồ hoạ thời gian thực, kể cả các dạng ít gặp hơn scale/rotate/shear ở bài này.",
      en: "The industry-standard reference chapter for every transform matrix used in real-time graphics, including forms less common than this lesson's scale/rotate/shear.",
    },
  },
];
