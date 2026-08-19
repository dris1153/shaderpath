import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-vector-clock",
    kind: "build",
    prompt: {
      vi: `Dựng một chiếc **đồng hồ kim chạy thật** trên canvas 2D, chỉ bằng toán vector của module này — không thư viện ngoài.

Yêu cầu: mặt đồng hồ tròn với 12 vạch giờ đặt bằng $(\\cos\\theta, \\sin\\theta)$; ba kim giờ/phút/giây lấy góc từ \`new Date()\`; kim quay quanh tâm bằng cách scale vector đơn vị theo độ dài từng kim; cập nhật bằng \`requestAnimationFrame\`.

Gợi ý cấu trúc: một hàm \`hand(angle, length)\` trả về điểm cuối của kim = tâm + vector đơn vị × độ dài.`,
      en: `Build a **working analog clock** on a 2D canvas using only this module's vector math — no external libraries.

Requirements: a round face with 12 hour marks placed via $(\\cos\\theta, \\sin\\theta)$; hour/minute/second hands take their angles from \`new Date()\`; each hand rotates around the center by scaling a unit vector to its length; updates via \`requestAnimationFrame\`.

Suggested structure: a \`hand(angle, length)\` helper returning the hand's endpoint = center + unit vector × length.`,
    },
    starterCode: `const canvas = document.querySelector("canvas")!;
const ctx = canvas.getContext("2d")!;
const R = 140; // clock face radius

function draw() {
  const { width: W, height: H } = canvas;
  ctx.clearRect(0, 0, W, H);
  // Canvas defaults to a black stroke, which is invisible on a dark page.
  ctx.strokeStyle = "#7dd3fc";
  const cx = W / 2, cy = H / 2;
  const now = new Date();

  // TODO 1: draw 12 hour marks — angle for mark i is i * (Math.PI / 6)
  // TODO 2: compute the angles of the 3 hands (careful: the hour hand drifts with the minutes!)
  // TODO 3: draw each hand as a line from (cx, cy) to the vector's endpoint

  requestAnimationFrame(draw);
}
draw();`,
    solutionCode: `const canvas = document.querySelector("canvas")!;
const ctx = canvas.getContext("2d")!;
const R = 140; // clock face radius

function hand(cx: number, cy: number, angle: number, len: number) {
  // Angle 0 points to 12 o'clock, rotating clockwise:
  // x = sin, y = -cos (canvas y axis points down)
  return [cx + Math.sin(angle) * len, cy - Math.cos(angle) * len] as const;
}

function draw() {
  const { width: W, height: H } = canvas;
  ctx.clearRect(0, 0, W, H);
  // Canvas defaults to a black stroke, which is invisible on a dark page.
  ctx.strokeStyle = "#7dd3fc";
  const cx = W / 2, cy = H / 2;
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const a = i * (Math.PI / 6);
    const [x1, y1] = hand(cx, cy, a, R * 0.9);
    const [x2, y2] = hand(cx, cy, a, R);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }

  const sec = now.getSeconds() + now.getMilliseconds() / 1000;
  const min = now.getMinutes() + sec / 60;
  const hr = (now.getHours() % 12) + min / 60;

  const hands: [number, number, number][] = [
    [hr * (Math.PI / 6), R * 0.5, 4],   // hour: 2π/12 per hour
    [min * (Math.PI / 30), R * 0.75, 2], // minute: 2π/60 per minute
    [sec * (Math.PI / 30), R * 0.85, 1], // second
  ];
  for (const [angle, len, width] of hands) {
    const [x, y] = hand(cx, cy, angle, len);
    ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
  }
  ctx.lineWidth = 1;

  requestAnimationFrame(draw);
}
draw();`,
    referenceImage: "/figures/00-math/checkpoint-vector-clock.svg",
    hints: [
      {
        vi: "Trên canvas trục y hướng XUỐNG. Muốn góc 0 chỉ hướng 12h và quay thuận chiều kim: x = sin(góc), y = -cos(góc).",
        en: "Canvas y points DOWN. For angle 0 at 12 o'clock rotating clockwise: x = sin(angle), y = -cos(angle).",
      },
      {
        vi: "Kim giờ không nhảy từng giờ: cộng thêm phút/60 vào số giờ trước khi nhân với π/6.",
        en: "The hour hand doesn't jump hourly: add minutes/60 to the hour before multiplying by π/6.",
      },
      {
        vi: "Vạch giờ là đoạn giữa hai điểm cùng hướng nhưng khác độ dài: 0.9R và R — đó chính là scale vector đơn vị.",
        en: "Each hour mark is a segment between two points of the same direction but different lengths: 0.9R and R — that IS unit-vector scaling.",
      },
    ],
    checklist: [
      {
        vi: "12 vạch giờ nằm đều trên đường tròn, đúng vị trí 12h/3h/6h/9h",
        en: "12 marks sit evenly on the circle with 12/3/6/9 in the right places",
      },
      {
        vi: "Kim giây quay trọn một vòng trong đúng 60 giây",
        en: "The second hand completes a full turn in exactly 60 seconds",
      },
      {
        vi: "Kim giờ trôi dần giữa hai số (không nhảy bậc)",
        en: "The hour hand drifts between numerals (no stepping)",
      },
      {
        vi: "Không import thư viện nào — chỉ Math và canvas 2D",
        en: "No library imports — just Math and canvas 2D",
      },
      {
        vi: "Animation chạy mượt bằng requestAnimationFrame, không setInterval",
        en: "Animation runs smoothly on requestAnimationFrame, not setInterval",
      },
    ],
  },
];
