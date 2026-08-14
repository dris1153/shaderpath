import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "hash-determinism-and-seeding",
    kind: "concept",
    prompt: {
      vi: `GPU chạy hàng triệu invocation song song, không invocation nào biết thứ tự nó chạy trước hay sau invocation khác. Giải thích vì sao \`hash21(p)\` bắt buộc phải là một hàm thuần (cùng $p$ luôn cho đúng cùng kết quả, không phụ thuộc thứ tự thực thi hay bộ đếm nào) để dùng được trong ngữ cảnh đó.

Sau đó: bạn cần 3 giá trị ngẫu nhiên độc lập cho mỗi pixel (ví dụ 3 lượt tung xúc xắc) chỉ dùng \`hash21\` và phép cộng vector. Bạn sẽ đổi toạ độ input cho giá trị thứ 2 và thứ 3 như thế nào — và vì sao độ lệch đó phải là một hằng số lẻ, bất quy tắc (như $17.13$), thay vì một số tròn như $1.0$?`,
      en: `The GPU runs millions of invocations in parallel, and no invocation knows whether it ran before or after another. Explain why \`hash21(p)\` must be a pure function (the same $p$ always produces the exact same result, independent of execution order or any counter) to be usable in that context.

Then: you need 3 independent random values per pixel (say, 3 dice rolls). Using only \`hash21\` and vector addition, how would you change the input coordinate for value 2 and value 3 — and why must that offset be an odd, irregular constant (like $17.13$) rather than a round number like $1.0$?`,
    },
    hints: [
      {
        vi: "Nghĩ về \"hàm thuần\" theo đúng nghĩa: cùng input luôn cho đúng cùng output, bất kể core nào, thứ tự nào, frame nào chạy nó — không có state ẩn nào được phép ảnh hưởng tới kết quả.",
        en: "Think about \"pure function\" literally: the same input always gives the same output, no matter which core, order, or frame runs it — no hidden state is allowed to influence the result.",
      },
      {
        vi: "Nếu lưới hash bước 1 đơn vị mỗi ô (`floor(uv * N)`), một độ lệch tròn như $+1.0$ chỉ đơn giản trỏ sang ô lân cận — ô đó đã có giá trị hash riêng, không hề độc lập với ô gốc theo nghĩa bạn cần.",
        en: "If the hash grid steps 1 unit per cell (`floor(uv * N)`), a round offset like $+1.0$ simply points at the neighboring cell — which already has its own hash value, not independent of the original cell in the sense you need.",
      },
    ],
    checklist: [
      {
        vi: "Giải thích được vì sao GPU không có state chung giữa các invocation, nên hash phải là hàm thuần chỉ phụ thuộc input",
        en: "Explained why the GPU has no shared state between invocations, so the hash must be a pure function of input alone",
      },
      {
        vi: "Đề xuất dịch input bằng hai hằng số lẻ khác nhau cho giá trị 2 và 3, ví dụ `hash21(p + 17.13)` và `hash21(p + 91.7)`",
        en: "Proposed shifting the input by two different odd constants for values 2 and 3, e.g. `hash21(p + 17.13)` and `hash21(p + 91.7)`",
      },
      {
        vi: "Giải thích được vì sao độ lệch trùng bước lưới (số tròn nhỏ) làm hai kênh vô tình tương quan thay vì độc lập",
        en: "Explained why an offset matching the grid step (a small round number) makes the two channels accidentally correlated instead of independent",
      },
    ],
    solutionCode: `// hash21(p) phải thuần vì GPU chạy song song, không thứ tự cố định, không
// bộ nhớ chung giữa các invocation — chỉ có toạ độ p là thông tin đáng tin.
//
// 3 kênh độc lập từ cùng một hash:
// r1 = hash21(p);
// r2 = hash21(p + 17.13);
// r3 = hash21(p + 91.7);
//
// 17.13 và 91.7 lẻ, không phải bội số của bước lưới (thường là số nguyên
// nhỏ) — dịch đúng 1.0 chỉ trỏ sang ô kế bên, một ô đã tồn tại sẵn trong
// chính trường hash gốc, nên hai "kênh" sẽ chỉ là bản dịch của nhau, không
// độc lập theo đúng nghĩa thống kê.`,
  },
  {
    id: "no-sine-hash-in-playground",
    kind: "shader",
    prompt: {
      vi: `Trong playground (uTime, uResolution, uMouse, fragColor có sẵn), dựng một lưới $24 \\times 24$ ô trên màn hình bằng \`floor(uv * density)\`, rồi viết hash không dùng sin (kiểu Dave Hoskins) biến mỗi ô thành một giá trị xám trong $[0, 1)$ để render trắng xoá.`,
      en: `In the playground (uTime, uResolution, uMouse, fragColor are all available), build a $24 \\times 24$ on-screen grid with \`floor(uv * density)\`, then write a sine-free hash (Dave Hoskins style) turning each cell into a gray value in $[0, 1)$ to render white noise.`,
    },
    starterCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float density = 24.0;
  vec2 cell = floor(uv * density);

  // TODO: hash "không dùng sin" (Dave Hoskins style) biến cell thành một
  // giá trị giả ngẫu nhiên trong [0, 1)
  float h = 0.0;

  fragColor = vec4(vec3(h), 1.0);
}`,
    solutionCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float density = 24.0;
  vec2 cell = floor(uv * density);

  vec3 p3 = fract(vec3(cell.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  float h = fract((p3.x + p3.y) * p3.z);

  fragColor = vec4(vec3(h), 1.0);
}`,
    hints: [
      {
        vi: "`cell` đã là toạ độ nguyên (từ `floor`) — đưa thẳng vào hash đa thức, không nhân lại với `uv` lần nữa.",
        en: "`cell` is already integer-valued (from `floor`) — feed it directly into the polynomial hash, don't multiply by `uv` again.",
      },
      {
        vi: "Thứ tự đúng: `fract(vec3(cell.xyx) * 0.1031)`, rồi `p3 += dot(p3, p3.yzx + 33.33)`, rồi `fract((p3.x + p3.y) * p3.z)` — bước `dot` ở giữa là bước trộn ba kênh vào nhau, thiếu nó kết quả vẫn gần như tuyến tính.",
        en: "Order matters: `fract(vec3(cell.xyx) * 0.1031)`, then `p3 += dot(p3, p3.yzx + 33.33)`, then `fract((p3.x + p3.y) * p3.z)` — the middle `dot` step mixes the three channels together; skip it and the result stays nearly linear.",
      },
    ],
    checklist: [
      {
        vi: "Màn hình hiện lưới $24 \\times 24$ ô, mỗi ô một màu xám phẳng, không nội suy, không dải lặp lại",
        en: "The screen shows a $24 \\times 24$ grid, each cell a flat gray, no interpolation, no repeating bands",
      },
      {
        vi: "Di chuột không làm pattern đổi — hash chỉ phụ thuộc `cell`, không phụ thuộc `uMouse`/`uTime`",
        en: "Moving the mouse doesn't change the pattern — the hash depends only on `cell`, never on `uMouse`/`uTime`",
      },
      {
        vi: "Hai ô liền kề cho hai giá trị xám rõ ràng không liên quan tới nhau (không có dải sáng/tối chuyển tiếp mượt)",
        en: "Two adjacent cells show clearly unrelated gray values (no smooth light-to-dark transition between them)",
      },
    ],
  },
];
