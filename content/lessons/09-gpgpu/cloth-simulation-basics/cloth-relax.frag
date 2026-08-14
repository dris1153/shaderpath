// Manual (non-GPUComputationRenderer-"variable") multi-pass shader: run
// once per constraint iteration via gpu.doRenderTarget, ping-ponging
// between two scratch render targets (see demo.tsx). This is what makes
// constraint solving Jacobi rather than Gauss-Seidel: every texel reads its
// neighbors' positions from THIS pass's input texture — the same one every
// other texel is reading from in parallel — so no correction from this
// pass is visible until the NEXT full pass. A true sequential Gauss-Seidel
// solver (each point immediately sees its neighbors' updated positions) is
// impossible on the GPU's parallel model; Jacobi needs more iterations to
// reach the same stiffness because corrections propagate only one texel
// per pass, one full pass at a time.
precision highp float;

uniform sampler2D uPosition; // this pass's input grid
uniform sampler2D uInitial; // xyz = rest position, w = pin flag
uniform vec2 uTexel;
uniform float uRestStructural; // rest length of an orthogonal edge
uniform float uRestShear; // rest length of a diagonal edge

// One distance constraint's correction: how far `self` must move along the
// edge toward `neighbor` (read from THIS pass's texture) to make their
// distance equal restLen. Scaled by 0.5 since each end of the constraint
// shares the correction equally.
vec3 correction(vec3 self, vec2 uv, vec2 offset, float restLen, out float hit) {
  vec2 nUv = uv + offset;
  if (nUv.x < 0.0 || nUv.x > 1.0 || nUv.y < 0.0 || nUv.y > 1.0) {
    hit = 0.0;
    return vec3(0.0);
  }
  vec3 neighbor = texture2D(uPosition, nUv).xyz;
  vec3 delta = neighbor - self;
  float dist = length(delta);
  hit = 1.0;
  if (dist < 1e-5) return vec3(0.0);
  return delta * ((dist - restLen) / dist) * 0.5;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 initial = texture2D(uInitial, uv);
  vec4 data = texture2D(uPosition, uv);
  vec3 pos = data.xyz;

  if (initial.w > 0.5) {
    gl_FragColor = vec4(initial.xyz, data.w);
    return;
  }

  vec3 sum = vec3(0.0);
  float count = 0.0;
  float hit;

  // Structural constraints: up/down/left/right.
  sum += correction(pos, uv, vec2(uTexel.x, 0.0), uRestStructural, hit); count += hit;
  sum += correction(pos, uv, vec2(-uTexel.x, 0.0), uRestStructural, hit); count += hit;
  sum += correction(pos, uv, vec2(0.0, uTexel.y), uRestStructural, hit); count += hit;
  sum += correction(pos, uv, vec2(0.0, -uTexel.y), uRestStructural, hit); count += hit;

  // Shear constraints: the four diagonal neighbors — resist skewing that
  // structural constraints alone can't catch.
  sum += correction(pos, uv, vec2(uTexel.x, uTexel.y), uRestShear, hit); count += hit;
  sum += correction(pos, uv, vec2(-uTexel.x, uTexel.y), uRestShear, hit); count += hit;
  sum += correction(pos, uv, vec2(uTexel.x, -uTexel.y), uRestShear, hit); count += hit;
  sum += correction(pos, uv, vec2(-uTexel.x, -uTexel.y), uRestShear, hit); count += hit;

  // Jacobi average: every neighbor's pull gets equal weight, all computed
  // from the SAME unmodified input — this is the parallel-safe substitute
  // for Gauss-Seidel's "apply each correction immediately, one at a time".
  vec3 corrected = count > 0.0 ? pos + sum / count : pos;
  gl_FragColor = vec4(corrected, data.w);
}
