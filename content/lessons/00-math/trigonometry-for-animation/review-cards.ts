import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "atan-loses-quadrant",
    q: {
      vi: "Mục tiêu ở ngay bên trái: $dx = -3$, $dy = 0$. `Math.atan(dy / dx)` trả góc nào, và nhân vật quay mặt về đâu?",
      en: "The target is straight to the left: $dx = -3$, $dy = 0$. What angle does `Math.atan(dy / dx)` return, and which way does the character face?",
    },
    a: {
      vi: "Góc 0, tức hướng $+x$ — nhân vật quay lưng lại mục tiêu, lệch đúng 180°. `atan` chỉ thấy tỉ số $dy/dx$, nên không phân biệt $(-3, 0)$ với $(3, 0)$. `Math.atan2(dy, dx)` xét dấu từng thành phần và trả về $\\pi$.",
      en: "Angle 0, the $+x$ direction — the character turns its back on the target, off by exactly 180°. `atan` sees only the ratio $dy/dx$, so it cannot tell $(-3, 0)$ from $(3, 0)$. `Math.atan2(dy, dx)` looks at each sign and returns $\\pi$.",
    },
  },
  {
    id: "elapsed-vs-accumulate",
    q: {
      vi: "Tab bị ẩn 10 giây rồi mở lại. Vật quay bằng `angle += 0.02` mỗi frame và vật quay bằng `angle = omega * elapsed` khác nhau thế nào?",
      en: "A tab is hidden for 10 seconds, then shown again. How does an object turned by `angle += 0.02` each frame differ from one turned by `angle = omega * elapsed`?",
    },
    a: {
      vi: "Vật cộng dồn đứng yên suốt lúc tab ẩn, vì trình duyệt dừng vòng lặp frame, nên bị trễ 10 giây so với đồng hồ — và tốc độ của nó còn phụ thuộc frame rate. Vật tính từ `elapsed` nhảy đúng tới vị trí của thời điểm hiện tại.",
      en: "The accumulating one stands still while the tab is hidden, because the browser pauses the frame loop, so it ends up 10 seconds behind the clock — and its speed depends on the frame rate too. The one computed from `elapsed` jumps straight to where it belongs now.",
    },
  },
  {
    id: "orbit-direction",
    q: {
      vi: "Vật chạy vòng theo `x = cx + Math.cos(angle) * r`, `y = cy + Math.sin(angle) * r` với `angle = omega * t`, `omega > 0` và trục $y$ hướng lên. Vật quay theo chiều nào, và đổi thành `-omega` thì sao?",
      en: "An object orbits with `x = cx + Math.cos(angle) * r`, `y = cy + Math.sin(angle) * r` and `angle = omega * t`, where `omega > 0` and $y$ points up. Which way does it go round, and what does `-omega` change?",
    },
    a: {
      vi: "Ngược chiều kim đồng hồ: góc tăng dần, và $(\\cos, \\sin)$ đi quanh vòng tròn đơn vị theo chiều góc tăng — từ bên phải tâm lên đỉnh, rồi sang trái. Với `-omega` góc giảm dần, nên vật quay cùng chiều kim đồng hồ với tốc độ như cũ.",
      en: "Counter-clockwise: the angle grows, and $(\\cos, \\sin)$ travels round the unit circle in the direction of growing angle — from the right of the center up to the top, then left. With `-omega` the angle shrinks, so it goes round clockwise at the same speed.",
    },
  },
];
