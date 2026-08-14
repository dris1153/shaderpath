import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "explain-relative-precision-jitter",
    kind: "concept",
    prompt: {
      vi: `Đặc tả GLSL ES 3.00 đảm bảo \`mediump float\` có độ chính xác TƯƠNG ĐỐI tối thiểu $2^{-10}$ (khoảng 10-bit mantissa) và \`highp float\` có độ chính xác tương đối tối thiểu $2^{-16}$ — đây là các con số SÀN theo đặc tả, phần cứng thật thường tốt hơn.

Một shader tính \`sin(uTime * 10000.0)\` bằng \`mediump float\`, với \`uTime\` là số giây trôi qua từ lúc trang tải, tăng dần không giới hạn. Giải thích: vì sao biểu thức này ngày càng dễ giật (jitter) khi \`uTime\` lớn dần theo thời gian chạy, dù bản thân \`sin()\` luôn trả về giá trị gọn trong $[-1, 1]$ — độ chính xác tương đối ở đây áp dụng lên ĐẠI LƯỢNG NÀO, không phải lên kết quả \`sin\` cuối cùng?`,
      en: `The GLSL ES 3.00 spec guarantees \`mediump float\` has a RELATIVE precision of at least $2^{-10}$ (roughly a 10-bit mantissa) and \`highp float\` has a relative precision of at least $2^{-16}$ — these are the spec's FLOOR numbers, real hardware is usually better.

A shader computes \`sin(uTime * 10000.0)\` using \`mediump float\`, where \`uTime\` is seconds elapsed since page load, growing without bound. Explain: why does this expression get progressively more prone to jitter as \`uTime\` grows, even though \`sin()\` itself always returns a value neatly inside $[-1, 1]$ — which QUANTITY does the relative precision actually apply to here, not the final \`sin\` result?`,
    },
    hints: [
      {
        vi: "Độ chính xác tương đối nghĩa là sai số TUYỆT ĐỐI tỉ lệ thuận với độ lớn của giá trị đang được biểu diễn, không phải một sai số cố định.",
        en: "Relative precision means the ABSOLUTE error scales with the magnitude of the value being represented — it's not a fixed error.",
      },
      {
        vi: "So sánh uTime * 10000.0 ở giây thứ 10 (~100,000) và ở giây thứ 10,000 (~10^8) — bước nhảy mediump gần mỗi giá trị đó lớn gấp bao nhiêu lần?",
        en: "Compare uTime * 10000.0 at second 10 (~100,000) versus second 10,000 (~10^8) — how much larger is the mediump step near each value?",
      },
    ],
    checklist: [
      {
        vi: "Tôi giải thích được độ chính xác tương đối áp dụng lên độ lớn của uTime * 10000.0 (biểu thức TRUNG GIAN), không phải lên kết quả sin() đã bị nén về [-1,1]",
        en: "I explained that relative precision applies to the magnitude of uTime * 10000.0 (the INTERMEDIATE expression), not the sin() result already squeezed into [-1,1]",
      },
      {
        vi: "Tôi nêu được: khoảng cách giữa hai giá trị mediump biểu diễn được gần độ lớn M xấp xỉ M × 2⁻¹⁰ — M càng lớn, bước nhảy càng thô",
        en: "I stated that the gap between two representable mediump values near magnitude M is roughly M × 2⁻¹⁰ — the larger M, the coarser the step",
      },
      {
        vi: "Tôi kết nối được điều đó với triệu chứng quan sát: pha đầu vào sin() nhảy cóc qua các bước ngày càng thô, dù output vẫn mượt trong [-1,1]",
        en: "I connected that to the observed symptom: the phase fed into sin() jumps across increasingly coarse steps, even though the output stays smooth within [-1,1]",
      },
    ],
    solutionCode: `// mediump có độ chính xác TƯƠNG ĐỐI 2^-10: sai số tuyệt đối gần một giá
// trị độ lớn M xấp xỉ M * 2^-10, KHÔNG phải một hằng số cố định.
//
// sin(uTime * 10000.0) luôn trả về [-1, 1] gọn gàng, nhưng độ chính xác
// tương đối không áp dụng lên kết quả đó -- nó áp dụng lên chính BIỂU
// THỨC TRUNG GIAN "uTime * 10000.0" TRƯỚC KHI đưa vào sin().
//
// uTime = 10s    -> M ~ 100,000      -> bước nhảy ~ 100,000 * 2^-10 ~ 97.7
// uTime = 10000s -> M ~ 100,000,000  -> bước nhảy ~ 10^8 * 2^-10 ~ 97,656
//
// Bước nhảy càng lớn nghĩa là pha đưa vào sin() nhảy qua càng nhiều giá
// trị liên tiếp bị "gộp" lại thành một -- animation mượt lúc đầu, giật
// dần theo thời gian chạy, đúng như triệu chứng jitter mô tả trong lý thuyết.`,
  },
  {
    id: "quantize-gradient-banding",
    kind: "shader",
    prompt: {
      vi: `Hoàn thiện thân hàm \`main\` bên dưới để mô phỏng banding do precision thấp: tính một gradient mượt \`v\` theo \`uv.y\`; với NỬA TRÁI màn hình (\`uv.x < 0.5\`) làm tròn \`v\` xuống \`N\` mức bằng công thức \`floor(v * N) / N\`; NỬA PHẢI giữ nguyên \`v\` không lượng tử hoá, để so sánh trực tiếp bản mượt và bản mất precision.`,
      en: `Complete the \`main\` body below to simulate banding from low precision: compute a smooth gradient \`v\` from \`uv.y\`; for the LEFT half of the screen (\`uv.x < 0.5\`) round \`v\` down to \`N\` levels with \`floor(v * N) / N\`; keep the RIGHT half's \`v\` unquantized, so the smooth version and the precision-losing version sit side by side.`,
    },
    starterCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float v = uv.y;
  float N = 8.0;

  // TODO: when uv.x < 0.5, quantize v to N levels with floor(v * N) / N;
  // otherwise keep v unquantized
  float value = v;

  fragColor = vec4(vec3(value), 1.0);
}`,
    solutionCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float v = uv.y;
  float N = 8.0;

  float value = uv.x < 0.5 ? floor(v * N) / N : v;

  fragColor = vec4(vec3(value), 1.0);
}`,
    hints: [
      {
        vi: "floor(v * N) / N làm tròn XUỐNG bậc gần nhất trong N bậc — thử N nhỏ (4.0) để bậc thang rõ, N lớn (64.0) gần như biến mất.",
        en: "floor(v * N) / N rounds DOWN to the nearest of N steps — try a small N (4.0) for obvious banding, a large N (64.0) for it to nearly vanish.",
      },
      {
        vi: "Dùng toán tử ba ngôi condition ? a : b (hoặc if/else) để chọn công thức khác nhau theo uv.x, giống hệt cách demo phía trên chia đôi màn hình.",
        en: "Use the ternary condition ? a : b (or if/else) to pick a different formula based on uv.x, exactly like the demo above splitting the screen.",
      },
    ],
    checklist: [
      {
        vi: "Nửa trái (uv.x < 0.5) hiện rõ các dải màu rời rạc thay vì gradient mượt",
        en: "The left half (uv.x < 0.5) shows clear discrete color bands instead of a smooth gradient",
      },
      {
        vi: "Nửa phải giữ nguyên gradient mượt liên tục, không bị làm tròn",
        en: "The right half keeps a continuous smooth gradient, unrounded",
      },
      {
        vi: "Giảm N xuống thấp (vd 4.0) làm banding rõ hơn, tăng N lên cao (vd 64.0) làm banding gần như biến mất",
        en: "Lowering N (e.g. 4.0) makes banding more obvious, raising it (e.g. 64.0) makes banding nearly disappear",
      },
    ],
  },
];
