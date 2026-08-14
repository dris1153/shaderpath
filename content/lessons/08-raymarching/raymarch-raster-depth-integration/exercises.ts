import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "invert-depth-and-bound-by-hand",
    kind: "concept",
    prompt: {
      vi: `Camera có $n = 0.5$, $f = 20$. Tại một pixel, texture depth của mesh trả về $\\text{depth} = 0.92$; tia qua pixel đó có $rd_{view}.z = -0.86$ trong không gian view (đã chuẩn hoá).

Không chạy code: (1) dùng $d = \\dfrac{nf}{f - \\text{depth}(f-n)}$ để tính khoảng cách view-space thật $d$. (2) dùng $t_{bound} = \\dfrac{d}{-rd_{view}.z}$ để tính giới hạn march đúng. (3) nếu quên bước chia, dùng thẳng $d$ làm $t_{bound}$, sai số tuyệt đối là bao nhiêu — và giải thích vì sao sai số này gần 0 ở tâm màn hình nhưng lớn dần ra rìa.`,
      en: `A camera has $n = 0.5$, $f = 20$. At one pixel, the mesh's depth texture returns $\\text{depth} = 0.92$; the ray through that pixel has $rd_{view}.z = -0.86$ in (normalized) view space.

Without running code: (1) use $d = \\dfrac{nf}{f - \\text{depth}(f-n)}$ to compute the true view-space distance $d$. (2) use $t_{bound} = \\dfrac{d}{-rd_{view}.z}$ to compute the correct march bound. (3) if the division step is skipped and $d$ is used directly as $t_{bound}$, what's the absolute error — and why does that error sit near 0 at screen center but grow toward the edges?`,
    },
    hints: [
      {
        vi: "d = (0.5*20) / (20 - 0.92*(20-0.5)) = 10 / (20 - 17.94) = 10 / 2.06. Giữ đủ chữ số thập phân trước khi chia tiếp.",
        en: "d = (0.5*20) / (20 - 0.92*(20-0.5)) = 10 / (20 - 17.94) = 10 / 2.06. Keep enough decimals before dividing again.",
      },
      {
        vi: "Ở tâm màn hình, tia gần như song song trục nhìn nên rd_view.z ≈ -1, phép chia gần như không đổi gì (chia cho ~1). Càng ra rìa, rd_view.z càng xa -1 (tiến về 0), mẫu số càng nhỏ, d và t_bound lệch nhau càng nhiều.",
        en: "At screen center the ray runs nearly parallel to the view axis, so rd_view.z ≈ -1 and dividing barely changes anything (dividing by ~1). Toward the edges, rd_view.z drifts away from -1 (toward 0), the denominator shrinks, and d vs t_bound diverge more.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng d ≈ 4.854",
        en: "I correctly computed d ≈ 4.854",
      },
      {
        vi: "Tôi tính đúng t_bound ≈ 5.644 (chia d cho 0.86)",
        en: "I correctly computed t_bound ≈ 5.644 (d divided by 0.86)",
      },
      {
        vi: "Tôi tính đúng sai số tuyệt đối ≈ 0.79 nếu bỏ qua phép chia, và giải thích được vì sao rd_view.z → -1 ở tâm màn hình làm sai số biến mất",
        en: "I correctly computed the absolute error ≈ 0.79 if the division is skipped, and can explain why rd_view.z → -1 at screen center makes the error vanish",
      },
    ],
    solutionNote: {
      vi: `$d = \\dfrac{nf}{f - \\text{depth}(f-n)} = \\dfrac{0.5 \\times 20}{20 - 0.92 \\times 19.5} = \\dfrac{10}{20 - 17.94} = \\dfrac{10}{2.06} \\approx 4.854$.

$t_{bound} = \\dfrac{d}{-rd_{view,z}} = \\dfrac{4.854}{0.86} \\approx 5.644$.

Nếu bỏ qua phép chia: sai số $= t_{bound} - d \\approx 5.644 - 4.854 = 0.79$. Ở tâm màn hình $rd_{view,z} \\to -1$, nên $-rd_{view,z} \\to 1$ và $t_{bound} \\to d$ (sai số $\\to 0$). Càng ra rìa, tia càng lệch khỏi trục nhìn, $-rd_{view,z}$ càng nhỏ dần về $0$, khiến $d/(-rd_{view,z})$ lớn hơn hẳn $d$ — đúng hiện tượng "chìm dần gần biên" được mô tả trong lý thuyết.`,
      en: `$d = \\dfrac{nf}{f - \\text{depth}(f-n)} = \\dfrac{0.5 \\times 20}{20 - 0.92 \\times 19.5} = \\dfrac{10}{20 - 17.94} = \\dfrac{10}{2.06} \\approx 4.854$.

$t_{bound} = \\dfrac{d}{-rd_{view,z}} = \\dfrac{4.854}{0.86} \\approx 5.644$.

Skipping the division: error $= t_{bound} - d \\approx 5.644 - 4.854 = 0.79$. At screen center $rd_{view,z} \\to -1$, so $-rd_{view,z} \\to 1$ and $t_{bound} \\to d$ (error $\\to 0$). Toward the edges, the ray tilts away from the view axis, $-rd_{view,z}$ shrinks toward $0$, so $d/(-rd_{view,z})$ grows well past $d$ — exactly the "sinking near the border" artifact described in the theory.`,
    },
  },
  {
    id: "depth-sample-to-march-bound-ts",
    kind: "code",
    prompt: {
      vi: `Viết hai hàm TypeScript thuần (không phụ thuộc Three.js) tái hiện đúng hai bước toán của bài: \`linearEyeDepthFromSample\` đảo công thức depth phi tuyến, và \`marchBoundFromDepth\` chia cho thành phần z của ray direction trong không gian view để ra giới hạn march đúng theo TIA, không phải theo trục camera.`,
      en: `Write two pure TypeScript functions (no Three.js dependency) reproducing the lesson's two math steps: \`linearEyeDepthFromSample\` inverts the non-linear depth formula, and \`marchBoundFromDepth\` divides by the ray direction's view-space z component to get the bound along the RAY, not along the camera axis.`,
    },
    starterCode: `function linearEyeDepthFromSample(
  sampledDepth: number,
  near: number,
  far: number,
): number {
  // TODO: d = (near*far) / (far - sampledDepth*(far-near))
  return 0;
}

function marchBoundFromDepth(
  linearEyeDepth: number,
  rayDirViewZ: number,
): number {
  // TODO: t_bound = linearEyeDepth / max(-rayDirViewZ, 1e-4)
  // (the 1e-4 floor avoids a divide-by-zero for a ray running exactly
  // perpendicular to the view axis)
  return 0;
}`,
    solutionCode: `function linearEyeDepthFromSample(
  sampledDepth: number,
  near: number,
  far: number,
): number {
  return (near * far) / (far - sampledDepth * (far - near));
}

function marchBoundFromDepth(
  linearEyeDepth: number,
  rayDirViewZ: number,
): number {
  return linearEyeDepth / Math.max(-rayDirViewZ, 1e-4);
}`,
    hints: [
      {
        vi: "linearEyeDepthFromSample chỉ là một biểu thức đại số, đúng thứ tự phép toán như KaTeX trong bài lý thuyết — không có vòng lặp, không có điều kiện.",
        en: "linearEyeDepthFromSample is just an algebraic expression matching the theory lesson's KaTeX, in the same operator order — no loop, no conditional.",
      },
      {
        vi: "Đừng quên dấu trừ trước rayDirViewZ trong marchBoundFromDepth — ray hướng vào màn hình có z ÂM trong không gian view (camera nhìn theo -z), nên -rayDirViewZ mới dương.",
        en: "Don't drop the minus sign before rayDirViewZ in marchBoundFromDepth — a ray pointing into the screen has a NEGATIVE z in view space (the camera looks down -z), so -rayDirViewZ is what's positive.",
      },
    ],
    checklist: [
      {
        vi: "linearEyeDepthFromSample(0.92, 0.5, 20) trả về xấp xỉ 4.854",
        en: "linearEyeDepthFromSample(0.92, 0.5, 20) returns approximately 4.854",
      },
      {
        vi: "marchBoundFromDepth(4.854, -0.86) trả về xấp xỉ 5.644",
        en: "marchBoundFromDepth(4.854, -0.86) returns approximately 5.644",
      },
      {
        vi: "marchBoundFromDepth không chia cho 0 khi rayDirViewZ = 0 (nhờ sàn 1e-4)",
        en: "marchBoundFromDepth doesn't divide by zero when rayDirViewZ = 0 (thanks to the 1e-4 floor)",
      },
    ],
  },
];
