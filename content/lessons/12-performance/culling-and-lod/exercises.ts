import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "screen-coverage-vs-distance",
    kind: "concept",
    prompt: {
      vi: `Hai object cùng đứng ở khoảng cách $d = 6$m: object A bán kính $r_A = 0.15$m, object B bán kính $r_B = 0.6$m. Viewport cao $H = 900$px, FOV dọc $\\theta = 45°$ (nên $\\tan(22.5°) \\approx 0.4142$).

Dùng công thức $s_{\\text{px}} \\approx \\dfrac{H \\cdot r}{d \\cdot \\tan(\\theta/2)}$, tính $s_{\\text{px}}$ cho cả A và B. Nếu ngưỡng chuyển sang billboard phẳng là $s_{\\text{px}} < 40$px, cả hai có nên chuyển ở $d = 6$m không? Sau đó tính: object A phải lùi ra đến khoảng cách $d$ nào thì $s_{\\text{px}}$ của nó chạm đúng 40px?`,
      en: `Two objects both sit at distance $d = 6$m: object A has radius $r_A = 0.15$m, object B has radius $r_B = 0.6$m. The viewport is $H = 900$px tall, vertical FOV $\\theta = 45°$ (so $\\tan(22.5°) \\approx 0.4142$).

Using $s_{\\text{px}} \\approx \\dfrac{H \\cdot r}{d \\cdot \\tan(\\theta/2)}$, compute $s_{\\text{px}}$ for both A and B. If the threshold for switching to a flat billboard is $s_{\\text{px}} < 40$px, should either switch at $d = 6$m? Then find: at what distance $d$ does object A's $s_{\\text{px}}$ hit exactly 40px?`,
    },
    hints: [
      {
        vi: "Thay số trực tiếp: $s_{\\text{px}} = \\dfrac{900 \\times r}{6 \\times 0.4142}$ — mẫu số giống nhau cho cả A và B vì cùng $d$ và cùng viewport/FOV, chỉ tử số đổi theo $r$.",
        en: "Substitute directly: $s_{\\text{px}} = \\dfrac{900 \\times r}{6 \\times 0.4142}$ — the denominator is identical for A and B since $d$/viewport/FOV are shared, only the numerator changes with $r$.",
      },
      {
        vi: "Để tìm $d$ khi biết $s_{\\text{px}}$ mục tiêu, giải ngược công thức: $d = \\dfrac{H \\cdot r}{s_{\\text{px}} \\cdot \\tan(\\theta/2)}$ — chỉ cần đổi vai trò biến đã biết/cần tìm.",
        en: "To find $d$ from a target $s_{\\text{px}}$, invert the formula: $d = \\dfrac{H \\cdot r}{s_{\\text{px}} \\cdot \\tan(\\theta/2)}$ — just swap which variable is known versus solved for.",
      },
    ],
    checklist: [
      {
        vi: "Tính đúng $s_{\\text{px}}^A \\approx 54$px và $s_{\\text{px}}^B \\approx 217$px",
        en: "Correctly computed $s_{\\text{px}}^A \\approx 54$px and $s_{\\text{px}}^B \\approx 217$px",
      },
      {
        vi: "Kết luận đúng: cả hai đều TRÊN ngưỡng 40px ở d=6m nên chưa object nào nên chuyển billboard",
        en: "Correct conclusion: both are ABOVE the 40px threshold at d=6m, so neither should switch to billboard yet",
      },
      {
        vi: "Tính đúng khoảng cách object A chạm ngưỡng: $d \\approx 8.15$m",
        en: "Correctly computed the distance where object A hits the threshold: $d \\approx 8.15$m",
      },
    ],
    solutionNote: {
      vi: `$s_{px}^A = (900 \\times 0.15)/(6 \\times 0.4142) = 135/2.4852 \\approx 54.3$px. $s_{px}^B = (900 \\times 0.6)/(6 \\times 0.4142) = 540/2.4852 \\approx 217.3$px.

Cả 54.3px và 217.3px đều > 40px → CHƯA object nào nên chuyển sang billboard ở $d=6$m (dùng chung một ngưỡng "distance" cố định cho cả hai sẽ sai: nếu chuyển cả hai ở $d=6$m, object B mất chi tiết SỚM dù đang chiếm tới 217px màn hình — vẫn còn rất rõ).

Giải $d$ khi $s_{px} = 40$ cho object A ($r=0.15$): $d = (900 \\times 0.15)/(40 \\times 0.4142) = 135/16.568 \\approx 8.15$m.`,
      en: `$s_{px}^A = (900 \\times 0.15)/(6 \\times 0.4142) = 135/2.4852 \\approx 54.3$px. $s_{px}^B = (900 \\times 0.6)/(6 \\times 0.4142) = 540/2.4852 \\approx 217.3$px.

Both 54.3px and 217.3px are > 40px → NEITHER object should switch to billboard at $d=6$m (sharing a single fixed "distance" threshold for both would be wrong: switching both at $d=6$m would drop object B's detail TOO EARLY even though it still covers 217px on screen — still very much visible).

Solving for $d$ when $s_{px} = 40$ for object A ($r=0.15$): $d = (900 \\times 0.15)/(40 \\times 0.4142) = 135/16.568 \\approx 8.15$m.`,
    },
  },
  {
    id: "pick-lod-level-by-coverage",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`pickLodLevel\` chọn level LOD (chỉ số 0/1/2) dựa trên **screen-coverage** thay vì khoảng cách thô — đúng vấn đề nêu trong lý thuyết. Hàm nhận bán kính object \`radius\`, khoảng cách \`distance\`, FOV dọc \`fovDeg\`, chiều cao viewport \`viewportHeight\` (px), và một mảng \`thresholdsPx\` GIẢM DẦN gồm 2 số (ví dụ \`[80, 30]\`) — trả về \`0\` nếu $s_{\\text{px}} \\geq$ ngưỡng đầu, \`1\` nếu nằm giữa hai ngưỡng, \`2\` nếu dưới ngưỡng thứ hai.`,
      en: `Write a \`pickLodLevel\` function that picks a LOD level (index 0/1/2) based on **screen coverage** instead of raw distance — exactly the problem the theory raises. It takes an object's \`radius\`, its \`distance\`, the vertical FOV \`fovDeg\`, the viewport height \`viewportHeight\` (px), and a DESCENDING 2-element \`thresholdsPx\` array (e.g. \`[80, 30]\`) — return \`0\` if $s_{\\text{px}} \\geq$ the first threshold, \`1\` if it's between the two thresholds, \`2\` if it's below the second.`,
    },
    starterCode: `function pickLodLevel(
  radius: number,
  distance: number,
  fovDeg: number,
  viewportHeight: number,
  thresholdsPx: readonly [number, number],
): 0 | 1 | 2 {
  // TODO 1: convert fovDeg to radians, compute s_px using the formula
  //   s_px = (viewportHeight * radius) / (distance * tan(fovRad / 2))
  // TODO 2: compare s_px against thresholdsPx[0] and thresholdsPx[1], return 0/1/2
  return 0;
}`,
    solutionCode: `function pickLodLevel(
  radius: number,
  distance: number,
  fovDeg: number,
  viewportHeight: number,
  thresholdsPx: readonly [number, number],
): 0 | 1 | 2 {
  const fovRad = (fovDeg * Math.PI) / 180;
  const sPx = (viewportHeight * radius) / (distance * Math.tan(fovRad / 2));

  if (sPx >= thresholdsPx[0]) return 0;
  if (sPx >= thresholdsPx[1]) return 1;
  return 2;
}`,
    hints: [
      {
        vi: "`Math.tan` nhận radian, không nhận độ — `fovDeg * Math.PI / 180` trước, rồi mới chia đôi để lấy nửa góc như công thức.",
        en: "`Math.tan` takes radians, not degrees — convert with `fovDeg * Math.PI / 180` first, then halve it for the half-angle in the formula.",
      },
      {
        vi: "`thresholdsPx` đã đảm bảo giảm dần (phần tử 0 lớn hơn phần tử 1) — chỉ cần so `sPx` với từng ngưỡng theo thứ tự từ cao xuống thấp, không cần sort lại.",
        en: "`thresholdsPx` is guaranteed descending (element 0 larger than element 1) — just compare `sPx` against each threshold from high to low, no need to sort.",
      },
    ],
    checklist: [
      {
        vi: "Object lớn/gần (s_px cao) trả về level 0, object nhỏ/xa (s_px thấp) trả về level 2",
        en: "A large/near object (high s_px) returns level 0, a small/far one (low s_px) returns level 2",
      },
      {
        vi: "fovDeg được đổi sang radian trước khi gọi Math.tan",
        en: "fovDeg is converted to radians before calling Math.tan",
      },
      {
        vi: "Kết quả khớp với hai giá trị tính tay ở bài tập concept phía trên (dùng cùng công thức để tự kiểm tra)",
        en: "Results match the two hand-computed values from the concept exercise above (same formula, use it to self-check)",
      },
    ],
  },
];
