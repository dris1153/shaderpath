import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "lerp-per-frame-rate",
    q: {
      vi: "`pos += (target - pos) * 0.1` chạy mỗi frame. Trên màn 144 Hz so với 60 Hz, vật bám về đích nhanh hơn hay chậm hơn, và sửa thế nào?",
      en: "`pos += (target - pos) * 0.1` runs every frame. On a 144 Hz screen versus 60 Hz, does the object close in on the target faster or slower, and what fixes it?",
    },
    a: {
      vi: "Nhanh hơn: mỗi frame rút 10% quãng còn lại, màn 144 Hz rút nhiều lần hơn trong một giây. Dùng hệ số $1 - e^{-\\lambda \\Delta t}$ thay cho 0.1, để tốc độ hội tụ tính theo giây chứ không theo frame.",
      en: "Faster: each frame closes 10% of the remaining gap, and a 144 Hz screen does that more times per second. Use the factor $1 - e^{-\\lambda \\Delta t}$ instead of 0.1, so convergence is measured per second, not per frame.",
    },
  },
  {
    id: "smoothstep-zero-velocity",
    q: {
      vi: "Hai cánh cửa mở trong 1 giây, một cái dùng lerp, một cái dùng smoothstep. Lúc bắt đầu và lúc dừng, cửa nào giật, và vì sao?",
      en: "Two doors open over 1 second, one with lerp, one with smoothstep. At the start and the stop, which one jerks, and why?",
    },
    a: {
      vi: "Cửa lerp: vận tốc của nó không đổi, nên nó bật từ đứng yên lên tốc độ đầy rồi khựng lại. Smoothstep $3t^2 - 2t^3$ có đạo hàm $6t - 6t^2$ bằng 0 tại $t = 0$ và $t = 1$, nên cửa tăng tốc từ 0 và hãm về 0.",
      en: "The lerp door: its speed is constant, so it jumps from rest to full speed and stops dead. Smoothstep $3t^2 - 2t^3$ has derivative $6t - 6t^2$, which is 0 at $t = 0$ and $t = 1$, so that door speeds up from 0 and slows down to 0.",
    },
  },
  {
    id: "lerp-shrinks-directions",
    q: {
      vi: "Lerp hai vector hướng đơn vị lệch nhau 90° tại $t = 0.5$. Vector ở giữa còn dài 1 không, và vì sao hướng xoay dùng slerp?",
      en: "Lerp two unit direction vectors 90° apart at $t = 0.5$. Is the vector in the middle still length 1, and why do rotations use slerp?",
    },
    a: {
      vi: "Không: nó dài $\\cos 45^\\circ \\approx 0.71$, vì lerp đi trên dây cung nối hai đầu chứ không đi trên cung tròn. Slerp nội suy theo góc trên mặt cầu, nên kết quả luôn dài 1 và quay với tốc độ đều.",
      en: "No: it has length $\\cos 45^\\circ \\approx 0.71$, because lerp travels along the chord between the ends, not along the arc. Slerp interpolates the angle on the sphere, so the result always has length 1 and turns at an even speed.",
    },
  },
];
