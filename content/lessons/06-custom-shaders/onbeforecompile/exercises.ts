import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "cache-key-collision",
    kind: "concept",
    prompt: {
      vi: `Bạn viết một factory \`function makeMaterial(effectOn) { const m = new THREE.MeshStandardMaterial(); m.onBeforeCompile = (shader) => { if (effectOn) { /* chèn code xoắn */ } }; return m; }\`, rồi gọi \`makeMaterial(true)\` và \`makeMaterial(false)\` để tạo hai material, gán luân phiên vào cùng một mesh qua một nút bật/tắt — không set \`customProgramCacheKey\` ở đâu cả.

Dự đoán: lần đầu bấm nút để chuyển từ material này sang material kia, chuyện gì xảy ra trên màn hình? Giải thích bằng đúng cơ chế \`customProgramCacheKey\` mặc định của Three (gợi ý: nó gọi \`.toString()\` lên cái gì, và \`.toString()\` có nhìn thấy giá trị của biến đóng gói \`effectOn\` hay không), rồi viết đúng một dòng code sửa lỗi này.`,
      en: `You write a factory \`function makeMaterial(effectOn) { const m = new THREE.MeshStandardMaterial(); m.onBeforeCompile = (shader) => { if (effectOn) { /* inject twist code */ } }; return m; }\`, then call \`makeMaterial(true)\` and \`makeMaterial(false)\` to build two materials, swapping them onto the same mesh via a toggle button — without setting \`customProgramCacheKey\` anywhere.

Predict: the first time you flip the toggle from one material to the other, what happens on screen? Explain it using Three's actual default \`customProgramCacheKey\` mechanism (hint: what does it call \`.toString()\` on, and can \`.toString()\` see the value of the closed-over \`effectOn\` variable?), then write the one line of code that fixes it.`,
    },
    hints: [
      {
        vi: "Material mặc định định nghĩa \`customProgramCacheKey() { return this.onBeforeCompile.toString(); }\` — đây là VĂN BẢN mã nguồn của hàm, không phải hành vi lúc chạy.",
        en: "Material's default is `customProgramCacheKey() { return this.onBeforeCompile.toString(); }` — that's the function's SOURCE TEXT, not its runtime behavior.",
      },
      {
        vi: "Hai closure được tạo từ đúng một dòng khai báo hàm mũi tên (chỉ khác biến \`effectOn\` đóng gói bên trong) sẽ cho ra chuỗi \`.toString()\` giống hệt nhau — JavaScript không có cách nào để \`.toString()\` \"nhìn vào\" giá trị đóng gói.",
        en: "Two closures created from the exact same arrow-function literal (differing only in the `effectOn` value they close over) stringify identically — JavaScript gives `.toString()` no way to peek at closed-over values.",
      },
    ],
    checklist: [
      {
        vi: "Nêu đúng hậu quả: hai material dùng chung một cache key mặc định, nên Three tái sử dụng đúng MỘT chương trình đã compile — material thứ hai bị \"lộ\" đúng hiệu ứng của material thứ nhất, đổi qua đổi lại không thấy khác biệt",
        en: "States the correct consequence: both materials land on the same default cache key, so Three reuses ONE compiled program — the second material silently gets the first one's effect, and toggling shows no visible difference",
      },
      {
        vi: "Giải thích đúng cơ chế: \`customProgramCacheKey()\` mặc định gọi \`.toString()\` lên hàm \`onBeforeCompile\`, và văn bản hàm giống hệt nhau dù \`effectOn\` khác nhau",
        en: "Correctly explains the mechanism: the default `customProgramCacheKey()` calls `.toString()` on the `onBeforeCompile` function, and the function text is identical regardless of `effectOn`",
      },
      {
        vi: "Đưa ra đúng bản sửa: \`m.customProgramCacheKey = () => String(effectOn);\` (hoặc tương đương) — trả về chuỗi phân biệt theo biến thể thực tế, không phụ thuộc văn bản hàm",
        en: "Provides the correct fix: `m.customProgramCacheKey = () => String(effectOn);` (or equivalent) — returning a string that varies with the actual variant, not the function's text",
      },
    ],
    solutionCode: `// Both makeMaterial(true) and makeMaterial(false) assign the SAME arrow
// function literal to onBeforeCompile - only the closed-over "effectOn"
// differs at runtime. Function.prototype.toString() returns source text,
// so both closures stringify identically, and Three's default
// customProgramCacheKey() (= this.onBeforeCompile.toString()) can't tell
// them apart. Result: whichever material compiles FIRST gets cached under
// that key; the second material's onBeforeCompile still runs, but
// acquireProgram() finds the existing cache entry and reuses that program
// instead of the freshly-injected shader source - the toggle looks broken.
//
// Fix: give each variant its own explicit cache key.
m.customProgramCacheKey = () => String(effectOn);`,
  },
  {
    id: "prototype-twist-band-in-playground",
    kind: "shader",
    prompt: {
      vi: `Trong playground (\`uTime\`, \`uResolution\`, \`uMouse\`, \`fragColor\` có sẵn), viết fragment shader mô phỏng bằng 2D thuần — không có mesh — chính công thức bạn sẽ chèn vào \`onBeforeCompile\`: xoay toạ độ \`p\` một góc tỉ lệ với \`p.y\` (đứng vai \`uTwist * transformed.y\`) bằng \`mat2\`, rồi tô một dải màu hai tông chạy theo toạ độ \`y\` đã xoay, animate nhẹ theo \`uTime\`.`,
      en: `In the playground (\`uTime\`, \`uResolution\`, \`uMouse\`, \`fragColor\` are all available), write a fragment shader that prototypes — in plain 2D, no mesh involved — the exact formula you'll inject into \`onBeforeCompile\`: rotate coordinate \`p\` by an angle proportional to \`p.y\` (standing in for \`uTwist * transformed.y\`) using a \`mat2\`, then paint a two-tone band running along the rotated \`y\` coordinate, animated lightly by \`uTime\`.`,
    },
    starterCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = (uv - 0.5) * 2.0;

  // TODO 1: build an angle proportional to p.y (stand-in for uTwist *
  // transformed.y), then rotate p by it with a mat2 (column-major:
  // mat2(c, s, -s, c) for a counter-clockwise rotation).
  vec2 twisted = p;

  // TODO 2: turn twisted.y into an animated 0..1 band with
  // sin(twisted.y * 6.0 + uTime) * 0.5 + 0.5, then mix() two colors by it.
  vec3 color = vec3(twisted, 0.5);

  fragColor = vec4(color, 1.0);
}`,
    solutionCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = (uv - 0.5) * 2.0;

  float angle = 1.2 * p.y;
  float c = cos(angle);
  float s = sin(angle);
  vec2 twisted = mat2(c, s, -s, c) * p;

  float band = sin(twisted.y * 6.0 + uTime) * 0.5 + 0.5;
  vec3 color = mix(vec3(0.15, 0.55, 0.9), vec3(0.95, 0.35, 0.15), band);

  fragColor = vec4(color, 1.0);
}`,
    hints: [
      {
        vi: "\`mat2\` là constructor cột: \`mat2(c, s, -s, c)\` tạo cột 0 = (c, s), cột 1 = (-s, c) — đúng ma trận xoay ngược kim đồng hồ đã học ở Track 2.",
        en: "`mat2` fills columns: `mat2(c, s, -s, c)` builds column 0 = (c, s), column 1 = (-s, c) — the same counter-clockwise rotation matrix from the Track 2 matrix lesson.",
      },
      {
        vi: "Công thức dải màu ở đây chính là thứ bạn sẽ dán gần như nguyên văn vào chunk \`#include <color_fragment>\` sau này — chỉ khác biến \`vBand\` thay cho \`twisted.y\`.",
        en: "This band formula is almost exactly what you'll paste into the `#include <color_fragment>` chunk later — just swap `twisted.y` for the varying `vBand`.",
      },
    ],
    checklist: [
      {
        vi: "Gradient hiển thị rõ ràng bị xoắn/vặn so với một gradient dọc thẳng thông thường",
        en: "The gradient is visibly twisted/warped compared to a plain vertical gradient",
      },
      {
        vi: "Dải màu chuyển tông mượt (không răng cưa cứng) giữa hai màu đã chọn",
        en: "The band transitions smoothly (no hard jaggies) between the two chosen colors",
      },
      {
        vi: "Dải màu di chuyển/animate theo thời gian nhờ \`uTime\` trong công thức \`sin\`",
        en: "The band animates over time thanks to `uTime` inside the `sin` formula",
      },
    ],
  },
];
