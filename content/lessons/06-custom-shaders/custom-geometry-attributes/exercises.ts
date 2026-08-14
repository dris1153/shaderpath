import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "attribute-vs-uniform-vertex-count",
    kind: "concept",
    prompt: {
      vi: `Một \`THREE.SphereGeometry(1, 64, 64)\` (widthSegments = heightSegments = 64) dùng đúng công thức lưới của lesson này: $(\\text{widthSegments}+1)\\times(\\text{heightSegments}+1)$ vertex.

(a) Tính số vertex chính xác.

(b) Nếu biên độ dịch chuyển là một **uniform**, có bao nhiêu giá trị biên độ KHÁC NHAU tồn tại trong một draw call vẽ trọn mặt cầu? Nếu biên độ đó thay bằng một **attribute** \`aWeight\` per-vertex, con số đó là bao nhiêu?

(c) Dọc theo đường nối kinh tuyến $\\phi = 0$ (cột $u=0$ và cột $u=1$ của lưới), có bao nhiêu CẶP vertex trùng toạ độ 3D nhưng mang index khác nhau?`,
      en: `A \`THREE.SphereGeometry(1, 64, 64)\` (widthSegments = heightSegments = 64) follows this lesson's exact grid formula: $(\\text{widthSegments}+1)\\times(\\text{heightSegments}+1)$ vertices.

(a) Compute the exact vertex count.

(b) If the displacement amplitude were a **uniform**, how many DIFFERENT amplitude values exist across one draw call that renders the whole sphere? If that amplitude were instead a per-vertex **attribute** \`aWeight\`, what's that count?

(c) Along the $\\phi = 0$ seam (the grid's $u=0$ and $u=1$ columns), how many PAIRS of vertices share the same 3D position but carry different indices?`,
    },
    hints: [
      {
        vi: "65 × 65 chỉ là phép nhân trực tiếp — đừng nhầm với số tam giác (khác công thức, dùng widthSegments × heightSegments × 2).",
        en: "65 × 65 is a direct multiplication — don't confuse it with the triangle count (a different formula: widthSegments × heightSegments × 2).",
      },
      {
        vi: "Mỗi hàng (mỗi giá trị iy từ 0 đến heightSegments) đóng góp đúng một cặp trùng vị trí ở cột đầu/cuối — đếm số hàng, không phải số cột.",
        en: "Each row (each iy from 0 to heightSegments) contributes exactly one position-matching pair at its first/last column — count rows, not columns.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng 4225 vertex (65 × 65)",
        en: "I correctly computed 4225 vertices (65 × 65)",
      },
      {
        vi: "Tôi trả lời đúng: uniform = 1 giá trị cho cả draw call, attribute = tối đa 4225 giá trị khác nhau",
        en: "I correctly answered: uniform = 1 value for the whole draw call, attribute = up to 4225 different values",
      },
      {
        vi: "Tôi trả lời đúng 65 cặp vertex trùng vị trí dọc đường nối (một cặp mỗi hàng, heightSegments + 1 hàng)",
        en: "I correctly answered 65 position-matching pairs along the seam (one pair per row, heightSegments + 1 rows)",
      },
    ],
    solutionNote: {
      vi: `(a) $(64 + 1) \\times (64 + 1) = 65 \\times 65 = 4225$ vertex.

(b) uniform: đúng 1 giá trị — mọi lần vertex shader chạy trong draw call đó đọc CÙNG một số từ bộ nhớ uniform, không đổi cho tới draw call sau. attribute: tối đa 4225 giá trị khác nhau — mỗi lần vertex shader chạy (mỗi vertex) đọc đúng một dòng riêng trong buffer, độc lập với các lần chạy khác. Đây chính là "data-rate triangle" của Track 1, chỉ thay context từ WebGL thuần sang Three.js.

(c) $\\text{heightSegments} + 1 = 65$ cặp — mỗi hàng \`iy\` (0..64) có một vertex tại cột \`ix=0\` (\`u=0\`) và một vertex khác tại \`ix=64\` (\`u=1\`) cùng toạ độ (x,y,z) nhưng hai INDEX riêng biệt trong mảng position/attribute.`,
      en: `(a) $(64 + 1) \\times (64 + 1) = 65 \\times 65 = 4225$ vertices.

(b) uniform: exactly 1 value — every vertex shader invocation in that draw call reads the SAME number from uniform memory, unchanged until the next draw call. attribute: up to 4225 different values — every vertex shader invocation (each vertex) reads its own separate row in the buffer, independent of every other invocation. This is exactly Track 1's "data-rate triangle", just moved from raw WebGL into Three.js.

(c) $\\text{heightSegments} + 1 = 65$ pairs — each row \`iy\` (0..64) has one vertex at column \`ix=0\` (\`u=0\`) and another at \`ix=64\` (\`u=1\`) sharing the same (x,y,z) position but two separate INDICES in the position/attribute arrays.`,
    },
  },
  {
    id: "playground-per-fragment-hash",
    kind: "shader",
    prompt: {
      vi: `Trong playground (uTime, uResolution, uMouse, fragColor có sẵn), viết một hàm hash \`hash21(vec2 p)\` trả về một số giả-ngẫu-nhiên trong $[0,1)$ từ toạ độ 2D, dùng nó để tô mỗi ô của một lưới $8\\times8$ trên màn hình bằng một mức xám ngẫu nhiên khác nhau — KHÔNG dùng texture, KHÔNG dùng biến ngoài.

Đây là kỹ thuật ngược với bài học: thay vì upload sẵn một mảng số ngẫu nhiên (attribute) từ CPU, GPU tự "bịa" ra số ngẫu nhiên ngay trong fragment shader từ toạ độ đầu vào. Viết xong, hãy tự hỏi: kỹ thuật này có thay thế được \`aWeight\` (trọng số vẽ tay) trong demo không — và vì sao có/không?`,
      en: `In the playground (uTime, uResolution, uMouse, fragColor are all available), write a hash function \`hash21(vec2 p)\` returning a pseudo-random number in $[0,1)$ from a 2D coordinate, and use it to shade each cell of an $8\\times8$ screen-space grid with a different random gray level — NO texture, NO external variable.

This is the inverse technique from the lesson: instead of uploading a precomputed random array (an attribute) from the CPU, the GPU "invents" the random number on the fly, inside the fragment shader, purely from the input coordinate. Once it works, ask yourself: could this technique replace \`aWeight\` (the hand-painted weight) in the demo — why or why not?`,
    },
    starterCode: `float hash21(vec2 p) {
  // TODO 1: mix p into a pseudo-random number in [0,1)
  // classic hint: fract(sin(dot(p, vec2(a, b))) * c) with a,b,c large, odd constants
  return 0.0;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  // TODO 2: divide uv into an 8x8 grid, get the CELL coordinate (not the pixel coordinate)
  vec2 cell = vec2(0.0);

  float g = hash21(cell);
  fragColor = vec4(vec3(g), 1.0);
}`,
    solutionCode: `float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  vec2 cell = floor(uv * 8.0);

  float g = hash21(cell);
  fragColor = vec4(vec3(g), 1.0);
}`,
    hints: [
      {
        vi: "`floor(uv * 8.0)` gộp mọi pixel trong cùng một ô 8x8 về đúng MỘT cặp số nguyên — đó là input cần cho hash, không phải `uv` thô (nếu dùng `uv` thô, mỗi pixel ra một màu, không phải mỗi ô).",
        en: "`floor(uv * 8.0)` collapses every pixel inside the same 8x8 cell down to ONE integer pair — that's the hash input, not raw `uv` (raw `uv` gives every pixel its own color, not every cell).",
      },
      {
        vi: "Hằng số trong `sin(dot(p, vec2(a,b))) * c` không có ý nghĩa toán học đặc biệt — chỉ cần đủ lớn/lẻ để khuếch đại độ nhạy của `sin`, tạo cảm giác 'ngẫu nhiên'. Đổi hằng số vẫn ra pattern hợp lệ, chỉ khác 'seed'.",
        en: "The constants in `sin(dot(p, vec2(a,b))) * c` have no special mathematical meaning — they just need to be large/odd enough to amplify `sin`'s sensitivity into something that looks random. Different constants still give a valid pattern, just a different 'seed'.",
      },
    ],
    checklist: [
      {
        vi: "Màn hình chia rõ 8x8 ô, mỗi ô một mức xám khác nhau, không đổi theo thời gian",
        en: "The screen shows a clear 8x8 grid, each cell a different gray level, unchanging over time",
      },
      {
        vi: "Di chuyển chuột không ảnh hưởng kết quả (hash chỉ phụ thuộc toạ độ ô, không dùng uMouse)",
        en: "Moving the mouse doesn't affect the result (the hash depends only on the cell coordinate, not uMouse)",
      },
      {
        vi: "Trả lời được câu hỏi cuối: hash per-fragment KHÔNG thay được aWeight, vì aWeight là dữ liệu tác giả tự vẽ theo ý muốn (một gradient cụ thể theo Y) — hash chỉ tạo được nhiễu ngẫu nhiên, không tạo được một hình dạng có chủ đích",
        en: "Answered the closing question: a per-fragment hash CANNOT replace aWeight, because aWeight is authored data painted on purpose (a specific Y-based gradient) — a hash only produces random noise, not an intentional shape",
      },
    ],
  },
  {
    id: "write-random-attribute-helper",
    kind: "code",
    prompt: {
      vi: `Viết một hàm TypeScript \`addRandomAttribute(geometry, name)\` gắn một \`THREE.BufferAttribute\` mới (itemSize 1, một số ngẫu nhiên $[0,1)$ cho mỗi vertex) vào \`geometry\` dưới tên \`name\`, dùng đúng \`geometry.attributes.position.count\` để biết cần bao nhiêu phần tử — KHÔNG hardcode số vertex.`,
      en: `Write a TypeScript function \`addRandomAttribute(geometry, name)\` that attaches a new \`THREE.BufferAttribute\` (itemSize 1, a random $[0,1)$ number per vertex) to \`geometry\` under the key \`name\`, using \`geometry.attributes.position.count\` to know how many entries are needed — do NOT hardcode the vertex count.`,
    },
    starterCode: `import * as THREE from "three";

function addRandomAttribute(geometry: THREE.BufferGeometry, name: string) {
  // TODO 1: get the vertex count from geometry.attributes.position.count (don't hardcode)
  const count = 0;

  // TODO 2: create a Float32Array of the right length, fill it with Math.random() per element
  const data = new Float32Array(0);

  // TODO 3: wrap data into a BufferAttribute (itemSize 1) and setAttribute it on geometry
}`,
    solutionCode: `import * as THREE from "three";

function addRandomAttribute(geometry: THREE.BufferGeometry, name: string) {
  const position = geometry.attributes.position;
  const count = position ? position.count : 0;

  const data = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    data[i] = Math.random();
  }

  geometry.setAttribute(name, new THREE.BufferAttribute(data, 1));
}`,
    hints: [
      {
        vi: "`geometry.attributes.position` có thể không tồn tại về mặt kiểu dữ liệu (TypeScript strict) — kiểm tra trước khi đọc `.count`, đừng ép kiểu (`as`) để bỏ qua kiểm tra.",
        en: "`geometry.attributes.position` may be typed as possibly missing (TypeScript strict) — check it before reading `.count`, don't cast (`as`) your way past the check.",
      },
      {
        vi: "itemSize là 1 vì đây là một số vô hướng mỗi vertex — không phải 3, khác với `position`/`normal`.",
        en: "itemSize is 1 because this is one scalar per vertex — not 3, unlike position/normal.",
      },
    ],
    checklist: [
      {
        vi: "Số phần tử của Float32Array đúng bằng geometry.attributes.position.count, không hardcode",
        en: "The Float32Array's length exactly matches geometry.attributes.position.count, not hardcoded",
      },
      {
        vi: "BufferAttribute tạo với itemSize 1",
        en: "The BufferAttribute is created with itemSize 1",
      },
      {
        vi: "Gọi geometry.setAttribute đúng tên truyền vào tham số name",
        en: "geometry.setAttribute is called with the exact name passed via the name parameter",
      },
    ],
  },
];
