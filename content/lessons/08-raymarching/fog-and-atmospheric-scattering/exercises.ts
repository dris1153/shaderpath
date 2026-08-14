import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "fog-density-from-visibility",
    kind: "concept",
    prompt: {
      vi: `Một cảnh raymarch dùng exponential fog với mật độ $\\rho = 0.08$ (đơn vị: nghịch đảo đơn vị cảnh). Không chạy code, tính transmittance $T(t) = e^{-\\rho t}$ tại $t = 10$ và $t = 30$.

Sau đó: muốn có khoảng cách tầm nhìn $d_{vis} = 50$ (tại đó $T \\approx 0.05$, quy ước "gần như khuất") thay vì mật độ hiện tại, $\\rho$ cần đổi thành bao nhiêu?`,
      en: `A raymarched scene uses exponential fog with density $\\rho = 0.08$ (units: inverse scene units). Without running code, compute the transmittance $T(t) = e^{-\\rho t}$ at $t = 10$ and $t = 30$.

Then: to get a visibility distance $d_{vis} = 50$ (where $T \\approx 0.05$, the "practically invisible" convention) instead of the current density, what should $\\rho$ become?`,
    },
    hints: [
      {
        vi: "$T(10) = e^{-0.8}$, $T(30) = e^{-2.4}$ — dùng $e^{-1} \\approx 0.368$ làm mốc quen để ước lượng, hoặc tính trực tiếp.",
        en: "$T(10) = e^{-0.8}$, $T(30) = e^{-2.4}$ — anchor on a familiar value like $e^{-1} \\approx 0.368$ to reason from, or compute directly.",
      },
      {
        vi: "Lấy log tự nhiên hai vế của $T = e^{-\\rho d_{vis}}$: $\\rho = -\\ln(T)/d_{vis}$. Với $T = 0.05$, $-\\ln(0.05) \\approx 3.0$.",
        en: "Take the natural log of both sides of $T = e^{-\\rho d_{vis}}$: $\\rho = -\\ln(T)/d_{vis}$. With $T = 0.05$, $-\\ln(0.05) \\approx 3.0$.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng $T(10) \\approx 0.449$ và $T(30) \\approx 0.0907$",
        en: "I correctly computed $T(10) \\approx 0.449$ and $T(30) \\approx 0.0907$",
      },
      {
        vi: "Tôi suy ra $\\rho \\approx 0.06$ cho $d_{vis} = 50$",
        en: "I derived $\\rho \\approx 0.06$ for $d_{vis} = 50$",
      },
      {
        vi: "Tôi giải thích được vì sao công thức là $\\rho = -\\ln(T)/d_{vis}$, không phải $\\rho = T/d_{vis}$",
        en: "I can explain why the formula is $\\rho = -\\ln(T)/d_{vis}$, not $\\rho = T/d_{vis}$",
      },
    ],
    solutionNote: {
      vi: `$T(10) = e^{-0.08 \\times 10} = e^{-0.8} \\approx 0.449$. $T(30) = e^{-0.08 \\times 30} = e^{-2.4} \\approx 0.0907$.

Từ $T = e^{-\\rho \\cdot d_{vis}}$, lấy $\\ln$ hai vế: $\\ln(T) = -\\rho \\cdot d_{vis} \\Rightarrow \\rho = -\\ln(T) / d_{vis}$.

$\\rho = -\\ln(0.05) / 50 \\approx 2.996 / 50 \\approx 0.06$.`,
      en: `$T(10) = e^{-0.08 \\times 10} = e^{-0.8} \\approx 0.449$. $T(30) = e^{-0.08 \\times 30} = e^{-2.4} \\approx 0.0907$.

From $T = e^{-\\rho \\cdot d_{vis}}$, taking the natural log of both sides: $\\ln(T) = -\\rho \\cdot d_{vis} \\Rightarrow \\rho = -\\ln(T) / d_{vis}$.

$\\rho = -\\ln(0.05) / 50 \\approx 2.996 / 50 \\approx 0.06$.`,
    },
  },
  {
    id: "playground-column-fog",
    kind: "shader",
    prompt: {
      vi: `Trong playground, mỗi cột trong 10 cột theo chiều ngang đã có sẵn một khoảng cách march giả lập \`t\` và một màu bề mặt \`sceneColor\`. Hãy cài đặt transmittance Beer-Lambert $T = e^{-\\rho t}$ (biến \`density\` trong code chính là $\\rho$) rồi trộn \`sceneColor\` về phía \`fogColor\` theo $1 - T$. Kết quả đúng: cột có \`t\` lớn (xa) gần như chìm hẳn vào màu fog dù nằm ở vị trí x bất kỳ trên màn hình — vì fog phụ thuộc t, không phụ thuộc vị trí màn hình.`,
      en: `In the playground, each of 10 vertical columns already has a fake marched distance \`t\` and a surface color \`sceneColor\` assigned. Implement the Beer-Lambert transmittance $T = e^{-\\rho t}$ (the \`density\` variable in the code is $\\rho$) and blend \`sceneColor\` toward \`fogColor\` by $1 - T$. Correct result: columns with a large \`t\` (far) sink almost entirely into the fog color regardless of their screen-x position — because fog depends on t, not screen position.`,
    },
    starterCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float col = floor(uv.x * 10.0);
  float t = mix(3.0, 28.0, fract(sin(col * 12.9898) * 43758.5453));
  float barTop = 1.0 - (0.15 + 0.35 * fract(sin(col * 45.164) * 12345.678));
  vec3 sceneColor = uv.y > barTop
    ? vec3(0.15, 0.16, 0.22)
    : mix(vec3(0.55, 0.42, 0.3), vec3(0.7, 0.68, 0.62), fract(uv.x * 10.0));
  vec3 fogColor = vec3(0.75, 0.8, 0.85);
  float density = 0.06;

  // TODO 1: Beer-Lambert transmittance T = exp(-density * t)
  float T = 1.0;

  // TODO 2: blend sceneColor toward fogColor by (1 - T)
  vec3 color = sceneColor;

  fragColor = vec4(color, 1.0);
}`,
    solutionCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float col = floor(uv.x * 10.0);
  float t = mix(3.0, 28.0, fract(sin(col * 12.9898) * 43758.5453));
  float barTop = 1.0 - (0.15 + 0.35 * fract(sin(col * 45.164) * 12345.678));
  vec3 sceneColor = uv.y > barTop
    ? vec3(0.15, 0.16, 0.22)
    : mix(vec3(0.55, 0.42, 0.3), vec3(0.7, 0.68, 0.62), fract(uv.x * 10.0));
  vec3 fogColor = vec3(0.75, 0.8, 0.85);
  float density = 0.06;

  float T = exp(-density * t);

  vec3 color = mix(sceneColor, fogColor, 1.0 - T);

  fragColor = vec4(color, 1.0);
}`,
    hints: [
      {
        vi: "`t` đã có sẵn cho từng cột (biến giả lập khoảng cách march) — chỉ cần đưa thẳng vào `exp(-density * t)`, không cần tính lại.",
        en: "`t` is already provided per column (a stand-in for the marched distance) — just plug it straight into `exp(-density * t)`, no need to recompute it.",
      },
      {
        vi: "`mix(a, b, x)` trả về `a` khi `x = 0` và `b` khi `x = 1` — muốn trộn VỀ PHÍA fog theo `1 - T` thì `a = sceneColor`, `b = fogColor`, `x = 1.0 - T`.",
        en: "`mix(a, b, x)` returns `a` at `x = 0` and `b` at `x = 1` — to blend TOWARD fog by `1 - T`, use `a = sceneColor`, `b = fogColor`, `x = 1.0 - T`.",
      },
    ],
    checklist: [
      {
        vi: "Cột có t nhỏ (gần) gần như giữ nguyên màu bề mặt gốc",
        en: "Columns with small t (near) stay close to their original surface color",
      },
      {
        vi: "Cột có t lớn (xa) gần như chìm hẳn vào fogColor, bất kể vị trí x trên màn hình",
        en: "Columns with large t (far) sink almost entirely into fogColor, regardless of their x position on screen",
      },
      {
        vi: "Không có cột nào bị fog tăng dần rồi giảm lại — T giảm đơn điệu theo t",
        en: "No column shows fog increasing then decreasing — T decreases monotonically with t",
      },
    ],
  },
];
