import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "diagnose-unnormalized-vector",
    kind: "concept",
    prompt: {
      vi: `Bạn nghi ngờ một vector \`v\` dùng trong \`dot(v, L)\` chưa được normalize trước khi truyền vào. Bạn chỉ được thêm ĐÚNG MỘT dòng debug (không sửa logic) để xác nhận nghi ngờ càng nhanh càng tốt.

Giải thích: xuất \`length(v)\` ra màu xám bằng \`vec3(length(v))\` tiết lộ điều gì mà xuất thẳng \`v\` dưới dạng \`vec3(v, 0.0)\` không tiết lộ rõ bằng? Nêu cụ thể — với một vector đã normalize thật sự, \`length(v)\` phải cho ra giá trị nào, và giá trị đó hiện ra thành màu gì?`,
      en: `You suspect a vector \`v\` used in \`dot(v, L)\` was never normalized before being passed in. You get to add EXACTLY ONE debug line (no logic changes) to confirm the suspicion as fast as possible.

Explain: what does outputting \`length(v)\` as gray via \`vec3(length(v))\` reveal that outputting \`v\` directly as \`vec3(v, 0.0)\` doesn't reveal as clearly? Be specific — for a genuinely normalized vector, what value must \`length(v)\` produce, and what color does that turn into?`,
    },
    hints: [
      {
        vi: "length(v) là MỘT số vô hướng — dùng nó tô cả 3 kênh RGB bằng nhau cho ra một mức xám duy nhất, dễ so sánh 'đúng bao nhiêu' hơn nhìn một màu RGB pha trộn 2 giá trị khác nhau.",
        en: "length(v) is a SINGLE scalar — feeding it into all 3 RGB channels equally gives one clean gray level, easier to judge 'how much' than a color blending 2 different values.",
      },
      {
        vi: "Nếu v đã normalize đúng, length(v) = 1.0 luôn đúng — output phải là màu trắng tuyệt đối, đồng đều trên toàn vùng cần kiểm tra. Bất kỳ sắc xám nào khác trắng là bằng chứng trực tiếp.",
        en: "If v is properly normalized, length(v) = 1.0 always holds — the output must be pure white, uniform across the region under test. Any shade other than white is direct evidence.",
      },
    ],
    checklist: [
      {
        vi: "Tôi giải thích được vec3(length(v)) cho một mức xám DUY NHẤT dễ đọc, còn vec3(v, 0.0) trộn 2 giá trị khác nhau vào 2 kênh, khó đọc độ lớn tổng thể hơn",
        en: "I explained vec3(length(v)) gives a SINGLE easy-to-read gray level, while vec3(v, 0.0) mixes 2 different values into 2 channels, harder to judge overall magnitude",
      },
      {
        vi: "Tôi nêu đúng: v normalize đúng thì length(v) = 1.0 → output phải là màu trắng tuyệt đối",
        en: "I correctly stated: a properly normalized v gives length(v) = 1.0 → the output must be pure white",
      },
      {
        vi: "Tôi chỉ ra được: output ra xám tối hơn trắng (ví dụ xám 0.3) là bằng chứng length(v) < 1, tức v CHƯA normalize",
        en: "I identified: output darker than white (e.g. gray 0.3) is evidence length(v) < 1, meaning v is NOT normalized",
      },
    ],
    solutionCode: `// vec3(length(v)) đổ CẢ 3 kênh bằng đúng 1 số → xám đồng đều, dễ đọc "độ lớn"
// mà không cần trộn/so sánh giữa các kênh khác nhau như vec3(v, 0.0).
//
// Nếu v đã normalize: length(v) = 1.0 luôn đúng → output PHẢI là trắng tuyệt đối
// (1.0, 1.0, 1.0) trên toàn vùng kiểm tra.
//
// Output ra xám tối hơn trắng (vd 0.3 thay vì 1.0) là bằng chứng trực tiếp,
// định lượng được: length(v) ≈ 0.3, tức v chưa normalize — không cần đoán,
// chỉ cần đọc đúng mức xám.`,
  },
  {
    id: "probe-and-fix-signed-wave",
    kind: "shader",
    prompt: {
      vi: `Đoạn shader dưới tính một sóng sin \`wave\` (trong khoảng $[-1, 1]$) rồi xuất thẳng ra màu — kết quả: nửa màn hình đen tuyền, trông như sóng "biến mất". Thêm ĐÚNG MỘT dòng debug probe xác nhận nguyên nhân trước khi sửa, sau đó sửa bằng phép remap đúng.`,
      en: `The shader below computes a sine wave \`wave\` (in $[-1, 1]$) and outputs it straight to color — the result: half the screen is solid black, as if the wave "disappeared". Add EXACTLY ONE debug probe line to confirm the cause before fixing it, then fix it with the correct remap.`,
    },
    starterCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float wave = sin(uv.x * 10.0 + uTime);

  // TODO 1: them mot dong PROBE xuat step(0.0, wave) de xac nhan
  // dung mot nua man hinh co wave < 0.0 (khong phai loi tinh toan khac)

  // TODO 2: sua bang cach remap wave ve [0,1] truoc khi xuat mau
  fragColor = vec4(vec3(wave), 1.0);
}`,
    solutionCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float wave = sin(uv.x * 10.0 + uTime);

  // PROBE: step(0.0, wave) phai la dai soc den/trang ro rang neu wave
  // thuc su dao dau qua 0 -- xac nhan day khong phai loi tinh toan khac
  // fragColor = vec4(vec3(step(0.0, wave)), 1.0); return;

  float remapped = wave * 0.5 + 0.5; // -1..1 -> 0..1, khong con clip am
  fragColor = vec4(vec3(remapped), 1.0);
}`,
    hints: [
      {
        vi: "step(0.0, wave) trả về 1.0 khi wave >= 0.0, ngược lại 0.0 — nếu probe này cho một dải sọc đen/trắng rõ ràng, wave THẬT SỰ đang dao động qua 0, không phải lỗi công thức sin() nào khác.",
        en: "step(0.0, wave) returns 1.0 when wave >= 0.0, else 0.0 — if this probe produces a clean black/white stripe pattern, wave IS genuinely oscillating through 0, not some other sin() formula bug.",
      },
      {
        vi: "Đừng xoá dòng probe, chỉ comment nó lại — giữ nó như một known-good baseline để bật lại bất cứ lúc nào nghi ngờ tái xuất hiện.",
        en: "Don't delete the probe line, just comment it out — keep it as a known-good baseline to flip back on any time the suspicion resurfaces.",
      },
    ],
    checklist: [
      {
        vi: "Tôi thêm đúng một dòng probe dùng step() và xác nhận wave dao động qua 0 trước khi sửa",
        en: "I added exactly one step()-based probe line and confirmed wave oscillates through 0 before fixing",
      },
      {
        vi: "Tôi sửa bằng wave * 0.5 + 0.5, không dùng abs(wave) hay clamp(wave, 0.0, 1.0) (hai cách này làm mất thông tin thay vì remap đúng)",
        en: "I fixed it with wave * 0.5 + 0.5, not abs(wave) or clamp(wave, 0.0, 1.0) (both destroy information instead of remapping correctly)",
      },
      {
        vi: "Sau khi sửa, toàn bộ chiều rộng màn hình hiện gradient xám mượt, không còn dải đen ở nửa sóng âm",
        en: "After the fix, the full screen width shows a smooth gray gradient, no more black band where the wave was negative",
      },
    ],
  },
];
