precision highp float;

varying vec2 vUv;
uniform float uAngle;       // base rotation angle, radians
uniform float uScale;
uniform float uPivotCenter; // 1.0 = pivot at (0.5, 0.5), 0.0 = pivot at (0.0, 0.0)
uniform float uInvert;      // 1.0 = "rotate the pattern" (inverse matrix), 0.0 = "rotate the coordinate"
uniform float uSpin;        // 1.0 = keep spinning with uTime on top of uAngle
uniform float uTime;

mat2 rotate2d(float a) {
  float c = cos(a);
  float s = sin(a);
  // column-major constructor: mat2(col0, col1) -> col0 = (c, s), col1 = (-s, c)
  return mat2(c, s, -s, c);
}

void main() {
  float angle = uAngle + uSpin * uTime * 0.6;

  // "Rotate the pattern" needs the INVERSE: rotate by -angle, scale by 1/uScale
  mat2 forward = rotate2d(angle) * uScale;
  mat2 backward = rotate2d(-angle) * (1.0 / uScale);
  mat2 xform = uInvert > 0.5 ? backward : forward;

  vec2 pivot = mix(vec2(0.0), vec2(0.5), uPivotCenter);
  vec2 p = vUv - pivot; // translate -> origin
  p = xform * p;        // transform
  p += pivot;            // translate back

  // Checker pattern sampled in the (possibly transformed) coordinate
  vec2 cell = floor(p * 8.0);
  float parity = mod(cell.x + cell.y, 2.0);
  vec3 colorA = vec3(0.97, 0.55, 0.22);
  vec3 colorB = vec3(0.09, 0.12, 0.2);
  vec3 color = mix(colorA, colorB, parity);

  // Outside [0,1] after the transform: the pattern samples "off the poster" -- dim it
  vec2 edge = step(vec2(0.0), p) * step(p, vec2(1.0));
  float inBounds = edge.x * edge.y;
  color = mix(vec3(0.02, 0.02, 0.03), color, inBounds);

  gl_FragColor = vec4(color, 1.0);
}
