precision highp float;

// `position` here is never touched after creation — this vertex only ever
// carries its constant seed. The whole motion is computed from uTime, right
// here on the GPU: JS only ever sets one float per frame (see demo.tsx).
attribute float aSeed;
uniform float uTime;
uniform float uSpread;
uniform float uAmplitude;
uniform float uSpeed;
uniform float uPointSize;

// Mirrors the hash in motion-params.ts (43758.5453 is a common GLSL hash
// idiom) — GLSL can't import that module, so the constant is duplicated here.
float hash(float n) {
  return fract(sin(n) * 43758.5453);
}

void main() {
  float px = (hash(aSeed) * 2.0 - 1.0) * uSpread;
  float py = (hash(aSeed + 1.0) * 2.0 - 1.0) * uSpread;
  float pz = (hash(aSeed + 2.0) * 2.0 - 1.0) * uSpread;
  float phase = hash(aSeed + 3.0) * 6.28318530718;

  vec3 pos;
  pos.x = px + sin(uTime * uSpeed + phase) * uAmplitude;
  pos.y = py + cos(uTime * uSpeed + phase * 1.3) * uAmplitude;
  pos.z = pz + sin(uTime * uSpeed * 0.7 + phase * 0.6) * uAmplitude;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uPointSize * (300.0 / -mvPosition.z);
}
