import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "builtin-functions-by-hand",
    kind: "concept",
    prompt: {
      vi: `Không chạy code, tính tay ba giá trị sau: \`step(0.5, 0.3)\`, \`step(0.5, 0.7)\`, và \`clamp(vec3(-0.2, 0.5, 1.4), 0.0, 1.0)\`.

Sau đó giải thích: vì sao \`clamp\` áp lên \`vec3\` không cần viết ba dòng \`if\` riêng cho từng kênh \`r\`, \`g\`, \`b\` — thuộc tính nào của các hàm built-in này khiến điều đó đúng?`,
      en: `Without running code, compute by hand: \`step(0.5, 0.3)\`, \`step(0.5, 0.7)\`, and \`clamp(vec3(-0.2, 0.5, 1.4), 0.0, 1.0)\`.

Then explain: why doesn't \`clamp\` on a \`vec3\` need three separate \`if\` lines for the \`r\`, \`g\`, \`b\` channels — which property of these built-in functions makes that true?`,
    },
    hints: [
      {
        vi: "step(edge, x): edge đứng trước. So sánh x với edge rồi trả 0.0 hoặc 1.0, không có giá trị trung gian.",
        en: "step(edge, x): edge comes first. Compare x to edge and return 0.0 or 1.0 — nothing in between.",
      },
      {
        vi: "clamp trên vector là 'component-wise': mỗi thành phần được xử lý độc lập, y hệt gọi hàm float ba lần rồi ghép lại thành vec3.",
        en: "clamp on a vector is 'component-wise': each component is processed independently, exactly like calling the float version three times and reassembling a vec3.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng step(0.5, 0.3) = 0.0 và step(0.5, 0.7) = 1.0",
        en: "I correctly computed step(0.5, 0.3) = 0.0 and step(0.5, 0.7) = 1.0",
      },
      {
        vi: "Tôi tính đúng clamp(vec3(-0.2, 0.5, 1.4), 0.0, 1.0) = vec3(0.0, 0.5, 1.0)",
        en: "I correctly computed clamp(vec3(-0.2, 0.5, 1.4), 0.0, 1.0) = vec3(0.0, 0.5, 1.0)",
      },
      {
        vi: "Tôi giải thích được tính chất component-wise và vì sao nó thay được if lặp lại theo từng kênh",
        en: "I can explain the component-wise property and why it replaces a per-channel repeated if",
      },
    ],
    solutionCode: `// step(0.5, 0.3) = 0.0   (0.3 < 0.5)
// step(0.5, 0.7) = 1.0   (0.7 >= 0.5)
// clamp(vec3(-0.2, 0.5, 1.4), 0.0, 1.0) = vec3(0.0, 0.5, 1.0)
//   -0.2 bị kẹp xuống 0.0, 0.5 nằm trong khoảng nên giữ nguyên, 1.4 bị kẹp lên 1.0
//
// clamp/step/mix... đều "component-wise": khi nhận vec3, GLSL áp phép toán
// độc lập lên TỪNG thành phần, tương đương gọi bản float ba lần rồi ghép lại
// thành vec3 — không có ý nghĩa "vector" đặc biệt nào chen vào giữa.`,
  },
  {
    id: "compose-pulse-train",
    kind: "shader",
    prompt: {
      vi: `Viết một pattern "xung nhịp" (pulse train) lặp lại dọc trục X, dùng đúng kỹ thuật "cặp smoothstep" đã học: \`pulse = smoothstep(e0, e1, t) - smoothstep(e2, e3, t)\`, với \`t = fract(uv.x * n)\`.

Yêu cầu: mỗi ô lặp (trong \`n\` ô) phải có một xung với cao nguyên phẳng ở giữa và hai sườn mượt — không dùng \`if\`, không dùng \`step\` đơn lẻ (vì \`step\` sẽ cho cạnh cứng, không phải xung mượt).`,
      en: `Write a repeating "pulse train" pattern along the X axis using the "smoothstep pair" technique from the lesson: \`pulse = smoothstep(e0, e1, t) - smoothstep(e2, e3, t)\`, with \`t = fract(uv.x * n)\`.

Requirement: each of the \`n\` repeating cells must show a pulse with a flat plateau in the middle and two soft ramps — no \`if\`, and no lone \`step\` (which would give a hard edge, not a soft pulse).`,
    },
    starterCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float n = 6.0;
  float t = fract(uv.x * n);

  // TODO 1: chọn 4 mốc edge cho 1 xung nằm giữa mỗi ô — ví dụ rising ở
  // [0.3, 0.4] và falling ở [0.6, 0.7]
  // TODO 2: pulse = smoothstep(rising) - smoothstep(falling)
  float pulse = 0.0;

  vec3 color = mix(vec3(0.05, 0.06, 0.1), vec3(0.95, 0.6, 0.25), pulse);
  fragColor = vec4(color, 1.0);
}`,
    solutionCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float n = 6.0;
  float t = fract(uv.x * n);

  float pulse = smoothstep(0.3, 0.4, t) - smoothstep(0.6, 0.7, t);

  vec3 color = mix(vec3(0.05, 0.06, 0.1), vec3(0.95, 0.6, 0.25), pulse);
  fragColor = vec4(color, 1.0);
}`,
    hints: [
      {
        vi: "smoothstep(0.3, 0.4, t) một mình đã là một 'bậc thang mượt' tăng dần từ 0 lên 1 — đó là sườn LÊN của xung.",
        en: "smoothstep(0.3, 0.4, t) alone is already a 'soft step' rising from 0 to 1 — that's the pulse's RISING edge.",
      },
      {
        vi: "Trừ đi một smoothstep khác tăng ở vị trí xa hơn (ví dụ 0.6→0.7) sẽ 'kéo' giá trị về 0 sau cao nguyên — đó là sườn XUỐNG.",
        en: "Subtracting a second smoothstep that rises further along (e.g. 0.6→0.7) pulls the value back to 0 after the plateau — that's the FALLING edge.",
      },
    ],
    checklist: [
      {
        vi: "Pattern lặp lại đúng n = 6 lần trên chiều ngang nhờ fract(uv.x * n)",
        en: "The pattern repeats exactly n = 6 times across the width via fract(uv.x * n)",
      },
      {
        vi: "Mỗi xung có cao nguyên phẳng ở giữa (không phải một đỉnh nhọn)",
        en: "Each pulse has a flat plateau in the middle (not a sharp peak)",
      },
      {
        vi: "Hai sườn của xung mượt (anti-aliased), không có cạnh răng cưa cứng",
        en: "Both edges of the pulse are soft (anti-aliased), with no hard jagged edge",
      },
    ],
  },
];
