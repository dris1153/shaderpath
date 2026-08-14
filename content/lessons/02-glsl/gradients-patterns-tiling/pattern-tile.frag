precision highp float;

varying vec2 vUv;
uniform float uTileCount;
uniform float uRotation;
uniform float uRowOffset;
uniform float uMotif; // 0 = checker, 1 = dots, 2 = stripes, 3 = rings

// Track 0's R(theta) = [[cos,-sin],[sin,cos]], written column-major for GLSL.
mat2 rotate2d(float angle) {
  return mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
}

void main() {
  vec2 uv = vUv;

  // Brick-style row offset, applied BEFORE scaling into tile space.
  float rowId = floor(uv.y * uTileCount);
  if (uRowOffset > 0.5) {
    uv.x += mod(rowId, 2.0) * (0.5 / uTileCount);
  }

  vec2 grid = uv * uTileCount;   // global tile space: N repeats across [0,1]
  vec2 id = floor(grid);         // integer cell id
  vec2 cell = fract(grid) - 0.5; // cell-local space, centered: [-0.5, 0.5]
  cell = rotate2d(uRotation) * cell;

  float d;
  if (uMotif < 0.5) {
    // Checker: a box SDF that exactly fills the cell footprint.
    d = max(abs(cell.x), abs(cell.y)) - 0.5;
  } else if (uMotif < 1.5) {
    d = length(cell) - 0.32; // dots
  } else if (uMotif < 2.5) {
    d = abs(cell.x) - 0.14; // stripes: one vertical bar per cell
  } else {
    d = abs(length(cell) - 0.28) - 0.06; // concentric rings
  }

  float parity = mod(id.x + id.y, 2.0);
  vec3 bg = vec3(0.07, 0.08, 0.13);
  vec3 fg = mix(vec3(0.98, 0.45, 0.2), vec3(0.35, 0.7, 0.98), parity);

  // Same smoothstep(edge0, edge1, d) convention as the SDF lesson's demo.
  float m = smoothstep(-0.02, 0.02, d);
  vec3 color = mix(fg, bg, m);

  gl_FragColor = vec4(color, 1.0);
}
