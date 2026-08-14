import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "shadermaterial-prelude-collisions",
    kind: "concept",
    prompt: {
      vi: `ShaderMaterial của Three tự chèn đúng sáu dòng uniform và ba dòng attribute vào đầu shader trước khi bạn viết dòng code nào (\`modelMatrix\`, \`modelViewMatrix\`, \`projectionMatrix\`, \`viewMatrix\`, \`normalMatrix\`, \`cameraPosition\`; \`position\`, \`normal\`, \`uv\`). Với năm khai báo dưới đây, xác định khai báo nào sẽ gây lỗi biên dịch redefinition nếu thêm vào MỘT ShaderMaterial thường (không phải Raw), và khai báo nào biên dịch bình thường:

\`\`\`glsl
uniform vec3 cameraPosition;
uniform float uTime;
attribute vec3 normal;
varying vec2 vUv;
uniform mat3 normalMatrix;
\`\`\`

Sau đó: nếu chuyển đúng năm dòng này sang một RawShaderMaterial, câu trả lời có đổi không — và vì sao?`,
      en: `Three's ShaderMaterial always prepends exactly six uniform lines and three attribute lines before any code you write (\`modelMatrix\`, \`modelViewMatrix\`, \`projectionMatrix\`, \`viewMatrix\`, \`normalMatrix\`, \`cameraPosition\`; \`position\`, \`normal\`, \`uv\`). For the five declarations below, determine which ones trigger a redefinition compile error when added to a REGULAR ShaderMaterial (not Raw), and which compile fine:

\`\`\`glsl
uniform vec3 cameraPosition;
uniform float uTime;
attribute vec3 normal;
varying vec2 vUv;
uniform mat3 normalMatrix;
\`\`\`

Then: if you move these exact five lines into a RawShaderMaterial instead, does the answer change — and why?`,
    },
    hints: [
      {
        vi: "Chỉ so khớp với đúng sáu uniform + ba attribute liệt kê ở trên — `uTime` và `varying vec2 vUv;` không nằm trong danh sách đó.",
        en: "Only match against the exact six uniforms + three attributes listed above — `uTime` and `varying vec2 vUv;` aren't on that list.",
      },
      {
        vi: "RawShaderMaterial không có prelude nào cả — không tên nào trong shader của bạn có thể 'trùng' với một khai báo mà Three chưa từng thêm.",
        en: "RawShaderMaterial has no prelude at all — nothing in your shader can 'collide' with a declaration Three never added.",
      },
    ],
    checklist: [
      {
        vi: "Tôi xác định đúng `uniform vec3 cameraPosition;`, `attribute vec3 normal;` và `uniform mat3 normalMatrix;` sẽ gây redefinition trên ShaderMaterial thường",
        en: "I correctly identified `uniform vec3 cameraPosition;`, `attribute vec3 normal;` and `uniform mat3 normalMatrix;` as causing redefinition on a regular ShaderMaterial",
      },
      {
        vi: "Tôi xác định đúng `uniform float uTime;` và `varying vec2 vUv;` biên dịch bình thường (không trùng built-in nào)",
        en: "I correctly identified `uniform float uTime;` and `varying vec2 vUv;` as compiling fine (no built-in collision)",
      },
      {
        vi: "Tôi giải thích được vì sao cả năm dòng đều an toàn trên RawShaderMaterial (prelude rỗng, không có gì để trùng)",
        en: "I can explain why all five lines are safe on RawShaderMaterial (empty prelude, nothing to collide with)",
      },
    ],
    solutionCode: `// Trên ShaderMaterial thường (prelude có sẵn 6 uniform + 3 attribute):
// - uniform vec3 cameraPosition;   -> LỖI redefinition (đã có sẵn)
// - uniform float uTime;           -> OK (không trùng tên built-in nào)
// - attribute vec3 normal;         -> LỖI redefinition (đã có sẵn)
// - varying vec2 vUv;              -> OK (vUv là tên tự đặt, không phải "uv")
// - uniform mat3 normalMatrix;     -> LỖI redefinition (đã có sẵn)
//
// Trên RawShaderMaterial: prelude rỗng hoàn toàn, không có gì để trùng ->
// cả 5 dòng đều biên dịch bình thường (nhưng bạn phải tự khai báo thêm
// precision, position, uv, projectionMatrix, modelViewMatrix... nếu dùng tới).`,
  },
  {
    id: "playground-fake-vuv",
    kind: "shader",
    prompt: {
      vi: `Playground không có vertex stage riêng — mọi thứ chạy trên một quad phủ kín màn hình, nên không có \`varying vec2 vUv;\` nào được nội suy sẵn như trong ShaderMaterial thật. Viết fragment shader body tính một toạ độ \`fakeUv\` từ \`gl_FragCoord.xy / uResolution\` (đúng vai trò \`vUv\` mà vertex shader của một ShaderMaterial sẽ cấp sẵn), rồi tô màu giống demo của bài: kênh đỏ = fakeUv.x, kênh lục = fakeUv.y, kênh lam cố định 0.5.`,
      en: `The playground has no vertex stage of its own — everything runs on one fullscreen quad, so there's no interpolated \`varying vec2 vUv;\` like a real ShaderMaterial would hand you. Write a fragment shader body that computes a \`fakeUv\` coordinate from \`gl_FragCoord.xy / uResolution\` (standing in for the \`vUv\` a ShaderMaterial's vertex stage would already provide), then color it like this lesson's demo: red channel = fakeUv.x, green channel = fakeUv.y, blue channel fixed at 0.5.`,
    },
    starterCode: `void main() {
  // TODO: tinh fakeUv tu gl_FragCoord.xy / uResolution
  vec2 fakeUv = vec2(0.0);

  fragColor = vec4(fakeUv, 0.5, 1.0);
}`,
    solutionCode: `void main() {
  vec2 fakeUv = gl_FragCoord.xy / uResolution;

  fragColor = vec4(fakeUv, 0.5, 1.0);
}`,
    hints: [
      {
        vi: "`uResolution` (vec2, có sẵn trong playground) là chiều rộng/cao canvas theo pixel — chia `gl_FragCoord.xy` cho nó ra đúng khoảng [0,1], y hệt công thức pixel→UV ở Track 0.",
        en: "`uResolution` (vec2, available in the playground) is the canvas width/height in pixels — dividing `gl_FragCoord.xy` by it lands in [0,1], the exact pixel-to-UV formula from Track 0.",
      },
      {
        vi: "Không cần `varying` hay `attribute` nào ở đây — playground đã có prelude riêng (`uTime`/`uResolution`/`uMouse`/`fragColor`), đúng như ShaderMaterial có prelude riêng của nó, chỉ khác nội dung.",
        en: "No `varying` or `attribute` needed here — the playground has its own prelude (`uTime`/`uResolution`/`uMouse`/`fragColor`), just like ShaderMaterial has its own, only with different contents.",
      },
    ],
    checklist: [
      {
        vi: "fakeUv nằm đúng trong [0,1]² trên toàn bộ màn hình",
        en: "fakeUv lands correctly in [0,1]² across the whole screen",
      },
      {
        vi: "Góc dưới-trái ra màu gần (0,0,0.5), góc trên-phải ra màu gần (1,1,0.5)",
        en: "The bottom-left corner renders close to (0,0,0.5), the top-right close to (1,1,0.5)",
      },
      {
        vi: "Không khai báo lại `uResolution`/`fragColor` (đã có sẵn từ prelude của playground)",
        en: "`uResolution`/`fragColor` are not redeclared (already provided by the playground's prelude)",
      },
    ],
  },
];
