import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "classify-type-and-swizzle-errors",
    kind: "concept",
    prompt: {
      vi: `Năm dòng GLSL dưới đây khai báo hoặc gán giá trị. Với MỖI dòng, xác định nó biên dịch được hay lỗi biên dịch — nếu lỗi, chỉ đúng MỘT quy tắc bị vi phạm (không ép kiểu ngầm, hay swizzle đọc vượt quá thành phần có sẵn trên vector nguồn):

\`\`\`glsl
float x = 1;                          // (a)
int n = 2.0;                          // (b)
vec3 c = vec3(1.0);                   // (c)
vec2 p = vec3(0.2, 0.4, 0.6).xy;      // (d)
vec3 q = vec2(0.1, 0.2).xyz;          // (e)
\`\`\`

Sau đó giải thích riêng dòng (e): vì sao lỗi ở đây không liên quan gì tới ép kiểu int/float, mà liên quan tới một quy tắc hoàn toàn khác của swizzle.`,
      en: `The five GLSL lines below declare or assign a value. For EACH line, decide whether it compiles or fails — and if it fails, name the ONE rule it breaks (no implicit casting, or a swizzle reading more components than the source vector has):

\`\`\`glsl
float x = 1;                          // (a)
int n = 2.0;                          // (b)
vec3 c = vec3(1.0);                   // (c)
vec2 p = vec3(0.2, 0.4, 0.6).xy;      // (d)
vec3 q = vec2(0.1, 0.2).xyz;          // (e)
\`\`\`

Then explain line (e) specifically: why its error has nothing to do with int/float casting, but with a completely different swizzle rule.`,
    },
    hints: [
      {
        vi: "Chỉ có (a), (b) và (e) lỗi — nhưng (a)/(b) lỗi vì lý do khác hẳn (e). Tách hai nhóm nguyên nhân trước khi kết luận.",
        en: "Only (a), (b) and (e) fail — but (a)/(b) fail for a completely different reason than (e). Separate the two failure causes before concluding.",
      },
      {
        vi: "vec2 chỉ có đúng 2 thành phần: x và y (hay r/g, s/t). Gọi thêm .z hay .b trên nó luôn sai, bất kể ở vế đọc hay ghi.",
        en: "A vec2 only has 2 components: x and y (or r/g, s/t). Referencing a .z or .b on it is always wrong, whether reading or writing.",
      },
    ],
    checklist: [
      {
        vi: "Tôi xác định đúng (a) và (b) lỗi vì gán literal sai kiểu (int cho float, float cho int) mà không qua constructor tường minh",
        en: "I correctly identified (a) and (b) as errors from assigning a mistyped literal (int to float, float to int) without an explicit constructor",
      },
      {
        vi: "Tôi xác định đúng (c) và (d) biên dịch được: (c) là splat constructor, (d) là đọc hợp lệ 2/3 thành phần bằng swizzle",
        en: "I correctly identified (c) and (d) as compiling fine: (c) is a splat constructor, (d) reads a valid 2-of-3 component swizzle",
      },
      {
        vi: "Tôi giải thích đúng (e) lỗi vì .z không tồn tại trên vec2 — lỗi swizzle-vượt-phạm-vi, khác hẳn cơ chế lỗi ép kiểu ở (a)/(b)",
        en: "I correctly explained that (e) fails because .z doesn't exist on a vec2 — a swizzle-out-of-range error, a completely different mechanism from the (a)/(b) type-cast errors",
      },
    ],
    solutionNote: {
      vi: `(a) LỖI — \`1\` là literal \`int\`, không gán thẳng được cho \`float\` (không ép kiểu ngầm). (b) LỖI — \`2.0\` là literal \`float\`, không gán thẳng được cho \`int\`. (c) OK — \`vec3(1.0)\` là splat constructor: 1 số lặp vào cả 3 thành phần. (d) OK — \`.xy\` đọc 2 trong 3 thành phần của \`vec3\`, cả \`x\` và \`y\` đều tồn tại.

(e) LỖI — \`vec2(0.1, 0.2)\` chỉ có \`x\` và \`y\`; \`.xyz\` đòi hỏi thành phần \`z\` không tồn tại trên vector nguồn → lỗi "swizzle vượt phạm vi", KHÔNG liên quan gì tới ép kiểu int/float như (a)/(b).`,
      en: `(a) FAILS — \`1\` is an \`int\` literal, it can't be assigned directly to a \`float\` (no implicit casting). (b) FAILS — \`2.0\` is a \`float\` literal, it can't be assigned directly to an \`int\`. (c) OK — \`vec3(1.0)\` is a splat constructor: one number repeated into all 3 components. (d) OK — \`.xy\` reads 2 of the 3 components of a \`vec3\`, and both \`x\` and \`y\` exist.

(e) FAILS — \`vec2(0.1, 0.2)\` only has \`x\` and \`y\`; \`.xyz\` demands a \`z\` component that doesn't exist on the source vector → a "swizzle out of range" error, which has NOTHING to do with the int/float casting mechanism behind (a)/(b).`,
    },
  },
  {
    id: "swizzle-color-channels",
    kind: "shader",
    prompt: {
      vi: `Playground bên dưới có sẵn \`uTime\`, \`uResolution\`, \`uMouse\` và biến ra \`fragColor\`. Hoàn thiện thân hàm \`main\` sau: dựng \`vec3 base = vec3(uv, sin(uTime) * 0.5 + 0.5)\` từ uv chuẩn hoá theo màn hình, rồi xuất \`fragColor\` bằng đúng thứ tự kênh \`base.bgr\` (đổi chỗ kênh đỏ và xanh dương, giữ nguyên kênh xanh lá ở giữa) thay vì thứ tự gốc \`base.xyz\`.`,
      en: `The playground below has \`uTime\`, \`uResolution\`, \`uMouse\` and the output \`fragColor\` ready to use. Complete the \`main\` body: build \`vec3 base = vec3(uv, sin(uTime) * 0.5 + 0.5)\` from screen-normalized uv, then output \`fragColor\` using the \`base.bgr\` channel order (swap red and blue, keep green in the middle) instead of the identity \`base.xyz\`.`,
    },
    starterCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec3 base = vec3(uv, sin(uTime) * 0.5 + 0.5);

  // TODO: swizzle base into .bgr order instead of the identity below
  vec3 color = base.xyz;

  fragColor = vec4(color, 1.0);
}`,
    solutionCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec3 base = vec3(uv, sin(uTime) * 0.5 + 0.5);

  vec3 color = base.bgr;

  fragColor = vec4(color, 1.0);
}`,
    hints: [
      {
        vi: ".bgr nghĩa là: kênh đầu lấy từ .b, kênh giữa lấy từ .g, kênh cuối lấy từ .r — không phải đảo ngược cả vec3 theo thứ tự viết.",
        en: ".bgr means: the first channel comes from .b, the middle from .g, the last from .r — it's not simply reversing the vec3 as written.",
      },
      {
        vi: "base không đổi giá trị — swizzle chỉ đổi THỨ TỰ ĐỌC, color là một vec3 mới mang thứ tự đó.",
        en: "base itself never changes — swizzling only changes the READ order; color is a new vec3 carrying that order.",
      },
    ],
    checklist: [
      {
        vi: "color được gán bằng base.bgr, không phải base.xyz hay một hoán vị khác",
        en: "color is assigned base.bgr, not base.xyz or some other permutation",
      },
      {
        vi: "base vẫn được dựng đúng bằng vec3(uv, sin(uTime) * 0.5 + 0.5) trước khi swizzle",
        en: "base is still built correctly as vec3(uv, sin(uTime) * 0.5 + 0.5) before swizzling",
      },
      {
        vi: "fragColor.a vẫn bằng 1.0, chỉ 3 kênh màu thay đổi",
        en: "fragColor.a stays 1.0 — only the 3 color channels change",
      },
    ],
  },
];
