import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "trace-composer-buffer-state",
    kind: "concept",
    prompt: {
      vi: `Một composer có đúng bốn pass theo thứ tự: \`RenderPass\`, \`ShaderPass A\` (\`enabled: true\`), \`ShaderPass B\` (\`enabled: false\`), \`OutputPass\`. Composer bắt đầu với \`readBuffer = target2\`, \`writeBuffer = target1\`.

Không chạy code, hãy lần theo đúng vòng lặp \`render()\` (mỗi pass: render rồi swap nếu \`needsSwap\`) để trả lời: \`OutputPass\` cuối cùng đọc texture từ target nào — \`target1\` hay \`target2\`? Sau đó trả lời tiếp: nếu bật \`ShaderPass B\` lên \`enabled: true\`, câu trả lời có đổi không, và vì sao?`,
      en: `A composer has exactly four passes in order: \`RenderPass\`, \`ShaderPass A\` (\`enabled: true\`), \`ShaderPass B\` (\`enabled: false\`), \`OutputPass\`. The composer starts with \`readBuffer = target2\`, \`writeBuffer = target1\`.

Without running any code, trace through the real \`render()\` loop (each pass: render, then swap if \`needsSwap\`) to answer: which target does \`OutputPass\` end up reading its texture from — \`target1\` or \`target2\`? Then answer: if \`ShaderPass B\` is switched to \`enabled: true\`, does the answer change, and why?`,
    },
    hints: [
      {
        vi: "RenderPass ghi thẳng vào readBuffer và không swap (needsSwap = false) — sau RenderPass, readBuffer vẫn là target2, chưa đổi gì.",
        en: "RenderPass writes straight into readBuffer and never swaps (needsSwap = false) — after RenderPass, readBuffer is still target2, unchanged.",
      },
      {
        vi: "ShaderPass A chạy, ghi vào writeBuffer (target1), rồi swap vì needsSwap mặc định true — readBuffer/writeBuffer đổi vai trò sau đó. Pass bị enabled: false hoàn toàn không chạy, không swap.",
        en: "ShaderPass A runs, writes into writeBuffer (target1), then swaps since needsSwap defaults to true — readBuffer/writeBuffer trade roles afterward. A pass with enabled: false doesn't run at all, so it never swaps.",
      },
    ],
    checklist: [
      {
        vi: "Tôi xác định đúng RenderPass không đổi readBuffer (vẫn target2) vì needsSwap = false",
        en: "I correctly identify that RenderPass leaves readBuffer unchanged (still target2) since needsSwap = false",
      },
      {
        vi: "Tôi lần đúng một lượt swap duy nhất sau ShaderPass A, kết luận OutputPass đọc target1",
        en: "I trace exactly one swap after ShaderPass A and conclude OutputPass reads target1",
      },
      {
        vi: "Tôi giải thích được bật ShaderPass B không đổi kết quả cuối vì nó chỉ thêm một swap NỮA (ghi rồi swap lại), quay về đọc target1 — số swap chẵn hay lẻ mới là thứ quyết định, không phải số pass",
        en: "I explain that enabling ShaderPass B doesn't change the final answer because it just adds one MORE swap (write then swap back), landing on target1 again — the swap count's parity decides the outcome, not the pass count",
      },
    ],
    solutionCode: `// RenderPass: renderToScreen=false -> ghi vào readBuffer (target2), needsSwap=false -> không swap
// readBuffer=target2, writeBuffer=target1 (không đổi)

// ShaderPass A (enabled): đọc tDiffuse=target2.texture, ghi vào writeBuffer=target1
// needsSwap=true (mặc định) -> swap: readBuffer=target1, writeBuffer=target2

// ShaderPass B (enabled:false): composer "continue" ngay đầu vòng lặp, không render, không swap

// OutputPass: đọc tDiffuse = readBuffer.texture = target1.texture -> ĐÁP ÁN: target1

// Nếu bật ShaderPass B: nó đọc target1, ghi vào target2 (writeBuffer hiện tại),
// rồi swap -> readBuffer quay lại target1. OutputPass vẫn đọc target1 — không đổi,
// vì swap có tính CHẴN/LẺ: hai swap liên tiếp quay lại đúng vai trò ban đầu.`,
  },
  {
    id: "write-grayscale-shader-pass",
    kind: "code",
    prompt: {
      vi: `Viết một object shader tương thích với \`ShaderPass\` (như \`CopyShader\`/\`LuminosityHighPassShader\` trong three.js) để chuyển ảnh sang thang xám bằng công thức luminance chuẩn $Y = 0.2126R + 0.7152G + 0.0722B$. Object phải tự khai đúng \`uniforms\`, \`vertexShader\`, \`fragmentShader\` và tuân thủ quy ước \`tDiffuse\` để \`new ShaderPass(grayscaleShader)\` hoạt động đúng không cần sửa gì thêm.`,
      en: `Write a \`ShaderPass\`-compatible shader object (like three.js's own \`CopyShader\`/\`LuminosityHighPassShader\`) that converts the image to grayscale using the standard luminance formula $Y = 0.2126R + 0.7152G + 0.0722B$. The object must declare its own \`uniforms\`, \`vertexShader\`, \`fragmentShader\` and follow the \`tDiffuse\` convention so that \`new ShaderPass(grayscaleShader)\` works correctly with no further wiring.`,
    },
    starterCode: `export const GrayscaleShader = {
  name: "GrayscaleShader",
  uniforms: {
    tDiffuse: { value: null },
  },
  vertexShader: /* glsl */ \`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  \`,
  fragmentShader: /* glsl */ \`
    uniform sampler2D tDiffuse;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      // TODO: tính luminance Y = 0.2126*R + 0.7152*G + 0.0722*B
      // TODO: gl_FragColor = vec4(vec3(Y), texel.a)
      gl_FragColor = texel;
    }
  \`,
};`,
    solutionCode: `export const GrayscaleShader = {
  name: "GrayscaleShader",
  uniforms: {
    tDiffuse: { value: null },
  },
  vertexShader: /* glsl */ \`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  \`,
  fragmentShader: /* glsl */ \`
    uniform sampler2D tDiffuse;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      float y = dot(texel.rgb, vec3(0.2126, 0.7152, 0.0722));
      gl_FragColor = vec4(vec3(y), texel.a);
    }
  \`,
};

// usage: composer.addPass(new ShaderPass(GrayscaleShader));`,
    hints: [
      {
        vi: "ShaderPass tự gán uniforms.tDiffuse.value = readBuffer.texture mỗi frame — object chỉ cần khai đúng TÊN uniform này, không cần tự cập nhật value.",
        en: "ShaderPass auto-assigns uniforms.tDiffuse.value = readBuffer.texture every frame — the object just needs to declare that exact uniform NAME, no manual value updates needed.",
      },
      {
        vi: "dot(rgb, vec3(0.2126, 0.7152, 0.0722)) tính đúng luminance trong một dòng — nhanh hơn ba phép nhân cộng tách rời.",
        en: "dot(rgb, vec3(0.2126, 0.7152, 0.0722)) computes luminance in one line — faster than three separate multiply-adds.",
      },
    ],
    checklist: [
      {
        vi: "uniforms có đúng key tDiffuse với value: null ban đầu",
        en: "uniforms has exactly the key tDiffuse with an initial value: null",
      },
      {
        vi: "fragmentShader tính Y bằng đúng ba hệ số 0.2126/0.7152/0.0722",
        en: "fragmentShader computes Y using exactly the 0.2126/0.7152/0.0722 coefficients",
      },
      {
        vi: "gl_FragColor giữ nguyên kênh alpha gốc (texel.a), không hardcode 1.0",
        en: "gl_FragColor preserves the original alpha channel (texel.a) instead of hardcoding 1.0",
      },
    ],
  },
];
