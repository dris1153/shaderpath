import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "remap-health-to-alpha",
    kind: "concept",
    prompt: {
      vi: `Một thanh máu có giá trị hiện tại $hp = 65$ trên thang $[0, 200]$. Dùng \`remap\` để tính hệ số alpha hiển thị trong khoảng $[0.2, 1]$ (không bao giờ để thanh hoàn toàn trong suốt dù $hp$ về 0). Không chạy code, tính alpha khi $hp=65$.

Sau đó trả lời: nếu $hp$ đột ngột vượt quá 200 (buff tạm thời, ví dụ $hp=250$), alpha tính theo \`remap\` thuần sẽ ra bao nhiêu — và cách xử lý đúng để tránh giá trị đó là gì?`,
      en: `A health bar currently has $hp = 65$ on a $[0, 200]$ scale. Use \`remap\` to compute a display alpha within $[0.2, 1]$ (the bar should never go fully transparent even at $hp=0$). Without running code, compute alpha at $hp=65$.

Then answer: if $hp$ suddenly exceeds 200 (a temporary buff, say $hp=250$), what does plain \`remap\` produce for alpha — and what's the correct fix to prevent that value?`,
    },
    hints: [
      {
        vi: "Tính `invLerp(0, 200, 65)` trước, rồi `lerp` kết quả đó vào khoảng $[0.2, 1]$.",
        en: "Compute `invLerp(0, 200, 65)` first, then `lerp` that result into $[0.2, 1]$.",
      },
      {
        vi: "Khi input vượt biên trên khoảng gốc, `remap` ngoại suy hợp lệ về mặt toán học nhưng thường vô nghĩa cho alpha — cần chặn output lại.",
        en: "When the input exceeds the source range, `remap` extrapolates in a mathematically valid but usually meaningless way for an alpha value — the output needs to be pinned back down.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng alpha ≈ 0.46 khi $hp=65$",
        en: "I computed alpha ≈ 0.46 at $hp=65$ correctly",
      },
      {
        vi: "Tôi tính được remap thuần cho alpha = 1.2 khi $hp=250$ — vượt quá 1",
        en: "I computed that plain remap gives alpha = 1.2 at $hp=250$ — over 1",
      },
      {
        vi: "Tôi giải thích được cần `clamp(alpha, 0.2, 1)` ngay sau remap để tránh giá trị hiển thị sai",
        en: "I can explain the need for `clamp(alpha, 0.2, 1)` right after remap to prevent an invalid display value",
      },
    ],
    solutionNote: {
      vi: `$\\mathrm{invLerp}(0, 200, 65) = 65/200 = 0.325$. $\\alpha = \\mathrm{lerp}(0.2, 1, 0.325) = 0.2 + 0.8\\times 0.325 = 0.46$.

Khi $hp = 250$ (vượt biên trên $200$): $\\mathrm{invLerp}(0, 200, 250) = 1.25$, $\\alpha = \\mathrm{lerp}(0.2, 1, 1.25) = 0.2 + 0.8\\times 1.25 = 1.2$ — vượt quá $1$, vô nghĩa cho một hệ số alpha (driver sẽ hiểu $1.2$ như thế nào là không xác định).

Sửa: luôn \`clamp(alpha, 0.2, 1)\` (hoặc clamp $t$ về $[0,1]$ trước khi lerp ra alpha) ngay sau remap, bất kể input $hp$ có vượt biên gốc hay không.`,
      en: `$\\mathrm{invLerp}(0, 200, 65) = 65/200 = 0.325$. $\\alpha = \\mathrm{lerp}(0.2, 1, 0.325) = 0.2 + 0.8\\times 0.325 = 0.46$.

At $hp = 250$ (past the upper bound of $200$): $\\mathrm{invLerp}(0, 200, 250) = 1.25$, $\\alpha = \\mathrm{lerp}(0.2, 1, 1.25) = 0.2 + 0.8\\times 1.25 = 1.2$ — over $1$, meaningless for an alpha coefficient (undefined behavior for whatever consumes $1.2$).

Fix: always \`clamp(alpha, 0.2, 1)\` (or clamp $t$ to $[0,1]$ before lerping into alpha) right after the remap, regardless of whether the input $hp$ exceeds the source range.`,
    },
  },
  {
    id: "frame-rate-independent-damping",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`dampTowards(value, target, lambda, dt)\` làm mượt \`value\` hội tụ về \`target\` theo dạng suy giảm mũ **đúng theo \`dt\`** — không phụ thuộc frame rate như \`value += (target-value)*k\` mỗi frame.`,
      en: `Write a function \`dampTowards(value, target, lambda, dt)\` that smooths \`value\` toward \`target\` using an exponential-decay form that is **dt-correct** — not frame-rate dependent like \`value += (target-value)*k\` every frame.`,
    },
    starterCode: `function dampTowards(value: number, target: number, lambda: number, dt: number): number {
  // TODO: return the new value converging toward target via
  // value + (target - value) * (1 - e^(-lambda * dt))
  return value;
}`,
    solutionCode: `function dampTowards(value: number, target: number, lambda: number, dt: number): number {
  return value + (target - value) * (1 - Math.exp(-lambda * dt));
}`,
    hints: [
      {
        vi: "`Math.exp(-lambda * dt)` tiến về 0 khi `dt` lớn (gần hội tụ hết trong một bước), tiến về 1 khi `dt` nhỏ (gần như chưa đổi) — công thức tự thích nghi theo `dt`.",
        en: "`Math.exp(-lambda * dt)` approaches 0 as `dt` grows (nearly fully converged in one step) and approaches 1 as `dt` shrinks (barely changed) — the formula self-adjusts to `dt`.",
      },
      {
        vi: "Cách kiểm tra nhanh 'đúng dt': gọi hàm 10 lần liên tiếp với `dt` nhỏ phải cho kết quả gần giống một lần gọi duy nhất với `dt` lớn gấp 10.",
        en: "Quick 'is it dt-correct' check: calling the function 10 times in a row with a small `dt` should land close to a single call with `dt` ten times larger.",
      },
    ],
    checklist: [
      {
        vi: "Gọi lặp lại nhiều lần với `dt` nhỏ hội tụ dần về đúng `target`, không bao giờ vọt lố (overshoot) qua nó",
        en: "Calling repeatedly with a small `dt` converges gradually to exactly `target`, never overshooting past it",
      },
      {
        vi: "Nhiều bước `dt` nhỏ cộng dồn cho kết quả gần đúng với một bước `dt` lớn bằng tổng — frame-rate independent",
        en: "Many small `dt` steps summed together land close to one big step of the same total `dt` — frame-rate independent",
      },
      {
        vi: "`lambda` lớn hơn hội tụ nhanh hơn; `lambda = 0` giữ nguyên `value` không đổi",
        en: "A larger `lambda` converges faster; `lambda = 0` leaves `value` unchanged",
      },
    ],
  },
];
