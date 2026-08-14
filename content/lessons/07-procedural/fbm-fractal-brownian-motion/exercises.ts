import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "fbm-normalization-and-pixel-cutoff",
    kind: "concept",
    prompt: {
      vi: `Với $N = 4$ octave và gain $g = 0.5$: tính biên độ tối đa $\\sum_{i=0}^{3} g^i = \\frac{1-g^4}{1-g}$ bằng tay. Nếu tổng thô (chưa chuẩn hoá) tại một điểm là $0.9$, giá trị FBM đã chuẩn hoá là bao nhiêu?

Sau đó: một material có kích thước đặc trưng gốc (octave 0) là $8$ đơn vị world-space, phủ lên một texture $256\\text{px}$ (vậy 1 pixel $\\approx 8/256$ đơn vị). Với lacunarity $l=2$, chu kỳ octave $i$ là $8/2^i$. Tìm chỉ số octave $i$ nhỏ nhất (đếm từ 0) mà chu kỳ của nó rơi XUỐNG DƯỚI kích thước 1 pixel — từ octave đó trở đi, thêm octave còn có ích gì về mặt thị giác không?`,
      en: `With $N = 4$ octaves and gain $g = 0.5$: compute the max amplitude $\\sum_{i=0}^{3} g^i = \\frac{1-g^4}{1-g}$ by hand. If the raw (un-normalized) sum at some point is $0.9$, what is the normalized FBM value?

Then: a material has a base characteristic size (octave 0) of $8$ world-space units, mapped onto a $256\\text{px}$ texture (so 1 pixel $\\approx 8/256$ units). With lacunarity $l=2$, octave $i$'s period is $8/2^i$. Find the smallest octave index $i$ (0-indexed) whose period drops BELOW one pixel's size — from that octave on, does adding more octaves still help visually?`,
    },
    hints: [
      {
        vi: "$\\frac{1-0.5^4}{1-0.5} = \\frac{1-0.0625}{0.5} = \\frac{0.9375}{0.5}$ — chia thẳng ra một số, đó chính là mẫu số của bước chuẩn hoá.",
        en: "$\\frac{1-0.5^4}{1-0.5} = \\frac{1-0.0625}{0.5} = \\frac{0.9375}{0.5}$ — divide straight through to a number, that's exactly the normalization step's denominator.",
      },
      {
        vi: "$8/256 = 0.03125$ đơn vị/pixel. Giải $8/2^i < 0.03125 \\iff 2^i > 256 = 2^8 \\iff i > 8$ — chú ý $i=8$ cho đúng $0.03125$, tức là biên giới hạn, chưa hẳn đã lãng phí.",
        en: "$8/256 = 0.03125$ units/pixel. Solve $8/2^i < 0.03125 \\iff 2^i > 256 = 2^8 \\iff i > 8$ — note $i=8$ gives exactly $0.03125$, the boundary case, not yet clearly wasted.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng biên độ tối đa $= 1.875$ và giá trị chuẩn hoá $0.9 / 1.875 = 0.48$",
        en: "I correctly computed the max amplitude $= 1.875$ and the normalized value $0.9 / 1.875 = 0.48$",
      },
      {
        vi: "Tôi tính đúng kích thước 1 pixel $\\approx 0.03125$ đơn vị và octave đầu tiên có chu kỳ dưới ngưỡng đó là $i=9$ (chu kỳ $0.015625$)",
        en: "I correctly computed 1 pixel $\\approx 0.03125$ units and identified $i=9$ (period $0.015625$) as the first octave below that threshold",
      },
      {
        vi: "Tôi giải thích được từ octave $i=9$ trở đi, thêm octave chỉ tốn thêm phép tính, không thêm chi tiết nhìn thấy được (dưới giới hạn Nyquist của độ phân giải)",
        en: "I can explain that from octave $i=9$ onward, adding more octaves only costs extra computation, adding no visible detail (below the resolution's Nyquist limit)",
      },
    ],
    solutionCode: `// max amplitude (N=4, g=0.5): sum = (1 - 0.5^4) / (1 - 0.5)
//   = (1 - 0.0625) / 0.5 = 0.9375 / 0.5 = 1.875
// normalized fbm = raw / maxAmplitude = 0.9 / 1.875 = 0.48
//
// pixel size = 8 / 256 = 0.03125 world units
// period(i) = 8 / 2^i
//   i=8: 8/256   = 0.03125   -> exactly 1 pixel (boundary, still borderline useful)
//   i=9: 8/512   = 0.015625  -> half a pixel -> BELOW the display's resolvable size
// From i=9 on, each extra octave only adds compute cost and unresolvable
// high-frequency noise (aliasing risk under motion), no visible detail gain.`,
  },
  {
    id: "complete-fbm-loop-and-ridged",
    kind: "shader",
    prompt: {
      vi: `Trong playground (uResolution, fragColor có sẵn), starter code đã có \`hash21\`/\`noise\` hoàn chỉnh và khung \`fbm()\` với hằng số \`OCTAVES = 6\` và cờ \`RIDGED\`. Hoàn thành ba phần còn thiếu: (1) áp biến thể ridged khi \`RIDGED > 0.5\`, (2) cập nhật \`amplitude\`/\`frequency\` theo gain $0.5$ và lacunarity $2.0$ mỗi octave, (3) chuẩn hoá \`sum\` bằng \`maxAmplitude\` trước khi trả về.`,
      en: `In the playground (uResolution, fragColor are available), the starter code already has a complete \`hash21\`/\`noise\` and an \`fbm()\` skeleton with an \`OCTAVES = 6\` constant and a \`RIDGED\` flag. Complete the three missing pieces: (1) apply the ridged variant when \`RIDGED > 0.5\`, (2) update \`amplitude\`/\`frequency\` by gain $0.5$ and lacunarity $2.0$ each octave, (3) normalize \`sum\` by \`maxAmplitude\` before returning.`,
    },
    starterCode: `float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) * 2.0 - 1.0; // remap to [-1,1]
}

const int OCTAVES = 6;
const float RIDGED = 1.0; // 0 = standard fbm, 1 = ridged

float fbm(vec2 p) {
  float sum = 0.0;
  float amplitude = 1.0;
  float frequency = 1.0;
  float maxAmplitude = 0.0;

  for (int i = 0; i < OCTAVES; i++) {
    float n = noise(p * frequency);
    // TODO 1: neu RIDGED > 0.5, doi n thanh 1.0 - abs(n); nguoc lai giu nguyen n

    sum += amplitude * n;
    maxAmplitude += amplitude;

    // TODO 2: cap nhat amplitude *= gain (0.5) va frequency *= lacunarity (2.0)
  }

  // TODO 3: chia sum cho maxAmplitude de chuan hoa, roi return
  return sum;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float n = fbm(uv * 4.0);
  float v = n * 0.5 + 0.5;
  fragColor = vec4(vec3(v), 1.0);
}`,
    solutionCode: `float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) * 2.0 - 1.0;
}

const int OCTAVES = 6;
const float RIDGED = 1.0;

float fbm(vec2 p) {
  float sum = 0.0;
  float amplitude = 1.0;
  float frequency = 1.0;
  float maxAmplitude = 0.0;

  for (int i = 0; i < OCTAVES; i++) {
    float n = noise(p * frequency);
    if (RIDGED > 0.5) {
      n = 1.0 - abs(n);
    }

    sum += amplitude * n;
    maxAmplitude += amplitude;

    amplitude *= 0.5;
    frequency *= 2.0;
  }

  return sum / maxAmplitude;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float n = fbm(uv * 4.0);
  float v = n * 0.5 + 0.5;
  fragColor = vec4(vec3(v), 1.0);
}`,
    hints: [
      {
        vi: "Nhánh RIDGED chỉ đổi \`n\` TRƯỚC khi cộng vào \`sum\` — phần cập nhật \`amplitude\`/\`frequency\` giữ nguyên bất kể biến thể nào, chỉ một dòng \`if\` ở đầu vòng lặp thay đổi cả hình dạng kết quả.",
        en: "The RIDGED branch only changes \`n\` BEFORE it's added to \`sum\` — the \`amplitude\`/\`frequency\` update stays identical regardless of variant, just one \`if\` line at the top of the loop reshapes the entire result.",
      },
      {
        vi: "Thiếu bước chia cho \`maxAmplitude\` vẫn biên dịch và chạy được — nhưng đổi \`OCTAVES\` sẽ làm độ sáng trung bình đổi hẳn dù hình dạng chi tiết không đổi, đúng lỗi callout của bài lý thuyết cảnh báo.",
        en: "Skipping the division by \`maxAmplitude\` still compiles and runs — but changing \`OCTAVES\` will noticeably shift the average brightness even though the detail shape barely changed, exactly the mistake the theory lesson's callout warns about.",
      },
    ],
    checklist: [
      {
        vi: "Với RIDGED = 1.0, ảnh hiện các gờ sáng sắc nét tại vùng noise gốc đổi dấu, không phải gò đồi mềm như bản standard",
        en: "With RIDGED = 1.0, the image shows sharp bright ridges where the raw noise crosses zero, not the soft rolling-hills look of standard FBM",
      },
      {
        vi: "Đổi OCTAVES từ 6 xuống 2 hay lên 8 không làm độ sáng trung bình của ảnh đổi rõ rệt (chuẩn hoá đúng)",
        en: "Changing OCTAVES from 6 down to 2 or up to 8 doesn't noticeably shift the image's average brightness (normalization is correct)",
      },
      {
        vi: "Không có lỗi biên dịch; ảnh grayscale hiện rõ chi tiết nhiều tầng hơn hẳn một octave đơn",
        en: "No compile errors; the grayscale image clearly shows more multi-scale detail than a single octave would",
      },
    ],
  },
];
