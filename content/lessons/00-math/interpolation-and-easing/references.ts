import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "easings-net",
    type: "article",
    title: "Easing Functions Cheat Sheet",
    url: "https://easings.net/",
    note: {
      vi: "Xem trực quan hình dạng của easeIn/Out/InOut theo từng bậc luỹ thừa (quad, cubic, quart...) và copy công thức — nơi tra cứu nhanh sau khi đã hiểu nguyên lý remap-thời-gian ở bài này.",
      en: "See the exact shape of easeIn/Out/InOut across every power (quad, cubic, quart...) and copy the formula — the quick lookup once this lesson's remap-time principle clicks.",
    },
  },
  {
    id: "freya-holmer-math-talk",
    type: "video",
    title: "The Simple Yet Powerful Math We Don't Talk About",
    authors: ["Freya Holmér"],
    url: "https://www.youtube.com/watch?v=R6UB7mVO3fY",
    note: {
      vi: "Phần giữa của talk chứng minh trực quan vì sao `value += (target-value)*k` mỗi frame phụ thuộc frame rate, và dẫn thẳng ra dạng dt-correct đúng bài này đang dạy.",
      en: "The talk's middle section visually proves why `value += (target-value)*k` per frame is frame-rate dependent, and derives the exact dt-correct form this lesson teaches.",
    },
  },
  {
    id: "wikipedia-smoothstep",
    type: "article",
    title: "Smoothstep",
    url: "https://en.wikipedia.org/wiki/Smoothstep",
    note: {
      vi: "Suy diễn đầy đủ đa thức $3t^2-2t^3$ từ điều kiện đạo hàm bằng 0 ở hai đầu, cùng các biến thể bậc cao hơn (smootherstep) — chi tiết toán bài này chỉ nêu kết quả.",
      en: "The full derivation of the $3t^2-2t^3$ polynomial from the zero-derivative boundary conditions, plus higher-order variants (smootherstep) — the math this lesson states as a given result.",
    },
  },
  {
    id: "robert-penner-easing",
    type: "article",
    title: "Robert Penner's Easing Functions",
    authors: ["Robert Penner"],
    url: "https://robertpenner.com/easing/",
    note: {
      vi: "Nguồn gốc của các tên gọi easeIn/Out/InOut quadratic/cubic/quartic... mà GSAP và hầu hết animation library ngày nay vẫn dùng lại nguyên xi.",
      en: "The original source of the easeIn/Out/InOut quadratic/cubic/quartic... naming that GSAP and most animation libraries still reuse verbatim today.",
    },
  },
];
