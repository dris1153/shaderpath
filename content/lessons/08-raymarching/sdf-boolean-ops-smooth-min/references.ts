import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "iq-distance-functions",
    type: "article",
    title: "Signed Distance Functions",
    authors: ["Inigo Quilez"],
    url: "https://iquilezles.org/articles/distfunctions/",
    note: {
      vi: "Bộ công thức SDF 3D chuẩn mực và các phép boolean union/subtraction/intersection từ min/max dùng làm nền cho toàn bộ bài học này.",
      en: "The canonical collection of 3D SDF formulas and the min/max-based union/subtraction/intersection operators this entire lesson builds on.",
    },
  },
  {
    id: "iq-smooth-minimum",
    type: "article",
    title: "smooth minimum",
    authors: ["Inigo Quilez"],
    url: "https://iquilezles.org/articles/smin/",
    note: {
      vi: "Nguồn gốc công thức h-form polynomial smin dùng trong bài, cùng các biến thể exponential, root, sigmoid, quartic để tham khảo thêm.",
      en: "The source of the polynomial h-form smin formula used in this lesson, plus the exponential, root, sigmoid and quartic variants for further reading.",
    },
  },
  {
    id: "iq-painting-character-with-maths",
    type: "video",
    title: "Painting a Character with Maths",
    authors: ["Inigo Quilez"],
    url: "https://www.youtube.com/watch?v=8--5LwHRhjk",
    note: {
      vi: "Buổi live-code dựng cả một nhân vật hoạt hình chỉ từ primitive SDF ghép bằng smooth min — ví dụ thực tế cho kỹ thuật 'dựng hình từng bước' của bài này, ở quy mô lớn hơn nhiều so với cây nấm.",
      en: "A live-coding session building an entire animated character from SDF primitives combined with smooth min — a real-world example of this lesson's 'building a compound shape step by step' technique, at a much larger scale than the mushroom.",
    },
  },
];
