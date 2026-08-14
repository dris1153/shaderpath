import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "resolveincludes-timing",
    kind: "concept",
    prompt: {
      vi: `Đoạn rút gọn thật từ \`WebGLRenderer.js\` và \`WebGLProgram.js\` (three@0.185.1, thứ tự gọi giữ nguyên):

\`\`\`js
// WebGLRenderer.js — bên trong getProgram()
material.onBeforeCompile( parameters, _this );
program = programCache.acquireProgram( parameters, programCacheKey ); // dựng WebGLProgram thật ở đây

// WebGLProgram.js — bên trong constructor, chạy SAU dòng acquireProgram ở trên
let vertexShader = parameters.vertexShader;
vertexShader = resolveIncludes( vertexShader );
\`\`\`

Tại thời điểm \`material.onBeforeCompile\` của bạn chạy, \`shader.vertexShader\` (chính là \`parameters.vertexShader\`) đang chứa GLSL đã lắp ráp đầy đủ hay vẫn còn nguyên các dòng \`#include <chunk>\` thô? Nếu bạn viết \`shader.vertexShader.replace('vec3 transformed = vec3( position );', '...')\` nhắm vào một MeshStandardMaterial, dòng \`.replace()\` đó có báo lỗi không — và hiệu ứng thực tế quan sát được trên màn hình là gì?`,
      en: `A trimmed but real excerpt from \`WebGLRenderer.js\` and \`WebGLProgram.js\` (three@0.185.1, call order preserved):

\`\`\`js
// WebGLRenderer.js — inside getProgram()
material.onBeforeCompile( parameters, _this );
program = programCache.acquireProgram( parameters, programCacheKey ); // the real WebGLProgram is built here

// WebGLProgram.js — inside the constructor, runs AFTER the acquireProgram line above
let vertexShader = parameters.vertexShader;
vertexShader = resolveIncludes( vertexShader );
\`\`\`

At the moment your \`material.onBeforeCompile\` runs, is \`shader.vertexShader\` (the same object as \`parameters.vertexShader\`) already fully assembled GLSL, or does it still contain raw \`#include <chunk>\` lines? If you write \`shader.vertexShader.replace('vec3 transformed = vec3( position );', '...')\` targeting a MeshStandardMaterial, does that \`.replace()\` throw an error — and what's the actual effect you'd observe on screen?`,
    },
    hints: [
      {
        vi: "So khớp thứ tự hai dòng trong đoạn trích: onBeforeCompile nằm TRƯỚC dòng thật sự dựng WebGLProgram (chứa resolveIncludes). Cái gì chạy trước không thể thấy kết quả của cái chạy sau.",
        en: "Match the order of the two lines in the excerpt: onBeforeCompile sits BEFORE the line that actually builds WebGLProgram (which contains resolveIncludes). Whatever runs first can't see the output of what runs after it.",
      },
      {
        vi: "String.prototype.replace(oldStr, newStr) của JavaScript không ném lỗi khi oldStr không khớp bất kỳ đâu trong chuỗi — nó chỉ trả về nguyên văn chuỗi gốc, không đổi gì.",
        en: "JavaScript's String.prototype.replace(oldStr, newStr) throws no error when oldStr doesn't match anywhere in the string — it just returns the original string unchanged.",
      },
    ],
    checklist: [
      {
        vi: "Tôi chỉ đúng: onBeforeCompile chạy TRƯỚC resolveIncludes, nên shader.vertexShader lúc đó vẫn là #include thô, chưa lắp ráp",
        en: "I correctly identified that onBeforeCompile runs BEFORE resolveIncludes, so shader.vertexShader at that point is still the raw #include text, not yet assembled",
      },
      {
        vi: "Tôi giải thích được .replace() nhắm sai chuỗi không báo lỗi, chỉ âm thầm không có tác dụng gì",
        en: "I can explain that .replace() targeting the wrong string throws no error — it just silently has no effect",
      },
      {
        vi: "Tôi nêu được cách sửa đúng: nhắm .replace() vào chính marker #include <begin_vertex>, giữ nguyên marker và nối thêm code sau nó",
        en: "I can state the correct fix: target .replace() at the #include <begin_vertex> marker itself, keeping the marker intact and appending code after it",
      },
    ],
    solutionCode: `// shader.vertexShader tại thời điểm onBeforeCompile vẫn CHỨA nguyên văn:
//   #include <begin_vertex>
// KHÔNG chứa "vec3 transformed = vec3( position );" — dòng đó chỉ xuất
// hiện sau khi resolveIncludes() chạy, và điều đó xảy ra TRONG WebGLProgram,
// tức là SAU khi onBeforeCompile đã hoàn tất.
//
// .replace('vec3 transformed = vec3( position );', '...') không tìm thấy
// chuỗi khớp -> JS trả về y nguyên shader.vertexShader, không lỗi, không
// thay đổi -> hiệu ứng "biến mất": mesh vẫn render, lighting vẫn đúng,
// nhưng hiệu ứng tuỳ biến bạn viết không bao giờ xuất hiện.
//
// Sửa đúng:
shader.vertexShader = shader.vertexShader.replace(
  "#include <begin_vertex>",
  "#include <begin_vertex>\\n  transformed.y += 0.1;", // marker giữ nguyên
);`,
  },
  {
    id: "chunk-splice-tint",
    kind: "shader",
    prompt: {
      vi: `Trong playground (uTime, uResolution, uMouse, fragColor có sẵn), starter code đã có hai "chunk" nối tiếp nhau đúng cách Three ghép \`#include\`: \`base_color\` tính một gradient theo thời gian vào biến \`color\`, và \`opaque_output\` ghi \`fragColor\` cuối cùng — y hệt cặp \`color_fragment\` rồi \`opaque_fragment\` thật trong \`meshphysical.glsl.js\`. Hãy chèn một chunk mới, \`tint_fragment\`, vào ĐÚNG giữa hai chunk đó: nhân \`color\` với một màu tint biến thiên theo \`uMouse.x\` (dùng \`mix\`). Vị trí chèn quan trọng — chunk phải chạy sau khi \`color\` đã có giá trị base nhưng trước khi \`opaque_output\` đọc \`color\` lần cuối.`,
      en: `In the playground (uTime, uResolution, uMouse, fragColor are all available), the starter already splices two "chunks" together the way Three joins \`#include\`s: \`base_color\` computes a time-based gradient into \`color\`, and \`opaque_output\` writes the final \`fragColor\` — mirroring the real \`color_fragment\` then \`opaque_fragment\` pair in \`meshphysical.glsl.js\`. Insert a new chunk, \`tint_fragment\`, in the CORRECT spot between the two: multiply \`color\` by a tint that varies with \`uMouse.x\` (use \`mix\`). Placement matters — the chunk must run after \`color\` already holds its base value but before \`opaque_output\` reads \`color\` for the last time.`,
    },
    starterCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  // chunk: base_color
  vec3 color = 0.5 + 0.5 * cos(uTime + uv.xyx + vec3(0.0, 2.0, 4.0));

  // TODO chunk: tint_fragment — insert here, AFTER base_color and BEFORE
  // opaque_output. Multiply color by mix(colorA, colorB, uMouse.x).

  // chunk: opaque_output
  fragColor = vec4(color, 1.0);
}`,
    solutionCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  // chunk: base_color
  vec3 color = 0.5 + 0.5 * cos(uTime + uv.xyx + vec3(0.0, 2.0, 4.0));

  // chunk: tint_fragment
  vec3 tint = mix(vec3(1.0, 0.4, 0.4), vec3(0.4, 0.6, 1.0), uMouse.x);
  color *= tint;

  // chunk: opaque_output
  fragColor = vec4(color, 1.0);
}`,
    hints: [
      {
        vi: "Chèn code ngay dưới dòng comment `// chunk: base_color` cuối cùng và phía trên `// chunk: opaque_output` — đúng vị trí giữ nguyên ý tưởng #include chạy tuần tự theo thứ tự viết.",
        en: "Insert your code right below the last line of the `// chunk: base_color` block and above `// chunk: opaque_output` — the same spot preserves the idea that #includes run sequentially in written order.",
      },
      {
        vi: "`mix(a, b, t)` với t = uMouse.x (đã nằm trong [0,1]) nội suy tuyến tính giữa hai màu — không cần clamp thêm.",
        en: "`mix(a, b, t)` with t = uMouse.x (already in [0,1]) linearly interpolates between two colors — no extra clamping needed.",
      },
    ],
    checklist: [
      {
        vi: "Di chuyển chuột ngang qua canvas đổi rõ tông màu tổng thể, từ đỏ nhạt sang xanh nhạt",
        en: "Moving the mouse horizontally across the canvas visibly shifts the overall tint, from pale red to pale blue",
      },
      {
        vi: "Gradient nền theo thời gian (base_color) vẫn còn thấy được, không bị tint che mất hoàn toàn",
        en: "The time-based background gradient (base_color) is still visible, not completely masked by the tint",
      },
      {
        vi: "Code chèn nằm đúng giữa base_color và opaque_output, không nằm trước hoặc sau cả hai",
        en: "The inserted code sits correctly between base_color and opaque_output, not before or after both",
      },
    ],
  },
];
