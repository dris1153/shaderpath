precision highp float;

uniform vec3 uColor;

varying vec3 vNormal;

void main() {
  float diffuse = max(dot(normalize(vNormal), normalize(vec3(0.4, 0.6, 0.7))), 0.0) * 0.7 + 0.3;
  gl_FragColor = vec4(uColor * diffuse, 1.0);
}
