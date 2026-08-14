precision highp float;

varying vec2 vUv;
uniform float uHashType; // 0 = sin/fract hash, 1 = sine-free polynomial hash
uniform float uZoomExp;  // coordinate magnitude fed to the hash = 10^uZoomExp
uniform float uSeed;

// Classic Book of Shaders hash — sin as scrambler, big multiplier into fract chaos
float hashSin(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Dave Hoskins "Hash without Sine" — no trig, pure multiply/add/fract
float hashNoSin(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  float density = 48.0;
  vec2 cell = floor(vUv * density);

  // seed offsets the input coordinate — an irregular constant so the second
  // field doesn't just land on an already-hashed neighboring cell
  vec2 p = cell + uSeed * 17.13;

  // zoom scales coordinate magnitude away from the origin — this is what
  // reveals the sin-hash's precision-dependent banding at large coordinates
  p *= pow(10.0, uZoomExp);

  float h = uHashType > 0.5 ? hashNoSin(p) : hashSin(p);
  gl_FragColor = vec4(vec3(h), 1.0);
}
