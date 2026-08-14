precision highp float;

varying vec2 vUv;
// Number of loop iterations to actually run, 0..600 — this is what the
// synthetic-load slider and each simulated postfx pass control. The loop
// bound must stay a compile-time constant (WebGL1-safe); we early-break
// against the uniform instead of using a dynamic loop bound.
uniform float uIterations;

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float acc = 0.0;
  int n = int(uIterations);
  for (int i = 0; i < 600; i++) {
    if (i >= n) break;
    p = vec2(sin(p.y * 6.0 + float(i)), cos(p.x * 6.0 - float(i))) * 0.9;
    acc += p.x * p.y;
  }
  // colorWrite is off on this material (see quality-scene.tsx) — this output
  // never reaches the screen, only the ALU cost of computing it is real.
  gl_FragColor = vec4(vec3(acc), 1.0);
}
