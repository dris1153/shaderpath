import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "vsm-chebyshev-bound-by-hand",
    kind: "concept",
    prompt: {
      vi: `Một texel VSM lưu $\\mu = 0.5$ (mean depth) và mean-of-squares $= 0.27$. Một fragment đang shading có light-space depth $z = 0.6$.

Không chạy code, tính từng bước đúng công thức three.js dùng (\`shadowmap_pars_fragment.glsl.js\`): phương sai $\\sigma^2 = \\text{meanSquare} - \\mu^2$; $d = z - \\mu$; chặn Chebyshev $p_{max} = \\dfrac{\\sigma^2}{\\sigma^2 + d^2}$; rồi remap $\\text{clamp}\\left(\\dfrac{p_{max} - 0.3}{0.65},\\ 0,\\ 1\\right)$. So sánh kết quả cuối với phép so sánh nhị phân thường (\`hard_shadow = z \\le \\mu\\ ?\\ 1 : 0\\)) — hai kết quả có khớp nhau không, và điều đó nói lên điều gì về bản chất "thống kê" của VSM?`,
      en: `A VSM texel stores $\\mu = 0.5$ (mean depth) and mean-of-squares $= 0.27$. A fragment being shaded has light-space depth $z = 0.6$.

Without running code, compute each step using the exact formula three.js uses (\`shadowmap_pars_fragment.glsl.js\`): variance $\\sigma^2 = \\text{meanSquare} - \\mu^2$; $d = z - \\mu$; the Chebyshev bound $p_{max} = \\dfrac{\\sigma^2}{\\sigma^2 + d^2}$; then the remap $\\text{clamp}\\left(\\dfrac{p_{max} - 0.3}{0.65},\\ 0,\\ 1\\right)$. Compare the final result against a plain binary comparison (\`hard_shadow = z \\le \\mu\\ ?\\ 1 : 0\\)) — do the two agree, and what does that say about VSM's "statistical" nature?`,
    },
    hints: [
      {
        vi: "sigma^2 = 0.27 - 0.5^2 = 0.27 - 0.25 = 0.02. d = 0.6 - 0.5 = 0.1, d^2 = 0.01. Thay trực tiếp vào p_max trước khi remap.",
        en: "sigma^2 = 0.27 - 0.5^2 = 0.27 - 0.25 = 0.02. d = 0.6 - 0.5 = 0.1, d^2 = 0.01. Substitute directly into p_max before remapping.",
      },
      {
        vi: "hard_shadow dùng z <= mu: 0.6 <= 0.5 là false, nên hard_shadow = 0 (coi là trong bóng). shadow cuối = max(hard_shadow, p_max đã remap).",
        en: "hard_shadow uses z <= mu: 0.6 <= 0.5 is false, so hard_shadow = 0 (treated as in shadow). The final shadow = max(hard_shadow, remapped p_max).",
      },
    ],
    checklist: [
      {
        vi: "Tính đúng sigma^2 = 0.02 và p_max = 0.02/0.03 ~ 0.667",
        en: "Correctly computed sigma^2 = 0.02 and p_max = 0.02/0.03 ~ 0.667",
      },
      {
        vi: "Tính đúng p_max sau remap ~ 0.564, và shadow cuối = max(0, 0.564) = 0.564 (~56% sáng)",
        en: "Correctly computed the remapped p_max ~ 0.564, and the final shadow = max(0, 0.564) = 0.564 (~56% lit)",
      },
      {
        vi: "Giải thích được: hard_shadow nói 'trong bóng hoàn toàn' nhưng VSM trả về ~56% sáng — vì Chebyshev chỉ cho một CHẶN TRÊN xác suất, không phải câu trả lời chính xác, nên khi phương sai lớn (nhiều occluder khác nhau trong cùng texel) kết quả có thể lệch xa khỏi nhị phân",
        en: "Explains that hard_shadow says 'fully in shadow' but VSM returns ~56% lit — because Chebyshev only gives an UPPER BOUND on probability, not an exact answer, so when variance is large (multiple different occluders in the same texel) the result can drift far from the binary answer",
      },
    ],
    solutionNote: {
      vi: `$\\sigma^2 = \\text{meanSquare} - \\mu^2 = 0.27 - 0.5^2 = 0.27 - 0.25 = 0.02$. $d = z - \\mu = 0.6 - 0.5 = 0.1 \\Rightarrow d^2 = 0.01$. $p_{max} = \\dfrac{\\sigma^2}{\\sigma^2 + d^2} = \\dfrac{0.02}{0.02 + 0.01} = 0.02/0.03 \\approx 0.6667$.

Remap: $\\text{clamp}((p_{max} - 0.3)/0.65, 0, 1) = \\text{clamp}((0.6667 - 0.3)/0.65, 0, 1) = \\text{clamp}(0.3667/0.65, 0, 1) \\approx 0.5641$.

$\\text{hard\\_shadow} = (z \\le \\mu)\\ ?\\ 1 : 0 \\Rightarrow 0.6 \\le 0.5$ là sai $\\Rightarrow \\text{hard\\_shadow} = 0$. Kết quả cuối, lấy giá trị $p_{max}$ đã remap ở trên: $\\max(\\text{hard\\_shadow}, 0.5641) = \\max(0, 0.5641) = 0.5641$.

Phép so sánh nhị phân nói "trong bóng hoàn toàn" (0), còn VSM nói "~56% sáng" — hai kết quả KHÔNG khớp nhau. Chebyshev chỉ cho một CHẶN TRÊN xác suất từ đúng hai moment (mean, variance), không phải câu trả lời chính xác — khi phân bố độ sâu trong một texel trộn lẫn nhiều độ sâu rất khác nhau (ví dụ hai occluder ở khoảng cách khác nhau), phương sai tăng vọt và chặn trên nới lỏng ra, để một phần ánh sáng "rò rỉ" qua đúng theo cách này. Sự rò rỉ đó CHÍNH LÀ light bleeding: một hệ quả thống kê của việc nén một phân bố độ sâu thành hai con số, không phải lỗi ở phép so sánh.`,
      en: `$\\sigma^2 = \\text{meanSquare} - \\mu^2 = 0.27 - 0.5^2 = 0.27 - 0.25 = 0.02$. $d = z - \\mu = 0.6 - 0.5 = 0.1 \\Rightarrow d^2 = 0.01$. $p_{max} = \\dfrac{\\sigma^2}{\\sigma^2 + d^2} = \\dfrac{0.02}{0.02 + 0.01} = 0.02/0.03 \\approx 0.6667$.

Remap: $\\text{clamp}((p_{max} - 0.3)/0.65, 0, 1) = \\text{clamp}((0.6667 - 0.3)/0.65, 0, 1) = \\text{clamp}(0.3667/0.65, 0, 1) \\approx 0.5641$.

$\\text{hard\\_shadow} = (z \\le \\mu)\\ ?\\ 1 : 0 \\Rightarrow 0.6 \\le 0.5$ is false $\\Rightarrow \\text{hard\\_shadow} = 0$. Final shadow $= \\max(\\text{hard\\_shadow}, p_{max}\\text{ remapped}) = \\max(0, 0.5641) = 0.5641$.

The hard test says "fully in shadow" (0), but VSM says "~56% lit" — the two do NOT agree. Chebyshev only gives an UPPER BOUND on lit-probability from just two moments (mean, variance), not an exact answer — when a texel's depth distribution mixes very different depths (e.g. two occluders at different distances), variance inflates and the bound loosens, letting partial light "leak" through in exactly this way. That leak IS light bleeding: a statistical side effect of compressing a depth distribution into two numbers, not a bug in the comparison itself.`,
    },
  },
  {
    id: "texel-footprint-and-mapsize",
    kind: "code",
    prompt: {
      vi: `Viết hai hàm TypeScript: \`estimateTexelFootprint(frustumWidth, mapSize)\` trả về kích thước thế giới thực (world units) của MỘT texel shadow map, theo đúng công thức \`frustumWidth / mapSize\` ở phần "ba căn bệnh"; và \`recommendedMapSize(frustumWidth, targetTexelSize)\` trả về \`mapSize\` nhỏ nhất là luỹ thừa của 2 sao cho texel footprint không vượt quá \`targetTexelSize\`.`,
      en: `Write two TypeScript functions: \`estimateTexelFootprint(frustumWidth, mapSize)\`, returning the real-world size (world units) of ONE shadow-map texel using the exact \`frustumWidth / mapSize\` formula from the "three diseases" section; and \`recommendedMapSize(frustumWidth, targetTexelSize)\`, returning the smallest power-of-two \`mapSize\` that keeps the texel footprint at or below \`targetTexelSize\`.`,
    },
    starterCode: `function estimateTexelFootprint(frustumWidth: number, mapSize: number): number {
  // TODO: one texel's real-world size = frustumWidth / mapSize
  return 0;
}

function recommendedMapSize(frustumWidth: number, targetTexelSize: number): number {
  // TODO: find the smallest power-of-two mapSize where
  // estimateTexelFootprint(frustumWidth, mapSize) <= targetTexelSize
  return 0;
}

// Expect: a 20-unit-wide frustum with a 2cm (0.02) target texel needs mapSize 1024
console.log(recommendedMapSize(20, 0.02));`,
    solutionCode: `function estimateTexelFootprint(frustumWidth: number, mapSize: number): number {
  return frustumWidth / mapSize;
}

function recommendedMapSize(frustumWidth: number, targetTexelSize: number): number {
  const rawSize = frustumWidth / targetTexelSize;
  return Math.pow(2, Math.ceil(Math.log2(rawSize)));
}

// recommendedMapSize(20, 0.02): rawSize = 20/0.02 = 1000 -> next power of two = 1024
console.log(recommendedMapSize(20, 0.02));`,
    hints: [
      {
        vi: "estimateTexelFootprint chỉ là một phép chia — không có bẫy nào, chỉ cần đúng thứ tự tham số.",
        en: "estimateTexelFootprint is just a division — no trap, just get the parameter order right.",
      },
      {
        vi: "recommendedMapSize: tính rawSize = frustumWidth/targetTexelSize trước, rồi dùng Math.ceil(Math.log2(rawSize)) để tìm SỐ MŨ của luỹ thừa 2 gần nhất KHÔNG NHỎ HƠN rawSize, cuối cùng Math.pow(2, đó).",
        en: "recommendedMapSize: compute rawSize = frustumWidth/targetTexelSize first, then use Math.ceil(Math.log2(rawSize)) to find the EXPONENT of the nearest power of two that is NOT SMALLER than rawSize, finally Math.pow(2, that).",
      },
    ],
    checklist: [
      {
        vi: "estimateTexelFootprint(20, 1024) trả về đúng 20/1024 ~ 0.0195",
        en: "estimateTexelFootprint(20, 1024) returns exactly 20/1024 ~ 0.0195",
      },
      {
        vi: "recommendedMapSize(20, 0.02) trả về 1024, không phải 1000 hay 512",
        en: "recommendedMapSize(20, 0.02) returns 1024, not 1000 or 512",
      },
      {
        vi: "Kết quả recommendedMapSize luôn là luỹ thừa của 2 (khớp yêu cầu mapSize thực tế của three.js)",
        en: "recommendedMapSize's result is always a power of two (matching three.js's real mapSize requirement)",
      },
    ],
  },
];
