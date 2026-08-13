import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-orbit-animation",
    kind: "build",
    prompt: {
      vi: `Dựng một cảnh canvas 2D tổng hợp toàn bộ module 3: nhiều "hành tinh" bay quanh một tâm bằng $(\\cos\\theta, \\sin\\theta)$ với bán kính, tốc độ và pha khác nhau; một đường ngắm bám theo chuột bằng \`atan2\`, đuổi theo bằng decay hàm mũ đúng dt (không phụ thuộc frame rate); và màu mỗi hành tinh trộn trong không gian linear bằng \`Math.pow(., 2.2)\`/\`Math.pow(., 1 / 2.2)\` tự viết tay, không dùng nội suy thẳng trên giá trị hiển thị.

Gợi ý cấu trúc: một vòng \`requestAnimationFrame\` duy nhất tính \`dt\` bằng giây, cập nhật vị trí từng hành tinh, cập nhật \`aimAngle\` bằng công thức \`aimAngle += angleDiff(target, aimAngle) * (1 - Math.exp(-rate * dt))\`, rồi vẽ.`,
      en: `Build a 2D canvas scene that synthesizes all of module 3: several "bodies" orbiting a center via $(\\cos\\theta, \\sin\\theta)$ with distinct radius, speed and phase; a heading line that aims at the mouse using \`atan2\`, chasing it with a dt-correct exponential decay (independent of frame rate); and each body's color blended in linear space with hand-written \`Math.pow(., 2.2)\`/\`Math.pow(., 1 / 2.2)\`, never a naive interpolation on display values.

Suggested structure: a single \`requestAnimationFrame\` loop computing \`dt\` in seconds, updating each body's position, updating \`aimAngle\` via \`aimAngle += angleDiff(target, aimAngle) * (1 - Math.exp(-rate * dt))\`, then drawing.`,
    },
    starterCode: `const canvas = document.querySelector("canvas")!;
const ctx = canvas.getContext("2d")!;
const CENTER = { x: 200, y: 150 };

const bodies = [
  { radius: 60, speed: 1.2, phase: 0, size: 8 },
  { radius: 90, speed: -0.8, phase: 1.5, size: 10 },
  { radius: 120, speed: 0.5, phase: 3.1, size: 6 },
  { radius: 40, speed: 2.0, phase: 4.7, size: 5 },
];

const colorA = [0.9, 0.15, 0.15]; // đỏ / red, sRGB 0..1
const colorB = [0.15, 0.75, 0.95]; // lam / blue, sRGB 0..1

const mouse = { x: CENTER.x, y: CENTER.y };
canvas.addEventListener("pointermove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

let aimAngle = 0;
let lastT = performance.now();

// TODO 1: srgbToLinear(c) / linearToSrgb(c) dùng Math.pow(c, 2.2) và Math.pow(c, 1 / 2.2)
// TODO 2: linearBlend(a, b, t) — decode cả a và b, trộn từng kênh, encode lại, trả về "rgb(r,g,b)"
// TODO 3: angleDiff(target, current) — đưa hiệu góc về [-PI, PI] để tránh đuổi vòng xa

function draw(now: number) {
  const dt = Math.min((now - lastT) / 1000, 0.1);
  lastT = now;
  const t = now / 1000;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const b of bodies) {
    // TODO 4: tính góc quỹ đạo từ t, b.speed, b.phase; suy ra vị trí bằng cos/sin
    // TODO 5: tính mixT dao động theo góc (vd. (sin(angle)+1)/2), trộn màu bằng linearBlend, vẽ hình tròn
  }

  // TODO 6: targetAngle = atan2(mouse - CENTER); cập nhật aimAngle bằng decay đúng dt
  // TODO 7: vẽ một đoạn thẳng từ CENTER theo hướng aimAngle

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);`,
    solutionCode: `const canvas = document.querySelector("canvas")!;
const ctx = canvas.getContext("2d")!;
const CENTER = { x: 200, y: 150 };

const bodies = [
  { radius: 60, speed: 1.2, phase: 0, size: 8 },
  { radius: 90, speed: -0.8, phase: 1.5, size: 10 },
  { radius: 120, speed: 0.5, phase: 3.1, size: 6 },
  { radius: 40, speed: 2.0, phase: 4.7, size: 5 },
];

const colorA = [0.9, 0.15, 0.15]; // đỏ / red, sRGB 0..1
const colorB = [0.15, 0.75, 0.95]; // lam / blue, sRGB 0..1

const mouse = { x: CENTER.x, y: CENTER.y };
canvas.addEventListener("pointermove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

let aimAngle = 0;
let lastT = performance.now();

function srgbToLinear(c: number) {
  return Math.pow(c, 2.2);
}
function linearToSrgb(c: number) {
  return Math.pow(c, 1 / 2.2);
}
function linearBlend(a: number[], b: number[], t: number) {
  const rgb = a.map((av, i) => {
    const bv = b[i]!;
    const blended = srgbToLinear(av) * (1 - t) + srgbToLinear(bv) * t;
    return Math.round(linearToSrgb(blended) * 255);
  });
  return \`rgb(\${rgb[0]}, \${rgb[1]}, \${rgb[2]})\`;
}

// Khoảng cách góc ngắn nhất, đưa về [-PI, PI] — tránh aimAngle "chạy vòng xa"
// khi target vượt qua ranh giới -PI/PI.
function angleDiff(target: number, current: number) {
  const twoPi = Math.PI * 2;
  return ((target - current + Math.PI) % twoPi + twoPi) % twoPi - Math.PI;
}

function draw(now: number) {
  const dt = Math.min((now - lastT) / 1000, 0.1);
  lastT = now;
  const t = now / 1000;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const b of bodies) {
    const angle = b.phase + t * b.speed;
    const x = CENTER.x + Math.cos(angle) * b.radius;
    const y = CENTER.y + Math.sin(angle) * b.radius;
    const mixT = (Math.sin(angle) + 1) / 2;

    ctx.beginPath();
    ctx.arc(x, y, b.size, 0, Math.PI * 2);
    ctx.fillStyle = linearBlend(colorA, colorB, mixT);
    ctx.fill();
  }

  const targetAngle = Math.atan2(mouse.y - CENTER.y, mouse.x - CENTER.x);
  const rate = 8; // decay lớn hơn = đuổi kịp nhanh hơn
  aimAngle += angleDiff(targetAngle, aimAngle) * (1 - Math.exp(-rate * dt));

  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CENTER.x, CENTER.y);
  ctx.lineTo(CENTER.x + Math.cos(aimAngle) * 140, CENTER.y + Math.sin(aimAngle) * 140);
  ctx.stroke();

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);`,
    hints: [
      {
        vi: "requestAnimationFrame truyền vào timestamp tính bằng ms — chia 1000 để ra giây trước khi dùng trong tốc độ góc hay decay rate.",
        en: "requestAnimationFrame passes a timestamp in ms — divide by 1000 to get seconds before using it in angular speed or the decay rate.",
      },
      {
        vi: "aimAngle và targetAngle có thể lệch nhau hơn π theo số học dù thực tế gần nhau (vd. -3.1 và 3.1 chỉ cách nhau ~0.08 rad) — đưa hiệu số về [-π, π] trước khi áp decay, nếu không đường ngắm sẽ quay vòng xa thay vì đường ngắn nhất.",
        en: "aimAngle and targetAngle can differ by more than π numerically even when they're actually close (e.g. -3.1 and 3.1 are only ~0.08 rad apart) — wrap the difference into [-π, π] before applying decay, or the heading spins the long way around instead of the short way.",
      },
      {
        vi: "Trộn màu bằng Math.pow(c, 2.2) trước khi cộng có trọng số, rồi Math.pow(., 1/2.2) sau cùng — mix() thẳng trên giá trị 0..255 hay 0..1 là chính xác lỗi ở bài lý thuyết vừa học.",
        en: "Decode with Math.pow(c, 2.2) before weighted-summing, then Math.pow(., 1/2.2) at the very end — mixing directly on 0..255 or 0..1 values is exactly the mistake from the theory lesson.",
      },
    ],
    checklist: [
      {
        vi: "Quỹ đạo của mỗi hành tinh dùng đúng $(\\cos\\theta, \\sin\\theta)$, với bán kính/tốc độ/pha khác nhau cho từng hành tinh",
        en: "Each body's orbit correctly uses $(\\cos\\theta, \\sin\\theta)$, with a distinct radius/speed/phase per body",
      },
      {
        vi: "Đường ngắm bám theo chuột bằng atan2, kể cả khi hướng vượt qua ranh giới -π/π",
        en: "The aim line follows the mouse via atan2, including when the direction crosses the -π/π boundary",
      },
      {
        vi: "Tốc độ đuổi theo hướng chuột dùng decay hàm mũ đúng dt — throttle CPU trong DevTools, đường ngắm vẫn đuổi kịp cùng tốc độ thực (giây), không nhanh/chậm theo frame rate",
        en: "The chase toward the mouse direction uses a proper dt-based exponential decay — throttle CPU in DevTools and the heading still catches up at the same real-world (seconds-based) speed, not faster/slower with frame rate",
      },
      {
        vi: "Màu mỗi hành tinh được trộn bằng decode → tính → encode (pow 2.2), không dùng nội suy ngây thơ trên giá trị hiển thị",
        en: "Each body's color is blended via decode → compute → encode (pow 2.2), not a naive interpolation on display values",
      },
      {
        vi: "Toàn bộ animation chạy bằng requestAnimationFrame, không setInterval",
        en: "The whole animation runs on requestAnimationFrame, not setInterval",
      },
      {
        vi: "Không có hành tinh nào đứng yên hay chạy giật cục — chuyển động mượt bất kể tốc độ máy",
        en: "No body is frozen or stutters — motion stays smooth regardless of system speed",
      },
    ],
  },
];
