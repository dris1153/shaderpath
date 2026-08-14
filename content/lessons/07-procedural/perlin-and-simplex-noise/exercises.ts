import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "fade-curve-and-grid-cost-by-hand",
    kind: "concept",
    prompt: {
      vi: `Cho hai đường cong fade: $\\mathrm{fade}_{1985}(t) = 3t^2 - 2t^3$ (cubic, 1985) và $\\mathrm{fade}_{2002}(t) = 6t^5 - 15t^4 + 10t^3$ (quintic, 2002). Không chạy code, tính $\\mathrm{fade}_{1985}(0.25)$ và $\\mathrm{fade}_{2002}(0.25)$.

Sau đó tính đạo hàm bậc hai của mỗi hàm tại $t=0$ và $t=1$: $\\mathrm{fade}_{1985}''(t) = 6 - 12t$ và $\\mathrm{fade}_{2002}''(t) = 120t^3 - 180t^2 + 60t$. Đường cong nào $C^1$ liên tục nhưng không $C^2$, đường nào $C^2$?

Cuối cùng: một lần gọi noise 4D theo kiểu Perlin cần lấy mẫu $2^4$ góc lưới; kiểu Simplex chỉ cần $n+1$ góc. Tính cả hai con số ở 4 chiều và tỉ lệ giữa chúng.`,
      en: `Given two fade curves: $\\mathrm{fade}_{1985}(t) = 3t^2 - 2t^3$ (cubic, 1985) and $\\mathrm{fade}_{2002}(t) = 6t^5 - 15t^4 + 10t^3$ (quintic, 2002). Without running code, compute $\\mathrm{fade}_{1985}(0.25)$ and $\\mathrm{fade}_{2002}(0.25)$.

Then compute each function's second derivative at $t=0$ and $t=1$: $\\mathrm{fade}_{1985}''(t) = 6 - 12t$ and $\\mathrm{fade}_{2002}''(t) = 120t^3 - 180t^2 + 60t$. Which curve is $C^1$ continuous but not $C^2$, and which is $C^2$?

Finally: one Perlin-style 4D noise call samples $2^4$ grid corners; a Simplex-style call only needs $n+1$. Compute both counts at 4 dimensions and their ratio.`,
    },
    hints: [
      {
        vi: "Với $t=0.25$: $t^2=0.0625$, $t^3=0.015625$, $t^4=0.00390625$, $t^5=0.0009765625$ — thay trực tiếp vào từng công thức, đừng làm tròn quá sớm.",
        en: "For $t=0.25$: $t^2=0.0625$, $t^3=0.015625$, $t^4=0.00390625$, $t^5=0.0009765625$ — substitute directly into each formula, don't round too early.",
      },
      {
        vi: "Đạo hàm bậc hai khác 0 tại biên nghĩa là ĐỘ CONG đổi đột ngột giữa hai ô lân cận — đó chính là artefact quintic được thiết kế để triệt tiêu, không phải giá trị hàm hay đạo hàm bậc nhất (cả hai đường cong đều bằng 0 ở đó).",
        en: "A nonzero second derivative at the boundary means CURVATURE changes abruptly between neighboring cells — that's exactly the artifact the quintic was designed to cancel, not the function value or first derivative (both curves are 0 there).",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng $\\mathrm{fade}_{1985}(0.25) = 0.15625$ và $\\mathrm{fade}_{2002}(0.25) \\approx 0.1035$",
        en: "I correctly computed $\\mathrm{fade}_{1985}(0.25) = 0.15625$ and $\\mathrm{fade}_{2002}(0.25) \\approx 0.1035$",
      },
      {
        vi: "Tôi xác định cubic có $\\mathrm{fade}''(0)=6$, $\\mathrm{fade}''(1)=-6$ (khác 0, chỉ $C^1$); quintic có $\\mathrm{fade}''(0)=\\mathrm{fade}''(1)=0$ (đúng $C^2$)",
        en: "I identified the cubic has $\\mathrm{fade}''(0)=6$, $\\mathrm{fade}''(1)=-6$ (nonzero, only $C^1$); the quintic has $\\mathrm{fade}''(0)=\\mathrm{fade}''(1)=0$ (truly $C^2$)",
      },
      {
        vi: "Tôi tính đúng $2^4=16$ góc kiểu Perlin so với $4+1=5$ góc kiểu Simplex ở 4D, tỉ lệ $16/5=3.2$ lần",
        en: "I correctly computed $2^4=16$ Perlin-style corners vs $4+1=5$ Simplex-style corners in 4D, a $16/5=3.2\\times$ ratio",
      },
    ],
    solutionCode: `// fade_1985(0.25) = 3(0.0625) - 2(0.015625) = 0.1875 - 0.03125 = 0.15625
// fade_2002(0.25) = 6(0.0009765625) - 15(0.00390625) + 10(0.015625)
//                  = 0.005859375 - 0.05859375 + 0.15625 ≈ 0.103516
//
// fade_1985''(t) = 6 - 12t  -> fade''(0) = 6, fade''(1) = -6   (khac 0 -> chi C1)
// fade_2002''(t) = 120t^3 - 180t^2 + 60t -> fade''(0) = 0, fade''(1) = 0  (C2)
//
// 4D grid corners (Perlin-style): 2^4 = 16
// 4D simplex vertices (n+1):      4+1 = 5
// ratio = 16 / 5 = 3.2x more corner evaluations for the square-grid approach`,
  },
  {
    id: "complete-perlin2d-corners",
    kind: "shader",
    prompt: {
      vi: `Trong playground (uResolution, fragColor có sẵn), starter code đã có \`hash21\`, \`perlinGradient\`, \`perlinFade\` hoàn chỉnh và hai dot product đầu ($a$, $b$) của \`perlin2D\`. Hoàn thành hai dot product còn lại ($c$ tại góc $(0,1)$, $d$ tại góc $(1,1)$), dùng \`perlinFade(f)\` (thay vì $f$ thô) làm trọng số nội suy, rồi chuẩn hoá kết quả về $[0,1]$ để hiển thị grayscale.`,
      en: `In the playground (uResolution, fragColor are available), the starter code already has a complete \`hash21\`, \`perlinGradient\`, \`perlinFade\`, and the first two dot products ($a$, $b$) of \`perlin2D\`. Complete the remaining two dot products ($c$ at corner $(0,1)$, $d$ at corner $(1,1)$), use \`perlinFade(f)\` (instead of raw $f$) as the interpolation weight, then normalize the result to $[0,1]$ for a grayscale display.`,
    },
    starterCode: `float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec2 perlinGradient(vec2 corner) {
  float angle = hash21(corner) * 6.28318530718;
  return vec2(cos(angle), sin(angle));
}

vec2 perlinFade(vec2 t) {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float perlin2D(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  float a = dot(perlinGradient(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0));
  float b = dot(perlinGradient(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  // TODO 1: dot product cho hai góc con lai (0,1) va (1,1)
  float c = 0.0;
  float d = 0.0;

  // TODO 2: dung perlinFade(f) lam trong so thay vi f tho
  vec2 u = f;

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float n = perlin2D(uv * 6.0);

  // TODO 3: chuan hoa n (khoang uoc luong [-0.7, 0.7]) ve [0, 1]
  float v = 0.0;

  fragColor = vec4(vec3(v), 1.0);
}`,
    solutionCode: `float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec2 perlinGradient(vec2 corner) {
  float angle = hash21(corner) * 6.28318530718;
  return vec2(cos(angle), sin(angle));
}

vec2 perlinFade(vec2 t) {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float perlin2D(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  float a = dot(perlinGradient(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0));
  float b = dot(perlinGradient(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(perlinGradient(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(perlinGradient(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));

  vec2 u = perlinFade(f);

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float n = perlin2D(uv * 6.0);

  float v = clamp(n * 0.5 + 0.5, 0.0, 1.0);

  fragColor = vec4(vec3(v), 1.0);
}`,
    hints: [
      {
        vi: "$c$ dùng góc $(0,1)$: \`dot(perlinGradient(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0))\`; $d$ dùng góc $(1,1)$ — cùng khuôn mẫu với $a$, $b$, chỉ đổi offset góc.",
        en: "$c$ uses corner $(0,1)$: \`dot(perlinGradient(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0))\`; $d$ uses corner $(1,1)$ — same pattern as $a$, $b$, just a different corner offset.",
      },
      {
        vi: "Bỏ qua \`perlinFade\` và dùng thẳng $f$ khiến biên ô hiện vệt caro rõ rệt — đúng lỗi callout của bài lý thuyết nói tới, dễ thấy nhất khi phóng to gần một cạnh ô.",
        en: "Skipping \`perlinFade\` and using raw $f$ makes cell boundaries show up as a visible checkerboard seam — exactly the mistake the theory lesson's callout warns about, most obvious when zoomed in near a cell edge.",
      },
    ],
    checklist: [
      {
        vi: "4 dot product đều dùng đúng offset góc tương ứng, không lặp lại offset của $a$/$b$",
        en: "All 4 dot products use their correct corresponding corner offset, none reusing $a$/$b$'s offset",
      },
      {
        vi: "Ảnh grayscale mượt liên tục, không còn vệt caro cứng tại biên ô lưới",
        en: "The grayscale image reads as smooth and continuous, with no hard checkerboard seam at cell boundaries",
      },
      {
        vi: "Giá trị hiển thị phủ đủ dải xám (không lệch hẳn về tối hoặc sáng do quên chuẩn hoá)",
        en: "The displayed values cover a full range of gray (not skewed dark or bright from a missing normalization step)",
      },
    ],
  },
];
