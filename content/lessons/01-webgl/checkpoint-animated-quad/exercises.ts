import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-animated-quad",
    kind: "build",
    prompt: {
      vi: `Dựng một quad xoay bằng WebGL2 thuần: 4 đỉnh, mỗi đỉnh một màu riêng (attribute \`aColor\`), nối thành 2 tam giác qua \`gl.drawElements\` với một index buffer 6 phần tử — không lặp toạ độ đỉnh dùng chung giữa 2 tam giác. Quad xoay quanh tâm nhờ một uniform \`uTime\` cập nhật mỗi frame, với ma trận xoay \`mat2\` tính ngay trong vertex shader từ \`uTime\` (\`cos\`, \`sin\`). Không dùng thư viện ngoài.

Gợi ý cấu trúc: buffer interleaved \`x, y, r, g, b\` cho 4 đỉnh (giống bài Tam giác đầu tiên), cộng thêm một \`ELEMENT_ARRAY_BUFFER\` chứa 6 chỉ số mô tả 2 tam giác.`,
      en: `Build a rotating quad in raw WebGL2: 4 vertices, each with its own color (\`aColor\` attribute), joined into 2 triangles via \`gl.drawElements\` with a 6-element index buffer — no duplicated shared vertex coordinates between the two triangles. The quad spins around its center through a \`uTime\` uniform updated every frame, with the \`mat2\` rotation matrix computed right inside the vertex shader from \`uTime\` (\`cos\`, \`sin\`). No external libraries.

Suggested structure: an interleaved \`x, y, r, g, b\` buffer for the 4 vertices (like Your First Triangle), plus an \`ELEMENT_ARRAY_BUFFER\` holding 6 indices describing the 2 triangles.`,
    },
    starterCode: `const canvas = document.querySelector("canvas")!;
const gl = canvas.getContext("webgl2")!;

const vertexSrc = \`#version 300 es
in vec2 aPosition;
in vec3 aColor;
uniform float uTime;
out vec3 vColor;

void main() {
  // TODO 3: compute the rotation angle from uTime, build a mat2, multiply it into aPosition
  vColor = aColor;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}\`;

const fragmentSrc = \`#version 300 es
precision highp float;
in vec3 vColor;
out vec4 outColor;

void main() {
  outColor = vec4(vColor, 1.0);
}\`;

function compile(type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "compile failed");
  }
  return shader;
}

const program = gl.createProgram()!;
gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSrc));
gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSrc));
gl.linkProgram(program);
gl.useProgram(program);

// 4 corners: x, y, r, g, b interleaved (stride 20 bytes)
// prettier-ignore
const vertices = new Float32Array([
  -0.5,  0.5, 1, 0.3, 0.3, // top-left
   0.5,  0.5, 0.3, 1, 0.3, // top-right
   0.5, -0.5, 0.3, 0.3, 1, // bottom-right
  -0.5, -0.5, 1, 1, 0.3,   // bottom-left
]);

// TODO 1: create a Uint16Array of indices for 2 triangles from the 4 vertices above
// (don't repeat vertex coordinates — only repeat INDICES)
const indices = new Uint16Array([/* TODO */]);

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// TODO 2: create an ELEMENT_ARRAY_BUFFER, bind it, bufferData with "indices"

const aPosition = gl.getAttribLocation(program, "aPosition");
gl.enableVertexAttribArray(aPosition);
gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 20, 0);

const aColor = gl.getAttribLocation(program, "aColor");
gl.enableVertexAttribArray(aColor);
gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 20, 8);

const uTime = gl.getUniformLocation(program, "uTime");

function draw(t: number) {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.06, 0.07, 0.1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // TODO 4: send t (seconds) into uTime using the correct gl.uniform* function for a float

  gl.bindVertexArray(vao);
  // TODO 5: draw with gl.drawElements — 6 indices, type UNSIGNED_SHORT

  requestAnimationFrame((ms) => draw(ms / 1000));
}
draw(0);`,
    solutionCode: `const canvas = document.querySelector("canvas")!;
const gl = canvas.getContext("webgl2")!;

const vertexSrc = \`#version 300 es
in vec2 aPosition;
in vec3 aColor;
uniform float uTime;
out vec3 vColor;

void main() {
  float c = cos(uTime);
  float s = sin(uTime);
  mat2 rotation = mat2(c, s, -s, c);
  vColor = aColor;
  gl_Position = vec4(rotation * aPosition, 0.0, 1.0);
}\`;

const fragmentSrc = \`#version 300 es
precision highp float;
in vec3 vColor;
out vec4 outColor;

void main() {
  outColor = vec4(vColor, 1.0);
}\`;

function compile(type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "compile failed");
  }
  return shader;
}

const program = gl.createProgram()!;
gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSrc));
gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSrc));
gl.linkProgram(program);
gl.useProgram(program);

// prettier-ignore
const vertices = new Float32Array([
  -0.5,  0.5, 1, 0.3, 0.3,
   0.5,  0.5, 0.3, 1, 0.3,
   0.5, -0.5, 0.3, 0.3, 1,
  -0.5, -0.5, 1, 1, 0.3,
]);
const indices = new Uint16Array([0, 1, 2, 2, 3, 0]);

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const ebo = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

const aPosition = gl.getAttribLocation(program, "aPosition");
gl.enableVertexAttribArray(aPosition);
gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 20, 0);

const aColor = gl.getAttribLocation(program, "aColor");
gl.enableVertexAttribArray(aColor);
gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 20, 8);

const uTime = gl.getUniformLocation(program, "uTime");

function draw(t: number) {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.06, 0.07, 0.1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.uniform1f(uTime, t);

  gl.bindVertexArray(vao);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

  requestAnimationFrame((ms) => draw(ms / 1000));
}
draw(0);`,
    referenceImage: "/figures/01-webgl/checkpoint-animated-quad.svg",
    hints: [
      {
        vi: "Chỉ số (index) được PHÉP lặp — 0 và 2 xuất hiện trong cả hai tam giác — nhưng DỮ LIỆU đỉnh (toạ độ + màu) trong buffer chỉ tồn tại đúng một lần cho mỗi trong 4 góc.",
        en: "Indices ARE allowed to repeat — 0 and 2 show up in both triangles — but the actual vertex DATA (position + color) in the buffer exists exactly once per corner, 4 times total.",
      },
      {
        vi: "uTime chỉ cần đúng một gl.uniform1f mỗi frame; toàn bộ toán xoay (cos, sin, mat2) nằm trong vertex shader — JS không tính góc, JS chỉ gửi thời gian thô.",
        en: "uTime just needs one gl.uniform1f per frame; all the rotation math (cos, sin, mat2) lives in the vertex shader — JS never computes an angle, it only sends the raw time.",
      },
      {
        vi: "gl.drawElements đọc chỉ số từ ELEMENT_ARRAY_BUFFER đang bound trong VAO hiện tại — bind buffer đó trước khi rời khỏi block bindVertexArray lúc setup, để VAO nhớ luôn binding này.",
        en: "gl.drawElements reads indices from whichever ELEMENT_ARRAY_BUFFER is bound inside the currently bound VAO — bind that buffer before leaving the bindVertexArray setup block so the VAO remembers the binding.",
      },
    ],
    checklist: [
      {
        vi: "Buffer vị trí/màu chỉ chứa đúng 4 đỉnh, không lặp lại đỉnh nào",
        en: "The position/color buffer holds exactly 4 vertices, no vertex duplicated",
      },
      {
        vi: "Index buffer chứa 6 chỉ số mô tả đúng 2 tam giác phủ kín quad, không hở góc",
        en: "The index buffer holds 6 indices describing 2 triangles that fully cover the quad with no gap",
      },
      {
        vi: "gl.drawElements được gọi với TRIANGLES, count = 6, type = UNSIGNED_SHORT",
        en: "gl.drawElements is called with TRIANGLES, count = 6, type = UNSIGNED_SHORT",
      },
      {
        vi: "Góc xoay được tính bằng cos/sin/mat2 ngay trong vertex shader từ uTime, không phải trong JavaScript",
        en: "The rotation angle is computed via cos/sin/mat2 inside the vertex shader from uTime, not in JavaScript",
      },
      {
        vi: "Không có lệnh gl.bufferData/bufferSubData nào chạy lại bên trong vòng lặp draw() mỗi frame",
        en: "No gl.bufferData/bufferSubData call runs again inside the draw() loop each frame",
      },
      {
        vi: "Mỗi đỉnh giữ đúng màu riêng của nó khi quad xoay (màu không đổi vị trí tương đối trên hình)",
        en: "Each vertex keeps its own distinct color as the quad rotates (colors don't swap position relative to the shape)",
      },
    ],
  },
];
