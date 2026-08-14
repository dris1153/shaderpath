import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "vignette-smoothstep-by-hand",
    kind: "concept",
    prompt: {
      vi: `Canvas $1600 \\times 900$ (tỉ lệ $16{:}9$, $\\text{aspect} = 16/9 \\approx 1.778$). Điểm $uv = (0.9, 0.5)$. Vignette có bán kính $r = 0.3$ và độ tối $d = 0.4$, tính bằng công thức của bài này:

$$
p = (uv - 0.5) \\times (\\text{aspect}, 1), \\qquad \\text{dist} = \\lVert p \\rVert
$$

$$
\\text{vig} = 1 - d \\cdot \\mathrm{smoothstep}(r,\\ 1,\\ \\text{dist})
$$

Không chạy code: tính $p$, $\\text{dist}$, giá trị $\\mathrm{smoothstep}(0.3, 1, \\text{dist})$, rồi $\\text{vig}$ cuối cùng.

Sau đó trả lời: vì sao công thức dùng \`smoothstep\` thay vì một phép trộn tuyến tính (\`mix\`/\`lerp\`) đơn giản giữa $r$ và $1$?`,
      en: `A $1600 \\times 900$ canvas ($16{:}9$, $\\text{aspect} = 16/9 \\approx 1.778$). Point $uv = (0.9, 0.5)$. A vignette with radius $r = 0.3$ and darkness $d = 0.4$, using this lesson's formula:

$$
p = (uv - 0.5) \\times (\\text{aspect}, 1), \\qquad \\text{dist} = \\lVert p \\rVert
$$

$$
\\text{vig} = 1 - d \\cdot \\mathrm{smoothstep}(r,\\ 1,\\ \\text{dist})
$$

Without running code: compute $p$, $\\text{dist}$, the value of $\\mathrm{smoothstep}(0.3, 1, \\text{dist})$, and the final $\\text{vig}$.

Then answer: why does the formula use \`smoothstep\` instead of a simple linear blend (\`mix\`/\`lerp\`) between $r$ and $1$?`,
    },
    hints: [
      {
        vi: "$p = ((0.9-0.5) \\times 1.778,\\ 0.5-0.5) = (0.711,\\ 0)$ — nhân aspect chỉ vào thành phần $x$, giữ $y$ nguyên. Từ đó $\\text{dist} = \\lVert p \\rVert = 0.711$ (vì $p.y = 0$).",
        en: "$p = ((0.9-0.5) \\times 1.778,\\ 0.5-0.5) = (0.711,\\ 0)$ — the aspect factor only multiplies the $x$ component, $y$ stays as-is. So $\\text{dist} = \\lVert p \\rVert = 0.711$ (since $p.y = 0$).",
      },
      {
        vi: "$\\mathrm{smoothstep}(r, 1, x)$ trước tiên chuẩn hoá $t = \\mathrm{clamp}\\!\\left(\\dfrac{x-r}{1-r}, 0, 1\\right)$, rồi trả về $t^2(3-2t)$ — không phải trả thẳng $t$.",
        en: "$\\mathrm{smoothstep}(r, 1, x)$ first normalizes $t = \\mathrm{clamp}\\!\\left(\\dfrac{x-r}{1-r}, 0, 1\\right)$, then returns $t^2(3-2t)$ — not $t$ itself.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng $\\text{dist} \\approx 0.711$",
        en: "I correctly computed $\\text{dist} \\approx 0.711$",
      },
      {
        vi: "Tôi tính đúng $t \\approx 0.587$ rồi $\\mathrm{smoothstep} \\approx 0.630$, cho $\\text{vig} \\approx 0.748$",
        en: "I correctly computed $t \\approx 0.587$ then $\\mathrm{smoothstep} \\approx 0.630$, giving $\\text{vig} \\approx 0.748$",
      },
      {
        vi: "Tôi giải thích được smoothstep tránh một đường viền/mach-band nhìn thấy được tại đúng bán kính $r$, vì đạo hàm của nó bằng 0 ở cả hai đầu — mix tuyến tính có một điểm gãy đạo hàm đột ngột tại $r$",
        en: "I can explain that smoothstep avoids a visible ring/mach-band right at radius $r$, since its derivative is 0 at both ends — a linear mix has an abrupt derivative kink exactly at $r$",
      },
    ],
    solutionCode: `// p = ((0.9 - 0.5) * 1.778, 0.5 - 0.5) = (0.711, 0)
// dist = length(p) = 0.711 (p.y = 0, so dist = |p.x|)
//
// t = clamp((0.711 - 0.3) / (1 - 0.3), 0, 1) = clamp(0.411 / 0.7, 0, 1) = 0.587
// smoothstep = t*t*(3 - 2*t) = 0.587^2 * (3 - 1.174) = 0.345 * 1.826 ≈ 0.630
//
// vig = 1 - 0.4 * 0.630 ≈ 1 - 0.252 = 0.748
//
// smoothstep is used instead of mix() because it's C1-continuous at both
// r and 1: its derivative is exactly 0 at the edges, so the transition
// blends in/out smoothly. A linear mix has a sharp derivative discontinuity
// right at dist = r — visible as a faint ring where the darkening "starts",
// a classic mach-band artifact the eye is very sensitive to.`,
  },
  {
    id: "chromatic-aberration-offset-fn",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`chromaticAberrationOffset(uv, resolution, aberrationPx)\` — bản TypeScript thuần của công thức offset dùng trong \`stylistic-pass.frag\`:

$$
p = (uv - 0.5) \\times (\\text{aspect}, 1), \\qquad \\text{dist} = \\lVert p \\rVert, \\qquad \\hat d = p / \\text{dist}
$$

$$
\\text{offset} = \\hat d \\cdot \\dfrac{s}{R_x} \\cdot \\text{dist}
$$

với $s$ = \`aberrationPx\`, $R_x$ = chiều rộng canvas (\`resolution.x\`). Hàm trả về vector offset (đơn vị UV) dùng để lấy mẫu kênh R tại \`uv + offset\` và kênh B tại \`uv - offset\`. Xử lý đúng trường hợp $\\text{dist} \\approx 0$ (tâm ảnh) để tránh chia cho 0.`,
      en: `Write \`chromaticAberrationOffset(uv, resolution, aberrationPx)\` — a plain TypeScript port of the offset formula used in \`stylistic-pass.frag\`:

$$
p = (uv - 0.5) \\times (\\text{aspect}, 1), \\qquad \\text{dist} = \\lVert p \\rVert, \\qquad \\hat d = p / \\text{dist}
$$

$$
\\text{offset} = \\hat d \\cdot \\dfrac{s}{R_x} \\cdot \\text{dist}
$$

where $s$ = \`aberrationPx\`, $R_x$ = the canvas width (\`resolution.x\`). The function returns the offset vector (in UV units) used to sample the R channel at \`uv + offset\` and the B channel at \`uv - offset\`. Handle $\\text{dist} \\approx 0$ (image center) so it never divides by zero.`,
    },
    starterCode: `interface Vec2 { x: number; y: number }

function chromaticAberrationOffset(
  uv: Vec2,
  resolution: Vec2,
  aberrationPx: number,
): Vec2 {
  const aspect = resolution.x / resolution.y;

  // TODO 1: compute p = (uv - 0.5), with aspect applied to p.x only
  // TODO 2: dist = length(p); guard against dist ~ 0 (return {x:0, y:0})
  // TODO 3: dir = p / dist, then offset = dir * (aberrationPx / resolution.x) * dist

  return { x: 0, y: 0 };
}`,
    solutionCode: `interface Vec2 { x: number; y: number }

function chromaticAberrationOffset(
  uv: Vec2,
  resolution: Vec2,
  aberrationPx: number,
): Vec2 {
  const aspect = resolution.x / resolution.y;

  const px = (uv.x - 0.5) * aspect;
  const py = uv.y - 0.5;
  const dist = Math.sqrt(px * px + py * py);

  if (dist < 1e-5) return { x: 0, y: 0 }; // dead center — no dispersion to speak of

  const dirX = px / dist;
  const dirY = py / dist;
  const magnitude = (aberrationPx / resolution.x) * dist;

  return { x: dirX * magnitude, y: dirY * magnitude };
}`,
    hints: [
      {
        vi: "Aspect chỉ nhân vào thành phần $x$ của $p$ trước khi tính $\\text{dist}$ — đây là bước aspect-correction giữ vignette/CA hình tròn thay vì hình elip, giống hệt cách bài này xử lý vignette.",
        en: "Aspect only multiplies $p$'s $x$ component before computing $\\text{dist}$ — this is the same aspect-correction step that keeps the vignette/CA circular instead of elliptical, identical to how this lesson handles the vignette.",
      },
      {
        vi: "\`aberrationPx / resolution.x\` chuyển độ mạnh từ đơn vị PIXEL sang đơn vị UV (khoảng $[0,1]$) — thiếu phép chia này, cùng một giá trị \`aberrationPx\` sẽ tạo ra độ lệch UV khác nhau (và do đó độ lệch pixel khác nhau) tuỳ theo độ phân giải canvas.",
        en: "\`aberrationPx / resolution.x\` converts the strength from PIXEL units into UV units (the $[0,1]$ range) — skip this division and the same \`aberrationPx\` value produces a different UV shift (and therefore a different pixel shift) depending on canvas resolution.",
      },
    ],
    checklist: [
      {
        vi: "Gọi hàm với \`uv = {x:0.5, y:0.5}\` (tâm ảnh) trả về \`{x:0, y:0}\`, không NaN",
        en: "Calling the function with \`uv = {x:0.5, y:0.5}\` (image center) returns \`{x:0, y:0}\`, never NaN",
      },
      {
        vi: "Độ lớn offset tăng dần khi \`uv\` di chuyển ra xa tâm, đúng như \"tán sắc mạnh dần ở rìa\" mô tả trong lý thuyết",
        en: "Offset magnitude grows as \`uv\` moves away from center, matching the \"dispersion grows toward the edges\" behavior described in the theory",
      },
      {
        vi: "Offset trả về đúng đơn vị UV (số rất nhỏ, ví dụ ~0.001) chứ không phải đơn vị pixel",
        en: "The returned offset is in UV units (a very small number, e.g. ~0.001), not pixel units",
      },
    ],
  },
];
