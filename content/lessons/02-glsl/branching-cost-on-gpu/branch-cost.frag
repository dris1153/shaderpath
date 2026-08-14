precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform float uBranchless; // 0 = branchy (if/else per iteration), 1 = branchless (mix/step)
uniform float uIter;

const int MAX_ITER = 200;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Deliberately expensive: several transcendental calls — only worth paying
// for lanes that actually need it. That's the whole point of this demo.
float heavy(vec2 p, float n) {
  float v = sin(p.x * 9.0 + n * 6.2831) * cos(p.y * 7.0 - n * 4.0);
  v += pow(abs(sin(n * 11.0 + uTime * 0.6)), 2.5);
  v += sin(v * 8.0 + cos(v * 5.0));
  return v;
}

void main() {
  vec2 p = (vUv - 0.5) * 3.0;
  float acc = 0.0;
  int iter = int(uIter);

  for (int i = 0; i < MAX_ITER; i++) {
    if (i >= iter) break; // iteration count itself is uniform — free to branch on

    float n = hash(p + float(i) * 0.37);

    if (uBranchless > 0.5) {
      // Branchless: every lane always pays for BOTH paths, mix() just selects
      float cheap = n * 0.15;
      float full = heavy(p, n);
      acc += mix(cheap, full, step(0.5, n));
    } else {
      // Branchy: looks like it "skips" ~half the work — but n is per-pixel
      // noise, so neighboring lanes in the same warp disagree constantly
      if (n > 0.5) {
        acc += heavy(p, n);
      } else {
        acc += n * 0.15;
      }
    }

    p = fract(p * 1.37 + n * 0.71) - 0.5;
  }

  acc /= float(iter);
  vec3 color = 0.5 + 0.5 * cos(acc * 6.2831 + vec3(0.0, 2.0, 4.0));
  gl_FragColor = vec4(color, 1.0);
}
