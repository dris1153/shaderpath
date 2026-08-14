precision highp float;

uniform float uTime;

varying vec3 vNormal;

void main() {
  vec3 pos = position;
  float wave = sin(pos.x * 3.0 + uTime * 1.6) * 0.12
             + sin(pos.y * 4.0 + uTime * 2.1) * 0.08;
  pos.z += wave;

  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
