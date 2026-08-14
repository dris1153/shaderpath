precision highp float;

varying float vSpeed;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  if (dot(c, c) > 0.25) discard;

  vec3 slow = vec3(0.3, 0.55, 0.95);
  vec3 fast = vec3(1.0, 0.68, 0.25);
  vec3 color = mix(slow, fast, clamp(vSpeed * 1.5, 0.0, 1.0));
  gl_FragColor = vec4(color, 1.0);
}
