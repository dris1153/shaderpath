precision highp float;

varying vec2 vUv;
uniform vec3 uColor;
// Fraction of the quad's half-width that the visible circle occupies.
// Tight quads (little padding) get a value close to 1; loose quads (lots of
// wasted transparent area) get a value close to 0 — every fragment in that
// padding still runs this shader and blends, it just ends up near-zero alpha.
uniform float uVisibleFrac;
uniform float uFeather;

void main() {
  float dist = length(vUv - 0.5) * 2.0; // 0 at quad center, 1 at quad edge
  float alpha = 1.0 - smoothstep(uVisibleFrac - uFeather, uVisibleFrac, dist);
  gl_FragColor = vec4(uColor, alpha * 0.85);
}
