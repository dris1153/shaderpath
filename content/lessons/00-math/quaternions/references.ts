import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "shoemake-1985-quaternion-curves",
    type: "paper",
    title: "Animating Rotation with Quaternion Curves",
    authors: ["Ken Shoemake"],
    year: 1985,
    url: "https://dl.acm.org/doi/10.1145/325165.325242",
    note: {
      vi: "Bài báo SIGGRAPH gốc chứng minh và đặt tên cho slerp — nguồn nguyên thuỷ của công thức nội suy dùng trong bài này, không phải một bài diễn giải lại.",
      en: "The original SIGGRAPH paper that proved and named slerp — the primary source for the interpolation formula used in this lesson, not a secondhand explanation.",
    },
  },
  {
    id: "threejs-docs-quaternion",
    type: "article",
    title: "Quaternion – three.js docs",
    authors: ["Three.js contributors"],
    url: "https://threejs.org/docs/#api/en/math/Quaternion",
    note: {
      vi: "API thật sẽ dùng ở Track 3 trở đi: setFromAxisAngle, multiply, slerp — đúng những hàm bài này nói tới nhưng không tự viết lại đầy đủ.",
      en: "The real API used from Track 3 on: setFromAxisAngle, multiply, slerp — exactly the functions this lesson references without fully reimplementing them.",
    },
  },
  {
    id: "blow-understanding-slerp",
    type: "article",
    title: "Understanding Slerp, Then Not Using It",
    authors: ["Jonathan Blow"],
    url: "http://number-none.com/product/Understanding%20Slerp,%20Then%20Not%20Using%20It/",
    note: {
      vi: "Phân tích thực dụng về chi phí slerp và khi nào nlerp (hoặc cách khác) là đủ — đúng phần 'khi nào không cần bận tâm' bài này chỉ tóm tắt ngắn gọn.",
      en: "A practical breakdown of slerp's cost and when nlerp (or something else entirely) is enough — the deep dive behind this lesson's brief 'when not to bother' section.",
    },
  },
];
