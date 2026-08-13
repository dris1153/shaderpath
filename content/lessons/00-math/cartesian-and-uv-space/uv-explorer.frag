precision highp float;

varying vec2 vUv;
uniform vec2 uPoint;
uniform float uFlipY;

void main() {
  vec2 uv = vUv;

  // The lesson's core idea, literally: color = (u, v)
  vec3 color = vec3(uv, 0.25);

  // 0.1-spaced grid, anti-aliased with screen-space derivatives
  vec2 g = abs(fract(uv * 10.0 - 0.5) - 0.5) / fwidth(uv * 10.0);
  float grid = 1.0 - min(min(g.x, g.y), 1.0);
  color = mix(color, vec3(1.0), grid * 0.25);

  // Marker; v flips to contrast image (top-left) vs WebGL (bottom-left) origins
  vec2 p = vec2(uPoint.x, mix(uPoint.y, 1.0 - uPoint.y, uFlipY));
  float d = distance(uv, p);
  float ring = smoothstep(0.02, 0.015, abs(d - 0.035));
  color = mix(color, vec3(1.0), ring);

  gl_FragColor = vec4(color, 1.0);
}
