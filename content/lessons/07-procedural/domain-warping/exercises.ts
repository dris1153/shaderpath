import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "warp-layer-cost-accounting",
    kind: "concept",
    prompt: {
      vi: `Một \`fbm()\` dùng $N = 5$ octave — tức 5 lần gọi \`noise()\` mỗi lần gọi \`fbm()\`. Không chạy code, đếm tổng số lần gọi \`fbm()\` cho một domain warp **hai lớp** (dùng cả $q$ và $r$ như công thức trong bài): $q$ cần 2 lần gọi \`fbm()\`, $r$ cần 2 lần gọi \`fbm()\` nữa (dùng $p + strength \\cdot q$), và kết quả cuối $f$ cần 1 lần gọi \`fbm()\` (dùng $p + strength \\cdot r$).

Sau đó trả lời: nếu tăng octave count của \`fbm()\` từ $N=5$ lên $N=8$ để noise mượt hơn, tổng số lần gọi \`noise()\` mỗi pixel cho warp hai lớp này tăng từ bao nhiêu lên bao nhiêu?`,
      en: `An \`fbm()\` using $N = 5$ octaves costs 5 \`noise()\` calls per \`fbm()\` call. Without running code, count the total number of \`fbm()\` calls for a **two-layer** domain warp (using both $q$ and $r$ as in this lesson's formula): $q$ needs 2 \`fbm()\` calls, $r$ needs 2 more \`fbm()\` calls (using $p + strength \\cdot q$), and the final result $f$ needs 1 \`fbm()\` call (using $p + strength \\cdot r$).

Then answer: if the \`fbm()\` octave count goes from $N=5$ to $N=8$ for smoother noise, how does the total \`noise()\` call count per pixel for this two-layer warp change, from what to what?`,
    },
    hints: [
      {
        vi: "Đếm số lần gọi fbm() trước (một số cố định, không phụ thuộc octave), rồi nhân với octave count riêng — \"lớp warp\" và \"octave\" là hai đại lượng nhân với nhau, không cộng.",
        en: "Count the fbm() calls first (a fixed number, independent of octave count), then multiply by the octave count separately — \"warp layers\" and \"octaves\" multiply together, they don't add.",
      },
      {
        vi: "Mỗi lần gọi fbm() luôn gọi noise() đúng N lần, bất kể p truyền vào là gì — N chỉ phụ thuộc vào vòng lặp octave bên trong fbm().",
        en: "Every fbm() call invokes noise() exactly N times, regardless of the p passed in — N only depends on the octave loop inside fbm() itself.",
      },
    ],
    checklist: [
      {
        vi: "Tôi đếm đúng tổng số lần gọi fbm() cho warp 2 lớp là 5 (2 cho q, 2 cho r, 1 cho f)",
        en: "I correctly counted 5 total fbm() calls for a 2-layer warp (2 for q, 2 for r, 1 for f)",
      },
      {
        vi: "Tôi tính đúng tổng số lần gọi noise() ở N=5 là 5×5=25 lần mỗi pixel",
        en: "I correctly computed the noise() call count at N=5 as 5×5=25 per pixel",
      },
      {
        vi: "Tôi tính đúng ở N=8 là 5×8=40 lần, và giải thích được vì sao chi phí tăng theo TÍCH của số lớp warp và số octave, không phải tổng",
        en: "I correctly computed 5×8=40 calls at N=8, and can explain why cost scales with the PRODUCT of warp-layer count and octave count, not their sum",
      },
    ],
    solutionNote: {
      vi: `Tổng số lần gọi \`fbm()\` cho warp hai lớp là cố định, không phụ thuộc octave: $q$ cần 2 lần, $r$ cần 2 lần, $f$ cần 1 lần, tổng $2+2+1=5$ lần.

Mỗi lần gọi \`fbm()\` gọi \`noise()\` đúng $N$ lần, nên tổng số lần gọi \`noise()\` mỗi pixel là $5N$.

Với $N=5$: $5 \\times 5 = 25$ lần. Với $N=8$: $5 \\times 8 = 40$ lần.

Tăng từ 25 lên 40 (thêm 15 lần, tăng 60%) — chi phí warp nhân theo tích của số lớp warp và số octave, không phải tổng của chúng.`,
      en: `The total number of \`fbm()\` calls for a two-layer warp is fixed, independent of octave count: $q$ needs 2 calls, $r$ needs 2 calls, $f$ needs 1 call, totaling $2+2+1=5$.

Every \`fbm()\` call invokes \`noise()\` exactly $N$ times, so the total \`noise()\` calls per pixel is $5N$.

At $N=5$: $5 \\times 5 = 25$ calls. At $N=8$: $5 \\times 8 = 40$ calls.

Going from 25 to 40 (15 more calls, a 60% increase) — warp cost scales with the PRODUCT of warp-layer count and octave count, not their sum.`,
    },
  },
  {
    id: "implement-single-layer-warp",
    kind: "shader",
    prompt: {
      vi: `Trong playground (hash21, noise, fbm đã dựng sẵn; uTime, uResolution, uMouse, fragColor có sẵn), triển khai một domain warp **một lớp**: tính \`q = vec2(fbm(p + offsetA), fbm(p + offsetB))\` với \`offsetA\` và \`offsetB\` cách nhau ít nhất 3 đơn vị, rồi \`f = fbm(p + STRENGTH * q)\` với \`STRENGTH\` là hằng số đã khai báo sẵn. Tô màu bằng \`mix(colorA, colorB, f)\`.`,
      en: `In the playground (hash21, noise, fbm are already provided; uTime, uResolution, uMouse, fragColor are all available), implement a **single-layer** domain warp: compute \`q = vec2(fbm(p + offsetA), fbm(p + offsetB))\` with \`offsetA\` and \`offsetB\` at least 3 units apart, then \`f = fbm(p + STRENGTH * q)\` where \`STRENGTH\` is a pre-declared constant. Color the result with \`mix(colorA, colorB, f)\`.`,
    },
    starterCode: `float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 34.45);
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
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    sum += amp * noise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return sum;
}

const float STRENGTH = 2.5;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = uv * 3.0;

  // TODO 1: q = vec2(fbm(p + offsetA), fbm(p + offsetB))
  // offsetA and offsetB must be >= 3 units apart (e.g. (0.0,0.0) and (5.2,1.3))
  vec2 q = vec2(0.0);

  // TODO 2: f = fbm(p + STRENGTH * q) — multiply STRENGTH into q BEFORE adding to p
  float f = fbm(p);

  vec3 colorA = vec3(0.05, 0.08, 0.2);
  vec3 colorB = vec3(0.95, 0.55, 0.2);
  vec3 color = mix(colorA, colorB, f);

  fragColor = vec4(color, 1.0);
}`,
    solutionCode: `float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 34.45);
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
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    sum += amp * noise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return sum;
}

const float STRENGTH = 2.5;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = uv * 3.0;

  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.0)),
    fbm(p + vec2(5.2, 1.3))
  );

  float f = fbm(p + STRENGTH * q);

  vec3 colorA = vec3(0.05, 0.08, 0.2);
  vec3 colorB = vec3(0.95, 0.55, 0.2);
  vec3 color = mix(colorA, colorB, f);

  fragColor = vec4(color, 1.0);
}`,
    hints: [
      {
        vi: "offsetA = (0.0, 0.0), offsetB nên cách xa hẳn, ví dụ (5.2, 1.3) — chênh lệch đủ lớn để hai kênh của q không tương quan (xem phần \"vì sao offset phải khác nhau\" trong lý thuyết).",
        en: "offsetA = (0.0, 0.0), offsetB should sit well apart, e.g. (5.2, 1.3) — a large enough gap keeps q's two channels uncorrelated (see the \"why offsets must differ\" section in the theory).",
      },
      {
        vi: "STRENGTH nhân vào q TRƯỚC khi cộng vào p (\`p + STRENGTH * q\`), không nhân vào p hay vào kết quả fbm cuối — nhầm chỗ nhân khiến warp không còn co giãn đúng theo tham số.",
        en: "STRENGTH multiplies q BEFORE it's added to p (\`p + STRENGTH * q\`), not p itself or the final fbm result — multiplying in the wrong place breaks the parameter's scaling effect.",
      },
    ],
    checklist: [
      {
        vi: "q dùng hai offset khác nhau, cách nhau đủ lớn (không phải cùng một offset hay offset = 0 cho cả hai kênh)",
        en: "q uses two different offsets, far enough apart (not the same offset or offset = 0 for both channels)",
      },
      {
        vi: "f = fbm(p + STRENGTH * q) đúng thứ tự nhân-rồi-cộng, không phải fbm(p) * STRENGTH hay biến thể khác",
        en: "f = fbm(p + STRENGTH * q) with the correct multiply-then-add order, not fbm(p) * STRENGTH or any other variant",
      },
      {
        vi: "Hình hiển thị rõ các dải xoáy uốn lượn, khác hẳn fbm(p) chưa warp — thử đổi STRENGTH về 0.0 để so sánh trực tiếp",
        en: "The result visibly shows swirling warped bands, clearly different from unwarped fbm(p) — try setting STRENGTH to 0.0 to compare directly",
      },
    ],
  },
];
