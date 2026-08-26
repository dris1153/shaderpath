// Feedback buffers for the playground. A shader that reads `uPrev` needs last
// frame's pixels, which means drawing into a texture and swapping each frame.
// Allocated only when the compiled program actually references uPrev — GLSL
// strips unused uniforms, so a null uniform location is the compiler telling
// us this shader never reads the previous frame.

export interface PingPong {
  fbo: WebGLFramebuffer;
  tex: [WebGLTexture, WebGLTexture];
  /** Index of the texture holding the previous frame. */
  read: 0 | 1;
  width: number;
  height: number;
}

/** RGBA16F needs this extension to be a valid render target; without it the
 *  pair falls back to 8 bits, which runs but bands visibly. */
export function canRenderFloat(gl: WebGL2RenderingContext): boolean {
  return gl.getExtension("EXT_color_buffer_float") !== null;
}

function createTarget(
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
  float: boolean,
): WebGLTexture {
  const tex = gl.createTexture();
  if (!tex) throw new Error("out of textures");
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    float ? gl.RGBA16F : gl.RGBA8,
    width,
    height,
    0,
    gl.RGBA,
    float ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE,
    null,
  );
  // LINEAR + CLAMP: feedback shaders sample neighbours and must not wrap the
  // simulation around the edge of the domain.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return tex;
}

export function createPingPong(
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
  float: boolean,
): PingPong {
  const fbo = gl.createFramebuffer();
  if (!fbo) throw new Error("out of framebuffers");
  const tex: [WebGLTexture, WebGLTexture] = [
    createTarget(gl, width, height, float),
    createTarget(gl, width, height, float),
  ];

  // Zero both so frame 0 reads a known state rather than whatever the driver
  // left in memory — a simulation seeded from garbage is not reproducible.
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  for (const t of tex) {
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      t,
      0,
    );
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  return { fbo, tex, read: 0, width, height };
}

export function destroyPingPong(
  gl: WebGL2RenderingContext,
  pair: PingPong,
): void {
  gl.deleteFramebuffer(pair.fbo);
  gl.deleteTexture(pair.tex[0]);
  gl.deleteTexture(pair.tex[1]);
}

/** The pair this frame should use. Recreates it when the canvas resized,
 *  frees it when the shader stopped reading uPrev. A different object coming
 *  back is the caller's signal to restart the simulation. */
export function reconcilePingPong(
  gl: WebGL2RenderingContext,
  current: PingPong | null,
  want: { needed: boolean; width: number; height: number; float: boolean },
): PingPong | null {
  const fits =
    current !== null &&
    current.width === want.width &&
    current.height === want.height;
  if (want.needed && fits) return current;
  if (current) destroyPingPong(gl, current);
  if (!want.needed || want.width <= 0 || want.height <= 0) return null;
  return createPingPong(gl, want.width, want.height, want.float);
}

/** Attach the write target and point rendering at it. */
export function bindForWrite(
  gl: WebGL2RenderingContext,
  pair: PingPong,
): void {
  gl.bindFramebuffer(gl.FRAMEBUFFER, pair.fbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    pair.tex[pair.read === 0 ? 1 : 0],
    0,
  );
}

const PRESENT_FRAG = `#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D uSrc;
uniform vec2 uSize;
out vec4 fragColor;
void main() {
  fragColor = vec4(texture(uSrc, gl_FragCoord.xy / uSize).rgb, 1.0);
}
`;

export interface Presenter {
  program: WebGLProgram;
  uSrc: WebGLUniformLocation | null;
  uSize: WebGLUniformLocation | null;
}

export function createPresenter(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  compile: (
    gl: WebGL2RenderingContext,
    vs: string,
    fs: string,
  ) => { ok: true; program: WebGLProgram } | { ok: false; log: string },
): Presenter | null {
  const r = compile(gl, vertexSource, PRESENT_FRAG);
  if (!r.ok) return null;
  return {
    program: r.program,
    uSrc: gl.getUniformLocation(r.program, "uSrc"),
    uSize: gl.getUniformLocation(r.program, "uSize"),
  };
}

/** Draw the texture just written onto the canvas, then swap. */
export function presentAndSwap(
  gl: WebGL2RenderingContext,
  pair: PingPong,
  presenter: Presenter,
): void {
  const written = pair.tex[pair.read === 0 ? 1 : 0]!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.useProgram(presenter.program);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, written);
  gl.uniform1i(presenter.uSrc, 0);
  gl.uniform2f(presenter.uSize, pair.width, pair.height);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  pair.read = pair.read === 0 ? 1 : 0;
}
