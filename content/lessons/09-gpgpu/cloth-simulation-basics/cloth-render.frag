precision highp float;

uniform vec3 uLightDir;
uniform vec3 uColor;

varying vec3 vNormal;
varying vec2 vUv;

void main() {
  vec3 n = normalize(gl_FrontFacing ? vNormal : -vNormal);
  float diff = max(dot(n, normalize(uLightDir)), 0.0);
  vec3 base = mix(uColor * 0.55, uColor, vUv.y);
  vec3 lit = base * (0.3 + 0.7 * diff);
  gl_FragColor = vec4(lit, 1.0);
}
