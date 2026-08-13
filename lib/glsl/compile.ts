// Raw WebGL2 compile/link with strict disposal — the playground calls this on
// every (debounced) edit, so leaked programs would accumulate fast.

export type CompileResult =
  | { ok: true; program: WebGLProgram }
  | { ok: false; log: string };

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): { shader: WebGLShader } | { log: string } {
  const shader = gl.createShader(type);
  if (!shader) return { log: "createShader failed" };
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? "unknown compile error";
    gl.deleteShader(shader);
    return { log };
  }
  return { shader };
}

export function compileProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string,
): CompileResult {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  if ("log" in vs) return { ok: false, log: vs.log };

  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if ("log" in fs) {
    gl.deleteShader(vs.shader);
    return { ok: false, log: fs.log };
  }

  const program = gl.createProgram();
  gl.attachShader(program, vs.shader);
  gl.attachShader(program, fs.shader);
  gl.linkProgram(program);
  // Shaders are owned by the program after linking — always release our refs
  gl.deleteShader(vs.shader);
  gl.deleteShader(fs.shader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? "unknown link error";
    gl.deleteProgram(program);
    return { ok: false, log };
  }
  return { ok: true, program };
}
