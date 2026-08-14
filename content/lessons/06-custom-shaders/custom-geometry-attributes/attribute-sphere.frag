precision highp float;

uniform float uColorByAttribute; // 0/1 toggle
uniform vec3 uBaseColor;

varying float vRandom;
varying float vWeight;
varying vec3 vNormal;

void main() {
  vec3 lightDir = normalize(vec3(0.4, 0.8, 0.6));
  float diffuse = max(dot(normalize(vNormal), lightDir), 0.0) * 0.7 + 0.3;

  // Visualizes the two float attributes directly: vWeight picks a hue,
  // vRandom adds per-vertex-interpolated speckle on top.
  vec3 attrColor = mix(vec3(0.15, 0.35, 0.95), vec3(0.98, 0.4, 0.15), vWeight);
  attrColor += vRandom * 0.2;

  vec3 base = mix(uBaseColor, attrColor, uColorByAttribute);
  gl_FragColor = vec4(base * diffuse, 1.0);
}
