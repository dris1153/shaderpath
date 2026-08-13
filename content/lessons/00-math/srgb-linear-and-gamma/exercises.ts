import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "srgb-vs-linear-blend-magenta-yellow",
    kind: "concept",
    prompt: {
      vi: `Hai màu thuần: hồng cánh sen magenta $(1, 0, 1)$ và vàng $(1, 1, 0)$ (giá trị sRGB, khoảng $0..1$). Không chạy code, hãy tính (a) trộn ngây thơ ngay trên giá trị sRGB tại $t = 0.5$, và (b) trộn đúng cách: giải mã về linear bằng xấp xỉ $\\text{srgb}^{2.2}$, lấy trung bình, rồi mã hoá lại bằng $\\text{linear}^{1/2.2}$.

Sau đó trả lời: vì sao kênh đỏ (R) giữ nguyên giá trị $1$ ở cả hai cách trộn, trong khi hai kênh còn lại khác nhau rõ rệt?`,
      en: `Two pure colors: magenta $(1, 0, 1)$ and yellow $(1, 1, 0)$ (sRGB values, in the $0..1$ range). Without running code, compute (a) the naive blend directly on the sRGB values at $t = 0.5$, and (b) the correct blend: decode to linear with the $\\text{srgb}^{2.2}$ shorthand, average, then encode back with $\\text{linear}^{1/2.2}$.

Then answer: why does the red (R) channel stay exactly $1$ under both blends, while the other two channels differ noticeably?`,
    },
    hints: [
      {
        vi: "Với luỹ thừa, 1 và 0 là điểm bất động: $1^k = 1$ và $0^k = 0$ với mọi $k > 0$ — kênh nào cả hai màu đều bằng 1 hoặc đều bằng 0 thì không đổi khi decode/encode.",
        en: "1 and 0 are fixed points of any power: $1^k = 1$ and $0^k = 0$ for any $k > 0$ — a channel where both colors are 1 or both are 0 stays the same after decode/encode.",
      },
      {
        vi: "Chỉ kênh nào hai màu KHÁC nhau (0 và 1) mới đổi: trung bình linear của $(0, 1)$ là $0.5$, mã hoá lại bằng $0.5^{1/2.2}$.",
        en: "Only the channel where the two colors DIFFER (0 and 1) changes: the linear average of $(0, 1)$ is $0.5$, re-encoded via $0.5^{1/2.2}$.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng trộn ngây thơ trong sRGB: $(1, 0.5, 0.5)$",
        en: "I correctly computed the naive sRGB blend: $(1, 0.5, 0.5)$",
      },
      {
        vi: "Tôi tính đúng trộn linear rồi encode lại: $(1, {\\approx}0.73, {\\approx}0.73)$",
        en: "I correctly computed the linear blend then re-encoded: $(1, {\\approx}0.73, {\\approx}0.73)$",
      },
      {
        vi: "Tôi giải thích được vì sao kênh R không đổi trong khi G, B sáng hơn ở bản trộn đúng",
        en: "I can explain why the R channel doesn't change while G and B are brighter in the correct blend",
      },
    ],
    solutionCode: `// Naive sRGB blend (SAI): mix từng kênh trực tiếp trên giá trị hiển thị
// R: mix(1,1,0.5) = 1
// G: mix(0,1,0.5) = 0.5
// B: mix(1,0,0.5) = 0.5
// -> (1, 0.5, 0.5): một màu hồng nhạt, xỉn
//
// Đúng cách: decode -> trung bình trong linear -> encode (xấp xỉ pow 2.2)
// R: 1^2.2=1, 1^2.2=1 -> avg 1 -> encode 1^(1/2.2) = 1 (không đổi: 0/1 là điểm bất động)
// G: 0^2.2=0, 1^2.2=1 -> avg 0.5 -> encode 0.5^(1/2.2) ~ 0.730
// B: 1^2.2=1, 0^2.2=0 -> avg 0.5 -> encode 0.5^(1/2.2) ~ 0.730
// -> (1, ~0.730, ~0.730): một màu hồng sáng, bão hoà hơn hẳn -
// đúng về vật lý vì ánh sáng cộng tuyến tính trong linear, không phải trên giá trị đã gamma-encode.`,
  },
  {
    id: "write-linear-blend-glsl",
    kind: "shader",
    prompt: {
      vi: `Viết hàm GLSL \`linearBlend(vec3 a, vec3 b, float t)\` trộn hai màu \`a\`, \`b\` (giá trị sRGB, \`0..1\`) đúng cách: decode về linear bằng xấp xỉ \`pow(x, 2.2)\`, trộn bằng \`mix\`, rồi encode lại bằng \`pow(x, 1.0 / 2.2)\`.

So với \`mix(a, b, t)\` ngây thơ, kết quả tại $t = 0.5$ phải sáng hơn rõ rệt khi \`a\`, \`b\` là hai màu đối lập bão hoà — đúng như phần lý thuyết vừa tính bằng số.`,
      en: `Write a GLSL function \`linearBlend(vec3 a, vec3 b, float t)\` that blends two colors \`a\`, \`b\` (sRGB values, \`0..1\`) correctly: decode to linear with \`pow(x, 2.2)\`, mix, then encode back with \`pow(x, 1.0 / 2.2)\`.

Compared to the naive \`mix(a, b, t)\`, the result at $t = 0.5$ must be noticeably brighter when \`a\`, \`b\` are two saturated, opposing colors — matching what the theory section just computed by hand.`,
    },
    starterCode: `vec3 linearBlend(vec3 a, vec3 b, float t) {
  // TODO 1: decode a, b về linear bằng pow(., 2.2)
  // TODO 2: mix trong linear
  // TODO 3: encode kết quả về sRGB bằng pow(., 1.0 / 2.2)
  return mix(a, b, t); // placeholder — đây chính là bản NGÂY THƠ cần sửa
}`,
    solutionCode: `vec3 linearBlend(vec3 a, vec3 b, float t) {
  vec3 aLinear = pow(a, vec3(2.2));
  vec3 bLinear = pow(b, vec3(2.2));
  vec3 blended = mix(aLinear, bLinear, t);
  return pow(blended, vec3(1.0 / 2.2));
}`,
    hints: [
      {
        vi: "pow() trong GLSL nhận cả số mũ dạng vec3 — dùng vec3(2.2) để áp cho cả 3 kênh cùng lúc.",
        en: "GLSL's pow() accepts a vec3 exponent too — use vec3(2.2) to apply it to all three channels at once.",
      },
      {
        vi: "Đừng mix() trước rồi mới pow() — thứ tự đúng là decode CẢ HAI màu trước, mix trong linear, encode SAU CÙNG.",
        en: "Don't mix() first and pow() after — the correct order is decode BOTH colors first, mix in linear, encode LAST.",
      },
    ],
    checklist: [
      {
        vi: "Hàm decode cả a và b bằng pow(., 2.2) trước khi mix",
        en: "The function decodes both a and b with pow(., 2.2) before mixing",
      },
      {
        vi: "mix() chạy trên giá trị đã decode (linear), không phải giá trị sRGB gốc",
        en: "mix() runs on the decoded (linear) values, not the original sRGB values",
      },
      {
        vi: "Kết quả cuối được encode lại bằng pow(., 1.0/2.2) đúng một lần",
        en: "The final result is encoded back with pow(., 1.0/2.2) exactly once",
      },
    ],
  },
];
