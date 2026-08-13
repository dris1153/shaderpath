import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-render-to-texture-tint",
    kind: "build",
    prompt: {
      vi: `Dựng pipeline ba pass khép lại Track WebGL Thuần: vẽ một scene xoay động vào một FBO texture (pass 1, có \`DEPTH_ATTACHMENT\` và \`DEPTH_TEST\` bật đúng), sau đó vẽ chính texture đó phủ toàn màn hình qua fragment shader tint + vignette (pass 2), rồi bật blending vẽ thêm một lớp overlay bán trong suốt đè lên trên (pass 3) — đúng ba mảnh FBO, texture sampling và blending ghép lại một chỗ.

Yêu cầu: FBO có texture màu \`RGBA8\` và renderbuffer depth \`DEPTH_COMPONENT16\`, kiểm tra \`gl.checkFramebufferStatus\` bằng \`FRAMEBUFFER_COMPLETE\` trước khi dùng. Pass 1 vẽ hai quad ở hai độ sâu khác nhau — quad trước xoay theo thời gian, quad sau đứng yên — để depth test có gì đó thật sự phải quyết định. Pass 2 tắt depth test, sample texture kết quả, áp tint màu và vignette tối dần ra rìa. Pass 3 bật \`gl.BLEND\` với \`SRC_ALPHA\`/\`ONE_MINUS_SRC_ALPHA\`, tắt ghi depth, vẽ một quad màu bán trong suốt, rồi trả trạng thái blend/depth về như cũ trước frame kế tiếp.`,
      en: `Build the three-pass pipeline that closes out the raw WebGL track: render an animated spinning scene into an FBO texture (pass 1, with a \`DEPTH_ATTACHMENT\` and \`DEPTH_TEST\` enabled correctly), draw that exact texture fullscreen through a tint + vignette fragment shader (pass 2), then enable blending and draw a translucent overlay layer on top (pass 3) — FBOs, texture sampling and blending, all exercised together in one place.

Requirements: the FBO needs an \`RGBA8\` color texture and a \`DEPTH_COMPONENT16\` depth renderbuffer, checked with \`gl.checkFramebufferStatus\` against \`FRAMEBUFFER_COMPLETE\` before use. Pass 1 draws two quads at different depths — one spinning over time, one static — so depth test actually has something to resolve. Pass 2 disables depth testing, samples the resulting texture, and applies a color tint plus an edge-darkening vignette. Pass 3 enables \`gl.BLEND\` with \`SRC_ALPHA\`/\`ONE_MINUS_SRC_ALPHA\`, disables depth writes, draws a translucent colored quad, then restores blend/depth state before the next frame.`,
    },
    starterCode: `const canvas = document.querySelector("canvas")!;
const gl = canvas.getContext("webgl2")!;
if (!gl) throw new Error("WebGL2 not supported");

const FBO_SIZE = 512; // fixed render-target size, independent of canvas size

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error("Shader compile failed: " + log);
  }
  return shader;
}

function linkProgram(gl: WebGL2RenderingContext, vertSrc: string, fragSrc: string): WebGLProgram {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error("Program link failed: " + gl.getProgramInfoLog(program));
  }
  return program;
}

// ---- pass 1 shaders: per-vertex color quad, rotated by uAngle ----
const sceneVertSrc = [
  "#version 300 es",
  "in vec3 aPosition;",
  "in vec3 aColor;",
  "uniform float uAngle;",
  "out vec3 vColor;",
  "void main() {",
  "  float c = cos(uAngle);",
  "  float s = sin(uAngle);",
  "  vec2 rotated = mat2(c, s, -s, c) * aPosition.xy;",
  "  vColor = aColor;",
  "  gl_Position = vec4(rotated, aPosition.z, 1.0);",
  "}",
].join("\\n");
const sceneFragSrc = [
  "#version 300 es",
  "precision highp float;",
  "in vec3 vColor;",
  "out vec4 outColor;",
  "void main() {",
  "  outColor = vec4(vColor, 1.0);",
  "}",
].join("\\n");

// ---- pass 2 shaders: fullscreen tint + vignette over the FBO texture ----
const tintVertSrc = [
  "#version 300 es",
  "in vec2 aPosition;",
  "out vec2 vUv;",
  "void main() {",
  "  vUv = aPosition * 0.5 + 0.5;",
  "  gl_Position = vec4(aPosition, 0.0, 1.0);",
  "}",
].join("\\n");
const tintFragSrc = [
  "#version 300 es",
  "precision highp float;",
  "in vec2 vUv;",
  "uniform sampler2D uScene;",
  "uniform vec3 uTint;",
  "out vec4 outColor;",
  "void main() {",
  "  vec3 color = texture(uScene, vUv).rgb * uTint;",
  "  float d = distance(vUv, vec2(0.5));",
  "  float vignette = smoothstep(0.75, 0.25, d);",
  "  outColor = vec4(color * vignette, 1.0);",
  "}",
].join("\\n");

// ---- pass 3 shaders: flat translucent color ----
const overlayVertSrc = [
  "#version 300 es",
  "in vec2 aPosition;",
  "void main() {",
  "  gl_Position = vec4(aPosition, 0.0, 1.0);",
  "}",
].join("\\n");
const overlayFragSrc = [
  "#version 300 es",
  "precision highp float;",
  "uniform vec4 uColor;",
  "out vec4 outColor;",
  "void main() {",
  "  outColor = uColor;",
  "}",
].join("\\n");

// ---- pass 1 program + geometry: front quad spins, back quad is static ----
const sceneProgram = linkProgram(gl, sceneVertSrc, sceneFragSrc);
// prettier-ignore
const sceneVerts = new Float32Array([
  // x, y, z, r, g, b — front quad (spins), z = -0.2 (nearer)
  -0.35, -0.35, -0.2, 1.0, 0.42, 0.21,
   0.35, -0.35, -0.2, 0.36, 0.62, 1.0,
   0.35,  0.35, -0.2, 0.55, 1.0, 0.55,
  -0.35,  0.35, -0.2, 0.9, 0.9, 0.2,
  // back quad (static, larger), z = 0.2 (farther)
  -0.8, -0.8, 0.2, 0.25, 0.1, 0.3,
   0.8, -0.8, 0.2, 0.25, 0.1, 0.3,
   0.8,  0.8, 0.2, 0.25, 0.1, 0.3,
  -0.8,  0.8, 0.2, 0.25, 0.1, 0.3,
]);
const sceneIndices = new Uint16Array([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7]);

const sceneVao = gl.createVertexArray();
const sceneVbo = gl.createBuffer();
const sceneEbo = gl.createBuffer();
gl.bindVertexArray(sceneVao);
gl.bindBuffer(gl.ARRAY_BUFFER, sceneVbo);
gl.bufferData(gl.ARRAY_BUFFER, sceneVerts, gl.STATIC_DRAW);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sceneEbo);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sceneIndices, gl.STATIC_DRAW);
const aScenePos = gl.getAttribLocation(sceneProgram, "aPosition");
const aSceneColor = gl.getAttribLocation(sceneProgram, "aColor");
gl.enableVertexAttribArray(aScenePos);
gl.vertexAttribPointer(aScenePos, 3, gl.FLOAT, false, 24, 0);
gl.enableVertexAttribArray(aSceneColor);
gl.vertexAttribPointer(aSceneColor, 3, gl.FLOAT, false, 24, 12);
gl.bindVertexArray(null);
const uAngleLoc = gl.getUniformLocation(sceneProgram, "uAngle");

// ---- pass 2 program + geometry: one oversized triangle covers the screen ----
const tintProgram = linkProgram(gl, tintVertSrc, tintFragSrc);
const tintVao = gl.createVertexArray();
const tintVbo = gl.createBuffer();
gl.bindVertexArray(tintVao);
gl.bindBuffer(gl.ARRAY_BUFFER, tintVbo);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
const aTintPos = gl.getAttribLocation(tintProgram, "aPosition");
gl.enableVertexAttribArray(aTintPos);
gl.vertexAttribPointer(aTintPos, 2, gl.FLOAT, false, 0, 0);
gl.bindVertexArray(null);
const uSceneLoc = gl.getUniformLocation(tintProgram, "uScene");
const uTintLoc = gl.getUniformLocation(tintProgram, "uTint");

// ---- pass 3 program + geometry: a small translucent rectangle ----
const overlayProgram = linkProgram(gl, overlayVertSrc, overlayFragSrc);
const overlayVao = gl.createVertexArray();
const overlayVbo = gl.createBuffer();
const overlayEbo = gl.createBuffer();
gl.bindVertexArray(overlayVao);
gl.bindBuffer(gl.ARRAY_BUFFER, overlayVbo);
// prettier-ignore
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -0.5, -0.8,
   0.5, -0.8,
   0.5, -0.4,
  -0.5, -0.4,
]), gl.STATIC_DRAW);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, overlayEbo);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
const aOverlayPos = gl.getAttribLocation(overlayProgram, "aPosition");
gl.enableVertexAttribArray(aOverlayPos);
gl.vertexAttribPointer(aOverlayPos, 2, gl.FLOAT, false, 0, 0);
gl.bindVertexArray(null);
const uOverlayColorLoc = gl.getUniformLocation(overlayProgram, "uColor");

// TODO 1: create the FBO — an RGBA8 color texture sized FBO_SIZE x FBO_SIZE,
// plus a DEPTH_COMPONENT16 depth renderbuffer, both attached to a
// framebuffer. Check gl.checkFramebufferStatus === gl.FRAMEBUFFER_COMPLETE
// before using it. Name the texture "sceneTexture" and the framebuffer "fbo"
// — pass 2 and the render loop below refer to them by those names.

function render(timeMs: number) {
  const angle = timeMs * 0.0008;

  // TODO 2: PASS 1 — bind fbo, set the viewport to FBO_SIZE x FBO_SIZE,
  // enable depth test (LESS), disable blend, clear color + depth, then use
  // sceneProgram + sceneVao to draw the front quad (uAngle = angle, index
  // offset 0) followed by the back quad (uAngle = 0, index offset 12).

  // TODO 3: PASS 2 — bind the default framebuffer (null), resize the canvas
  // to its display size (devicePixelRatio-aware) and set the viewport,
  // disable depth test, clear, then use tintProgram + tintVao: bind
  // sceneTexture to unit 0, set uScene = 0 and uTint, draw 3 vertices.

  // TODO 4: PASS 3 — enable gl.BLEND with blendFunc(SRC_ALPHA,
  // ONE_MINUS_SRC_ALPHA), disable depth writes with gl.depthMask(false),
  // draw the overlay quad with overlayProgram + overlayVao, then disable
  // BLEND and call gl.depthMask(true) again before the next frame.

  requestAnimationFrame(render);
}
requestAnimationFrame(render);`,
    solutionCode: `const canvas = document.querySelector("canvas")!;
const gl = canvas.getContext("webgl2")!;
if (!gl) throw new Error("WebGL2 not supported");

const FBO_SIZE = 512; // fixed render-target size, independent of canvas size

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error("Shader compile failed: " + log);
  }
  return shader;
}

function linkProgram(gl: WebGL2RenderingContext, vertSrc: string, fragSrc: string): WebGLProgram {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error("Program link failed: " + gl.getProgramInfoLog(program));
  }
  return program;
}

// ---- pass 1 shaders: per-vertex color quad, rotated by uAngle ----
const sceneVertSrc = [
  "#version 300 es",
  "in vec3 aPosition;",
  "in vec3 aColor;",
  "uniform float uAngle;",
  "out vec3 vColor;",
  "void main() {",
  "  float c = cos(uAngle);",
  "  float s = sin(uAngle);",
  "  vec2 rotated = mat2(c, s, -s, c) * aPosition.xy;",
  "  vColor = aColor;",
  "  gl_Position = vec4(rotated, aPosition.z, 1.0);",
  "}",
].join("\\n");
const sceneFragSrc = [
  "#version 300 es",
  "precision highp float;",
  "in vec3 vColor;",
  "out vec4 outColor;",
  "void main() {",
  "  outColor = vec4(vColor, 1.0);",
  "}",
].join("\\n");

// ---- pass 2 shaders: fullscreen tint + vignette over the FBO texture ----
const tintVertSrc = [
  "#version 300 es",
  "in vec2 aPosition;",
  "out vec2 vUv;",
  "void main() {",
  "  vUv = aPosition * 0.5 + 0.5;",
  "  gl_Position = vec4(aPosition, 0.0, 1.0);",
  "}",
].join("\\n");
const tintFragSrc = [
  "#version 300 es",
  "precision highp float;",
  "in vec2 vUv;",
  "uniform sampler2D uScene;",
  "uniform vec3 uTint;",
  "out vec4 outColor;",
  "void main() {",
  "  vec3 color = texture(uScene, vUv).rgb * uTint;",
  "  float d = distance(vUv, vec2(0.5));",
  "  float vignette = smoothstep(0.75, 0.25, d);",
  "  outColor = vec4(color * vignette, 1.0);",
  "}",
].join("\\n");

// ---- pass 3 shaders: flat translucent color ----
const overlayVertSrc = [
  "#version 300 es",
  "in vec2 aPosition;",
  "void main() {",
  "  gl_Position = vec4(aPosition, 0.0, 1.0);",
  "}",
].join("\\n");
const overlayFragSrc = [
  "#version 300 es",
  "precision highp float;",
  "uniform vec4 uColor;",
  "out vec4 outColor;",
  "void main() {",
  "  outColor = uColor;",
  "}",
].join("\\n");

// ---- pass 1 program + geometry: front quad spins, back quad is static ----
const sceneProgram = linkProgram(gl, sceneVertSrc, sceneFragSrc);
// prettier-ignore
const sceneVerts = new Float32Array([
  // x, y, z, r, g, b — front quad (spins), z = -0.2 (nearer)
  -0.35, -0.35, -0.2, 1.0, 0.42, 0.21,
   0.35, -0.35, -0.2, 0.36, 0.62, 1.0,
   0.35,  0.35, -0.2, 0.55, 1.0, 0.55,
  -0.35,  0.35, -0.2, 0.9, 0.9, 0.2,
  // back quad (static, larger), z = 0.2 (farther)
  -0.8, -0.8, 0.2, 0.25, 0.1, 0.3,
   0.8, -0.8, 0.2, 0.25, 0.1, 0.3,
   0.8,  0.8, 0.2, 0.25, 0.1, 0.3,
  -0.8,  0.8, 0.2, 0.25, 0.1, 0.3,
]);
const sceneIndices = new Uint16Array([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7]);

const sceneVao = gl.createVertexArray();
const sceneVbo = gl.createBuffer();
const sceneEbo = gl.createBuffer();
gl.bindVertexArray(sceneVao);
gl.bindBuffer(gl.ARRAY_BUFFER, sceneVbo);
gl.bufferData(gl.ARRAY_BUFFER, sceneVerts, gl.STATIC_DRAW);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sceneEbo);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sceneIndices, gl.STATIC_DRAW);
const aScenePos = gl.getAttribLocation(sceneProgram, "aPosition");
const aSceneColor = gl.getAttribLocation(sceneProgram, "aColor");
gl.enableVertexAttribArray(aScenePos);
gl.vertexAttribPointer(aScenePos, 3, gl.FLOAT, false, 24, 0);
gl.enableVertexAttribArray(aSceneColor);
gl.vertexAttribPointer(aSceneColor, 3, gl.FLOAT, false, 24, 12);
gl.bindVertexArray(null);
const uAngleLoc = gl.getUniformLocation(sceneProgram, "uAngle");

// ---- pass 2 program + geometry: one oversized triangle covers the screen ----
const tintProgram = linkProgram(gl, tintVertSrc, tintFragSrc);
const tintVao = gl.createVertexArray();
const tintVbo = gl.createBuffer();
gl.bindVertexArray(tintVao);
gl.bindBuffer(gl.ARRAY_BUFFER, tintVbo);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
const aTintPos = gl.getAttribLocation(tintProgram, "aPosition");
gl.enableVertexAttribArray(aTintPos);
gl.vertexAttribPointer(aTintPos, 2, gl.FLOAT, false, 0, 0);
gl.bindVertexArray(null);
const uSceneLoc = gl.getUniformLocation(tintProgram, "uScene");
const uTintLoc = gl.getUniformLocation(tintProgram, "uTint");

// ---- pass 3 program + geometry: a small translucent rectangle ----
const overlayProgram = linkProgram(gl, overlayVertSrc, overlayFragSrc);
const overlayVao = gl.createVertexArray();
const overlayVbo = gl.createBuffer();
const overlayEbo = gl.createBuffer();
gl.bindVertexArray(overlayVao);
gl.bindBuffer(gl.ARRAY_BUFFER, overlayVbo);
// prettier-ignore
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -0.5, -0.8,
   0.5, -0.8,
   0.5, -0.4,
  -0.5, -0.4,
]), gl.STATIC_DRAW);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, overlayEbo);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
const aOverlayPos = gl.getAttribLocation(overlayProgram, "aPosition");
gl.enableVertexAttribArray(aOverlayPos);
gl.vertexAttribPointer(aOverlayPos, 2, gl.FLOAT, false, 0, 0);
gl.bindVertexArray(null);
const uOverlayColorLoc = gl.getUniformLocation(overlayProgram, "uColor");

// ---- FBO: color texture (RGBA8) + depth renderbuffer (DEPTH_COMPONENT16) ----
const sceneTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, FBO_SIZE, FBO_SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.bindTexture(gl.TEXTURE_2D, null);

const depthRenderbuffer = gl.createRenderbuffer();
gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderbuffer);
gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, FBO_SIZE, FBO_SIZE);
gl.bindRenderbuffer(gl.RENDERBUFFER, null);

const fbo = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sceneTexture, 0);
gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderbuffer);
if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
  throw new Error("FBO incomplete");
}
gl.bindFramebuffer(gl.FRAMEBUFFER, null);

function render(timeMs: number) {
  const angle = timeMs * 0.0008;

  // Pass 1: draw the scene into the FBO's texture, not the screen.
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.viewport(0, 0, FBO_SIZE, FBO_SIZE);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);
  gl.disable(gl.BLEND);
  gl.clearColor(0.05, 0.05, 0.08, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(sceneProgram);
  gl.bindVertexArray(sceneVao);
  gl.uniform1f(uAngleLoc, angle);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0); // front quad, spinning
  gl.uniform1f(uAngleLoc, 0);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 12); // back quad, static —
  // drawn AFTER the front quad but still ends up behind it: depth test, not
  // draw order, decides what's visible where the two quads overlap.
  gl.bindVertexArray(null);

  // Pass 2: draw the FBO's texture fullscreen through a tint + vignette shader.
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.round(canvas.clientWidth * dpr);
  const h = Math.round(canvas.clientHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  gl.viewport(0, 0, w, h);
  gl.disable(gl.DEPTH_TEST); // one flat fullscreen layer — nothing to test against
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(tintProgram);
  gl.bindVertexArray(tintVao);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
  gl.uniform1i(uSceneLoc, 0);
  gl.uniform3f(uTintLoc, 1.0, 0.85, 0.7);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.bindVertexArray(null);

  // Pass 3: blend a translucent overlay on top of the tinted image.
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.depthMask(false); // no depth writes while compositing a transparent layer

  gl.useProgram(overlayProgram);
  gl.bindVertexArray(overlayVao);
  gl.uniform4f(uOverlayColorLoc, 0.1, 0.6, 1.0, 0.35);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  gl.bindVertexArray(null);

  gl.disable(gl.BLEND);
  gl.depthMask(true); // restore before pass 1 runs again next frame

  requestAnimationFrame(render);
}
requestAnimationFrame(render);`,
    hints: [
      {
        vi: "Tạo FBO đúng thứ tự: framebufferTexture2D cho COLOR_ATTACHMENT0, framebufferRenderbuffer cho DEPTH_ATTACHMENT, rồi mới gọi checkFramebufferStatus — kiểm tra trước khi attach xong luôn báo lỗi giả.",
        en: "Create the FBO in order: framebufferTexture2D for COLOR_ATTACHMENT0, framebufferRenderbuffer for DEPTH_ATTACHMENT, THEN call checkFramebufferStatus — checking before both attachments are in place always reports a false error.",
      },
      {
        vi: "Vẽ quad trước (uAngle = angle) rồi quad sau (uAngle = 0) đúng thứ tự trong scaffold — nếu depth test đúng, quad vẽ sau vẫn không đè lên quad vẽ trước dù nó 'muộn hơn'.",
        en: "Draw the front quad first (uAngle = angle) then the back quad second (uAngle = 0), exactly as scaffolded — if depth test is set up correctly, the later draw call still won't paint over the earlier one where they overlap.",
      },
      {
        vi: "gl.depthMask(false) ở pass 3 phải được trả về true trước khi frame kế tiếp chạy pass 1 — quên dòng này khiến depth buffer của các frame sau không bao giờ được ghi mới, occlusion vỡ dần theo thời gian.",
        en: "gl.depthMask(false) from pass 3 must be reset to true before the next frame's pass 1 runs — forget that line and later frames never write to the depth buffer again, silently breaking occlusion over time.",
      },
    ],
    checklist: [
      {
        vi: "FBO complete ngay sau khi tạo — checkFramebufferStatus trả về FRAMEBUFFER_COMPLETE, không có lỗi ở console",
        en: "FBO is complete right after creation — checkFramebufferStatus returns FRAMEBUFFER_COMPLETE, no console errors",
      },
      {
        vi: "Quad xoay (pass 1) hiện rõ qua texture ở pass 2, không phải màn hình đen hay chỉ toàn màu clear",
        en: "The spinning quad (pass 1) shows clearly through the texture in pass 2, not a black screen or just the clear color",
      },
      {
        vi: "Quad tĩnh phía sau luôn bị quad xoay che đúng chỗ giao nhau, kể cả khi vẽ sau — chứng minh depth test hoạt động, không phải thứ tự vẽ",
        en: "The static back quad always stays correctly occluded where it overlaps the spinning quad, even though it's drawn second — proving depth test, not draw order, decides visibility",
      },
      {
        vi: "Tint + vignette áp đúng lên toàn màn hình: rìa tối hơn tâm, màu ngả theo uTint",
        en: "Tint + vignette apply correctly across the whole screen: edges darker than the center, color shifted toward uTint",
      },
      {
        vi: "Overlay pass 3 thật sự trong suốt — nhìn xuyên thấy được ảnh tint bên dưới, không phải phủ kín một màu đặc",
        en: "The pass 3 overlay is genuinely translucent — the tinted image underneath still shows through, not a solid opaque color",
      },
      {
        vi: "gl.BLEND và depthMask được bật/tắt đúng lại sau pass 3, không rò rỉ trạng thái sang frame kế tiếp",
        en: "gl.BLEND and depthMask are correctly toggled back after pass 3, with no state leaking into the next frame",
      },
    ],
  },
];
