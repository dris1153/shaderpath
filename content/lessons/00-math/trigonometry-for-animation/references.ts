import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "natureofcode-oscillation",
    type: "article",
    title: "The Nature of Code — 3. Oscillation",
    authors: ["Daniel Shiffman"],
    url: "https://natureofcode.com/oscillation/",
    note: {
      vi: "Chương mở đầu bằng chính câu hỏi radian vs độ rồi đi thẳng vào chuyển động điều hoà (sin) và pendulum — cùng mạch bài này nhưng có thêm góc nhìn vật lý (lực, gia tốc góc).",
      en: "Opens with the same radians-vs-degrees question this lesson does, then moves straight into simple harmonic motion and pendulums — same throughline, with an added physics angle (forces, angular acceleration).",
    },
  },
  {
    id: "inventwithpython-trig-animation",
    type: "article",
    title: "Using Trigonometry to Animate Bounces, Draw Clocks, and Point Cannons at a Target",
    authors: ["Al Sweigart"],
    url: "https://inventwithpython.com/blog/using-trigonometry-to-animate-bounces-draw-clocks-and-point-cannons-at-a-target.html",
    note: {
      vi: "Ba ví dụ chạy được minh hoạ đúng ba chủ đề của bài: sin cho dao động, cos+sin cho chuyển động tròn, và atan2 cho việc ngắm mục tiêu — code Python nhưng công thức y hệt.",
      en: "Three runnable examples matching this lesson's three themes exactly: sine for oscillation, cos+sin for circular motion, and atan2 for aiming at a target — Python code, identical formulas.",
    },
  },
  {
    id: "mdn-math-atan2",
    type: "spec",
    title: "Math.atan2() — JavaScript",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2",
    note: {
      vi: "Tài liệu chuẩn cho chữ ký hàm thật (chú ý thứ tự tham số là `atan2(y, x)`, không phải `(x, y)`) và khoảng giá trị trả về chính xác.",
      en: "The authoritative reference for the real function signature (note the argument order is `atan2(y, x)`, not `(x, y)`) and its exact return range.",
    },
  },
];
