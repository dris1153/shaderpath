import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "forgotten-dependency",
    kind: "concept",
    prompt: {
      vi: `Bạn đăng ký hai biến \`velocityVariable\` và \`positionVariable\`, nhưng QUÊN gọi \`gpuCompute.setVariableDependencies(...)\` cho cả hai trước khi gọi \`init()\`. Shader \`velocity.frag\` của bạn có dòng \`texture2D(texturePosition, uv)\`.

Giải thích chính xác điều gì xảy ra: shader có biên dịch được không, và nếu có thì particle sẽ chuyển động thế nào so với bình thường? Đáp án phải giải thích được bằng đúng cơ chế "chèn uniform tự động" đọc trong bài, không phải đoán chung chung.`,
      en: `You register two variables, \`velocityVariable\` and \`positionVariable\`, but FORGET to call \`gpuCompute.setVariableDependencies(...)\` for either before calling \`init()\`. Your \`velocity.frag\` shader has a line \`texture2D(texturePosition, uv)\`.

Explain precisely what happens: does the shader compile, and if so, how do particles move compared to normal? Your answer must trace through the exact "auto-injected uniform" mechanism from this lesson, not a generic guess.`,
    },
    hints: [
      {
        vi: "Dòng `uniform sampler2D texturePosition;` chỉ xuất hiện trong shader khi `init()` xử lý dependency của biến đó — không có dependency, không có dòng đó.",
        en: "The `uniform sampler2D texturePosition;` line only appears in a shader when `init()` processes that variable's dependencies — no dependency, no line.",
      },
      {
        vi: "Trình biên dịch GLSL sẽ báo lỗi ngay khi gặp một identifier chưa từng được khai báo ở đâu cả trong shader.",
        en: "The GLSL compiler errors out the moment it hits an identifier that was never declared anywhere in the shader.",
      },
    ],
    checklist: [
      {
        vi: "Tôi nêu đúng: không có setVariableDependencies → init() không chèn `uniform sampler2D texturePosition;`",
        en: "I correctly state: no setVariableDependencies → init() never prepends `uniform sampler2D texturePosition;`",
      },
      {
        vi: "Tôi kết luận đúng: shader tham chiếu `texturePosition` mà chưa khai báo sẽ LỖI BIÊN DỊCH, không phải chạy sai âm thầm",
        en: "I correctly conclude: a shader referencing `texturePosition` without it declared FAILS TO COMPILE, it doesn't silently misbehave",
      },
      {
        vi: "Tôi phân biệt được trường hợp này với trường hợp shader không tham chiếu texture nào cả (particle đứng yên vì đọc lại đúng frame khởi tạo mãi mãi)",
        en: "I distinguish this from the case where the shader references no texture at all (particles freeze, forever re-reading the same seed frame)",
      },
    ],
    solutionCode: `// Không có setVariableDependencies() → init() không có gì để prepend, nên
// KHÔNG có dòng "uniform sampler2D texturePosition;" nào được chèn vào
// velocity.frag. Dòng texture2D(texturePosition, uv) trong shader của bạn
// tham chiếu một identifier chưa từng được khai báo ở bất kỳ đâu trong
// chương trình — trình biên dịch GLSL báo lỗi "texturePosition: undeclared
// identifier" ngay khi compile. gl.getShaderInfoLog sẽ chứa lỗi này; nếu
// project không tự bắt lỗi compile, tuỳ engine mà bạn nhận về console.error
// hoặc simulation không chạy gì cả vì program không link được.
//
// Nếu shader KHÔNG tham chiếu texture nào (không cần dependency), nó vẫn
// biên dịch OK nhưng chỉ đọc được texture khởi tạo ban đầu (initialValueTexture
// đã render một lần vào cả hai render target lúc init()) — không bao giờ đọc
// được kết quả frame trước, nên trạng thái coi như đứng yên mãi mãi.`,
  },
  {
    id: "wire-a-life-variable",
    kind: "code",
    prompt: {
      vi: `Bạn có sẵn \`gpuCompute\` (đã \`addVariable\` cho \`positionVariable\`/\`velocityVariable\`, CHƯA gọi \`init()\`). Viết code đăng ký thêm một biến \`textureLife\` — kênh R lưu thời gian sống còn lại trong $[0, 1]$ — tự phụ thuộc chính nó, trừ dần \`uDecay\` mỗi frame và quay về $1.0$ khi chạm $0$. Điền texture khởi tạo toàn $1.0$ ở kênh R trước khi \`addVariable\`.`,
      en: `You have \`gpuCompute\` (already \`addVariable\`'d for \`positionVariable\`/\`velocityVariable\`, \`init()\` NOT called yet). Write the code to register an additional \`textureLife\` variable — its R channel holds remaining lifetime in $[0, 1]$ — depending only on itself, decaying by \`uDecay\` each frame and resetting to $1.0$ when it hits $0$. Seed its initial texture's R channel to all $1.0$ before calling \`addVariable\`.`,
    },
    starterCode: `const lifeShader = \`
  uniform float uDecay;
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 life = texture2D(textureLife, uv);
    life.r -= uDecay;
    if (life.r <= 0.0) life.r = 1.0;
    gl_FragColor = life;
  }
\`;

const dtLife = gpuCompute.createTexture();
// TODO: điền dtLife.image.data — kênh R (mỗi 4 số) = 1.0, còn lại tuỳ ý

// TODO: addVariable("textureLife", lifeShader, dtLife)
// TODO: setVariableDependencies — biến này chỉ phụ thuộc chính nó
// TODO: gán uniform uDecay (ví dụ { value: 0.01 }) vào material.uniforms của biến`,
    solutionCode: `const lifeShader = \`
  uniform float uDecay;
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 life = texture2D(textureLife, uv);
    life.r -= uDecay;
    if (life.r <= 0.0) life.r = 1.0;
    gl_FragColor = life;
  }
\`;

const dtLife = gpuCompute.createTexture();
const data = dtLife.image.data;
if (data) {
  for (let i = 0; i < data.length; i += 4) data[i] = 1.0;
}

const lifeVariable = gpuCompute.addVariable("textureLife", lifeShader, dtLife);
gpuCompute.setVariableDependencies(lifeVariable, [lifeVariable]);
lifeVariable.material.uniforms.uDecay = { value: 0.01 };`,
    hints: [
      {
        vi: "`texture.image.data` là mảng phẳng RGBA — kênh R của texel thứ i nằm ở chỉ số `i * 4`, bước nhảy giữa các texel luôn là 4.",
        en: "`texture.image.data` is a flat RGBA array — texel i's R channel sits at index `i * 4`, the stride between texels is always 4.",
      },
      {
        vi: "Tự phụ thuộc chính nó nghĩa là mảng dependency chỉ có đúng một phần tử: `[lifeVariable]`.",
        en: "Depending only on itself means the dependency array has exactly one element: `[lifeVariable]`.",
      },
    ],
    checklist: [
      {
        vi: "dtLife.image.data được điền 1.0 đúng ở mọi kênh R (bước 4, không phải mọi phần tử)",
        en: "dtLife.image.data is filled with 1.0 at every R channel (stride 4, not every element)",
      },
      {
        vi: "setVariableDependencies gọi với mảng đúng một phần tử: chính lifeVariable",
        en: "setVariableDependencies is called with a single-element array: lifeVariable itself",
      },
      {
        vi: "uDecay được gán vào `lifeVariable.material.uniforms`, không phải một object rời không gắn vào material",
        en: "uDecay is assigned onto `lifeVariable.material.uniforms`, not a detached object never attached to the material",
      },
    ],
  },
];
