import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "rotating-uv-rotates-pattern-back",
    q: {
      vi: "Xoay toạ độ UV một góc +30° trước khi tính pattern. Pattern hiện trên màn hình xoay theo chiều nào, và vì sao?",
      en: "UV coordinates are rotated by +30° before the pattern is computed. Which way does the visible pattern turn, and why?",
    },
    a: {
      vi: "−30°. Bạn xoay hệ toạ độ dùng để tra pattern chứ không xoay ảnh: mỗi pixel đọc pattern tại một điểm đã xoay +30°, nên cái nhìn thấy quay ngược lại. Muốn pattern quay +θ thì xoay UV −θ.",
      en: "−30°. You rotate the coordinates used to look up the pattern, not the image: each pixel reads the pattern at a point rotated by +30°, so what you see turns the other way. For the pattern to turn +θ, rotate the UVs by −θ.",
    },
  },
  {
    id: "rotate-about-pivot",
    q: {
      vi: "Muốn xoay pattern quanh tâm $(0.5, 0.5)$ của quad. Viết `M * uv` thì hình quay quanh đâu, và biểu thức đúng là gì?",
      en: "You want a pattern to rotate about the quad's center $(0.5, 0.5)$. With `M * uv`, what does it rotate about, and what is the right expression?",
    },
    a: {
      vi: "Quanh gốc $(0, 0)$ — góc dưới-trái của UV — nên hình văng vòng quanh góc màn hình. Đúng là `M * (uv - pivot) + pivot`: dời pivot về gốc, xoay, rồi dời lại.",
      en: "About the origin $(0, 0)$ — the bottom-left corner of UV space — so the shape swings around a corner of the screen. The right form is `M * (uv - pivot) + pivot`: move the pivot to the origin, rotate, move it back.",
    },
  },
];
