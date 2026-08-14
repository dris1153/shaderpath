import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "fade-function-derivatives",
    kind: "concept",
    prompt: {
      vi: `Ba hàm fade: tuyến tính $f(t) = t$, smoothstep $f(t) = 3t^2 - 2t^3$, và quintic $f(t) = 6t^5 - 15t^4 + 10t^3$. Không chạy code, tính $f(0.5)$ cho cả ba hàm, rồi tính đạo hàm $f'(0)$ của cả ba (đạo hàm smoothstep là $6t(1-t)$, đạo hàm quintic là $30t^2(t-1)^2$).

Sau đó giải thích: vì sao $f(0.5)$ giống hệt nhau ở cả ba hàm nhưng $f'(0)$ thì không, và chính $f'(0)$ khác 0 hay bằng 0 mới là thứ quyết định value noise có hiện vết hình thoi ở biên ô lưới hay không.`,
      en: `Three fade functions: linear $f(t) = t$, smoothstep $f(t) = 3t^2 - 2t^3$, and quintic $f(t) = 6t^5 - 15t^4 + 10t^3$. Without running code, compute $f(0.5)$ for all three, then compute the derivative $f'(0)$ for all three (smoothstep's derivative is $6t(1-t)$, quintic's is $30t^2(t-1)^2$).

Then explain: why $f(0.5)$ comes out identical across all three functions but $f'(0)$ doesn't, and why it's specifically whether $f'(0)$ is zero or nonzero that determines whether value noise shows a diamond artifact at cell boundaries.`,
    },
    hints: [
      {
        vi: "Cả ba hàm fade đều thoả $f(1-t) = 1 - f(t)$ (đối xứng qua điểm $t=0.5$) — thay $t=0.5$ trực tiếp vào từng công thức để thấy vì sao cả ba ra cùng một số.",
        en: "All three fade functions satisfy $f(1-t) = 1 - f(t)$ (symmetric around $t=0.5$) — substitute $t=0.5$ directly into each formula to see why they all give the same number.",
      },
      {
        vi: "Với đạo hàm, thay $t=0$ trực tiếp: $f'(t)=1$ với hàm tuyến tính không phụ thuộc $t$ nên luôn bằng 1; $6t(1-t)$ và $30t^2(t-1)^2$ đều có thừa số $t$ nên triệt tiêu tại $t=0$.",
        en: "For the derivatives, substitute $t=0$ directly: the linear fade's $f'(t)=1$ doesn't depend on $t$ so it's always 1; both $6t(1-t)$ and $30t^2(t-1)^2$ have a factor of $t$, so they vanish at $t=0$.",
      },
    ],
    checklist: [
      {
        vi: "Tính đúng $f(0.5) = 0.5$ cho cả ba hàm (đối xứng quanh điểm giữa ô)",
        en: "Correctly computed $f(0.5) = 0.5$ for all three (symmetric around the cell midpoint)",
      },
      {
        vi: "Tính đúng $f'(0) = 1$ (tuyến tính), $f'(0) = 0$ (smoothstep), $f'(0) = 0$ (quintic)",
        en: "Correctly computed $f'(0) = 1$ (linear), $f'(0) = 0$ (smoothstep), $f'(0) = 0$ (quintic)",
      },
      {
        vi: "Giải thích được: $f'(0) \\neq 0$ làm đạo hàm của noise phụ thuộc vào tốc độ đổi của fade, khác nhau giữa hai ô liền kề; $f'(0) = 0$ xoá phụ thuộc đó, hai ô khớp đạo hàm tại biên",
        en: "Explained that $f'(0) \\neq 0$ makes the noise's derivative depend on the fade's own rate of change, which differs between adjacent cells; $f'(0) = 0$ removes that dependency, so adjacent cells match derivatives at the boundary",
      },
    ],
    solutionNote: {
      vi: `$f(0.5)$ bằng $0.5$ ở cả ba hàm vì chúng đối xứng qua $t=0.5$: tuyến tính $f(0.5)=0.5$; smoothstep $f(0.5) = 3(0.25) - 2(0.125) = 0.75 - 0.25 = 0.5$; quintic $f(0.5) = 6(0.03125) - 15(0.0625) + 10(0.125) = 0.1875 - 0.9375 + 1.25 = 0.5$.

$f'(0)$: tuyến tính $f'(t) = 1 \\Rightarrow f'(0) = 1$ (khác 0!); smoothstep $f'(t) = 6t(1-t) \\Rightarrow f'(0) = 0$; quintic $f'(t) = 30t^2(t-1)^2 \\Rightarrow f'(0) = 0$.

$f'(0) \\neq 0$ (tuyến tính) nghĩa là độ dốc của $n(p)$ tại biên ô phụ thuộc vào chính "tốc độ nội suy" tại $t=0$ — hai ô liền kề có 4 góc khác nhau nên tốc độ đó (và giá trị dốc kết quả) khác nhau, gây gián đoạn đạo hàm. $f'(0) = 0$ xoá hẳn thành phần đó khỏi công thức đạo hàm tại biên, chỉ còn phụ thuộc các giá trị góc mà hai ô liền kề chia sẻ chung.`,
      en: `$f(0.5)$ equals $0.5$ for all three because they're symmetric around $t=0.5$: linear $f(0.5)=0.5$; smoothstep $f(0.5) = 3(0.25) - 2(0.125) = 0.75 - 0.25 = 0.5$; quintic $f(0.5) = 6(0.03125) - 15(0.0625) + 10(0.125) = 0.1875 - 0.9375 + 1.25 = 0.5$.

$f'(0)$: linear $f'(t) = 1 \\Rightarrow f'(0) = 1$ (nonzero!); smoothstep $f'(t) = 6t(1-t) \\Rightarrow f'(0) = 0$; quintic $f'(t) = 30t^2(t-1)^2 \\Rightarrow f'(0) = 0$.

$f'(0) \\neq 0$ (linear) means the slope of $n(p)$ at the cell boundary depends on the "interpolation rate" itself at $t=0$ — two adjacent cells have 4 different corner values, so that rate (and the resulting slope) differs between them, causing a derivative discontinuity. $f'(0) = 0$ removes that term entirely from the boundary derivative formula, leaving only the corner values the two adjacent cells share in common.`,
    },
  },
  {
    id: "fade-toggle-in-playground",
    kind: "shader",
    prompt: {
      vi: `Trong playground (uTime, uResolution, uMouse, fragColor có sẵn), hàm \`hash21\` đã cho sẵn. Dựng value noise với lưới bước 8 đơn vị (\`p = uv * 8.0\`), và dùng \`uMouse.x\` để chuyển đổi giữa fade tuyến tính (\`uMouse.x < 0.5\`) và fade quintic (\`uMouse.x >= 0.5\`) ngay trên cùng một trường noise.`,
      en: `In the playground (uTime, uResolution, uMouse, fragColor are all available), \`hash21\` is provided. Build value noise on an 8-unit grid (\`p = uv * 8.0\`), and use \`uMouse.x\` to toggle between a linear fade (\`uMouse.x < 0.5\`) and a quintic fade (\`uMouse.x >= 0.5\`) on the same noise field.`,
    },
    starterCode: `float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = uv * 8.0;
  vec2 i = floor(p);
  vec2 f = fract(p);

  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));

  // TODO: uMouse.x < 0.5 -> u = f (linear); uMouse.x >= 0.5 -> quintic fade
  vec2 u = f;

  float n = mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  fragColor = vec4(vec3(n), 1.0);
}`,
    solutionCode: `float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = uv * 8.0;
  vec2 i = floor(p);
  vec2 f = fract(p);

  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));

  vec2 u = uMouse.x < 0.5 ? f : f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

  float n = mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  fragColor = vec4(vec3(n), 1.0);
}`,
    hints: [
      {
        vi: "`u` chỉ đổi cách nội suy, không đổi 4 giá trị góc `a, b, c, d` — dùng toán tử ba ngôi trên toàn bộ `vec2 f` là đủ, không cần tách riêng từng thành phần.",
        en: "`u` only changes the interpolation, not the 4 corner values `a, b, c, d` — a ternary on the whole `vec2 f` is enough, no need to split components.",
      },
      {
        vi: "Công thức quintic áp dụng theo từng thành phần: `f * f * f * (f * (f * 6.0 - 15.0) + 10.0)` với `f` là `vec2` tự động broadcast phép toán trên cả `x` và `y`.",
        en: "The quintic formula applies component-wise: `f * f * f * (f * (f * 6.0 - 15.0) + 10.0)` with `f` as a `vec2` automatically broadcasts the operation across both `x` and `y`.",
      },
    ],
    checklist: [
      {
        vi: "Di chuột sang nửa trái màn hình thấy các vệt chéo/hình thoi rõ dọc mép mỗi ô lưới",
        en: "Moving the mouse to the left half shows clear diagonal/diamond creases along each cell edge",
      },
      {
        vi: "Di chuột sang nửa phải thấy noise mượt hẳn, vệt hình thoi biến mất dù 4 giá trị góc không đổi",
        en: "Moving the mouse to the right half shows the noise turn noticeably smoother, the diamond creases gone even though the 4 corner values didn't change",
      },
      {
        vi: "Công thức quintic viết đúng hệ số 6/15/10, không nhầm dấu hay thứ tự các số hạng",
        en: "The quintic formula uses the correct 6/15/10 coefficients, no sign or term-order mistakes",
      },
    ],
  },
];
