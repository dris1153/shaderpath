import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "rect-area-light-power-scaling",
    kind: "concept",
    prompt: {
      vi: `Một \`RectAreaLight\` rộng $4\\text{m} \\times 1.5\\text{m}$ cần đạt luminous power $2000$ lm. Dùng công thức thật trong \`RectAreaLight.js\`: $power = intensity \\times width \\times height \\times \\pi$, tính \`intensity\` cần đặt.

Sau đó, không đổi \`intensity\` vừa tính, chỉ nhân đôi CẢ width và height (thành $8\\text{m} \\times 3\\text{m}$). Power mới là bao nhiêu, và vì sao nó không chỉ tăng gấp đôi?`,
      en: `A \`RectAreaLight\` sized $4\\text{m} \\times 1.5\\text{m}$ needs to reach a luminous power of $2000$ lm. Using the real formula from \`RectAreaLight.js\`: $power = intensity \\times width \\times height \\times \\pi$, compute the \`intensity\` you'd set.

Then, keeping that same \`intensity\`, double BOTH width and height (to $8\\text{m} \\times 3\\text{m}$). What's the new power, and why doesn't it just double?`,
    },
    hints: [
      {
        vi: "Đảo công thức: intensity = power / (width * height * π). Thay số trực tiếp, giữ đủ chữ số thập phân trước khi làm tròn.",
        en: "Invert the formula: intensity = power / (width * height * π). Substitute directly and keep the decimals before rounding.",
      },
      {
        vi: "Diện tích panel là width × height. Nhân đôi CẢ hai chiều nhân diện tích lên 2×2 = 4 lần, không phải 2 lần — power tỉ lệ thuận với diện tích khi intensity không đổi.",
        en: "The panel's area is width × height. Doubling BOTH dimensions multiplies the area by 2×2 = 4, not 2 — power scales linearly with area when intensity stays fixed.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính được intensity ≈ 106.1 (2000 / (4 × 1.5 × π))",
        en: "I computed intensity ≈ 106.1 (2000 / (4 × 1.5 × π))",
      },
      {
        vi: "Tôi tính được power mới ≈ 8000 lm sau khi nhân đôi width và height",
        en: "I computed the new power ≈ 8000 lm after doubling width and height",
      },
      {
        vi: "Tôi giải thích được vì sao power tỉ lệ với DIỆN TÍCH (width × height), không phải tuyến tính theo từng cạnh",
        en: "I can explain why power scales with AREA (width × height), not linearly with either edge alone",
      },
    ],
    solutionCode: `// intensity = power / (width * height * Math.PI)
// intensity = 2000 / (4 * 1.5 * Math.PI) = 2000 / 18.8496 ≈ 106.1

// Doubling width AND height: new area = 8 * 3 = 24 (was 4 * 1.5 = 6, exactly 4×)
// newPower = intensity * newArea * Math.PI = 106.1 * 24 * Math.PI ≈ 8000
//
// Power scales with AREA, and area is the PRODUCT of two dimensions — doubling
// both multiplies area (and therefore power, at fixed intensity) by 2 * 2 = 4.`,
  },
  {
    id: "lerp-spherical-harmonics",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`lerpSH\` nội suy tuyến tính giữa hai mảng hệ số Spherical Harmonics đã "làm phẳng" (mỗi mảng 27 số: 9 hệ số RGB nối liền nhau, đúng định dạng \`SphericalHarmonics3.toArray()\` trả về), theo hệ số $\\alpha \\in [0, 1]$. Đây chính là phép toán đứng sau \`SphericalHarmonics3.lerp(sh, alpha)\` mà bài học dùng để nội suy giữa hai light probe.`,
      en: `Write a \`lerpSH\` function that linearly interpolates between two "flattened" Spherical Harmonics coefficient arrays (each 27 numbers: 9 RGB coefficients laid end to end, exactly the format \`SphericalHarmonics3.toArray()\` returns), by a factor $\\alpha \\in [0, 1]$. This is the exact operation behind \`SphericalHarmonics3.lerp(sh, alpha)\`, which this lesson uses to interpolate between two light probes.`,
    },
    starterCode: `function lerpSH(a: number[], b: number[], alpha: number): number[] {
  // TODO: mỗi phần tử kết quả = a[i] + (b[i] - a[i]) * alpha
  // (đúng 27 phần tử vào, 27 phần tử ra — không cần biết ý nghĩa từng phần tử)
  return a;
}`,
    solutionCode: `function lerpSH(a: number[], b: number[], alpha: number): number[] {
  if (a.length !== 27 || b.length !== 27) {
    throw new Error("lerpSH expects flattened SH9 arrays of length 27");
  }
  return a.map((v, i) => v + (b[i]! - v) * alpha);
}`,
    hints: [
      {
        vi: "Không cần hiểu ý nghĩa vật lý của từng hệ số — lerp hoạt động phần-tử-theo-phần-tử, giống hệt lerp một số thực bình thường, chỉ lặp lại 27 lần.",
        en: "You don't need to understand what each coefficient physically means — lerp works element-by-element, exactly like lerping a single number, just repeated 27 times.",
      },
      {
        vi: "Công thức lerp chuẩn: kết quả = a + (b - a) * alpha. Tại alpha=0 trả đúng a, tại alpha=1 trả đúng b.",
        en: "The standard lerp formula: result = a + (b - a) * alpha. At alpha=0 it returns exactly a, at alpha=1 exactly b.",
      },
    ],
    checklist: [
      {
        vi: "lerpSH(a, b, 0) trả về đúng mảng a (không đổi giá trị nào)",
        en: "lerpSH(a, b, 0) returns exactly array a (no value changed)",
      },
      {
        vi: "lerpSH(a, b, 1) trả về đúng mảng b",
        en: "lerpSH(a, b, 1) returns exactly array b",
      },
      {
        vi: "lerpSH(a, b, 0.5) trả về trung điểm chính xác của từng cặp phần tử tương ứng",
        en: "lerpSH(a, b, 0.5) returns the exact midpoint of each corresponding element pair",
      },
    ],
  },
];
