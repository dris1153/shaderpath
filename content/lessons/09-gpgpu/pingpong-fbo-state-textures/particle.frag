precision highp float;

varying float vLife;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;

  vec3 color = mix(vec3(0.3, 0.55, 1.0), vec3(1.0, 0.65, 0.25), vLife);
  float alpha = smoothstep(0.5, 0.35, d);
  gl_FragColor = vec4(color, alpha);
}
