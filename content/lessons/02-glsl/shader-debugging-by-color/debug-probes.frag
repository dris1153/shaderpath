precision highp float;

varying vec2 vUv;
uniform float uMode;       // 0 final(buggy) 1 probeA(raw N) 2 probeB(remapped N) 3 probeC(step threshold) 4 fixed
uniform float uRadius;
uniform float uLightAngle; // radians

// The composite ring effect, with a flag controlling whether N gets normalized —
// `normalizeN = false` reproduces the "renders black" bug from the theory section.
vec3 ringScene(vec2 p, bool normalizeN) {
  vec2 L = vec2(cos(uLightAngle), sin(uLightAngle));
  vec2 N = normalizeN ? normalize(p) : p; // the bug lives here: N is never normalized
  float highlight = dot(N, L);
  float glintEdge0 = normalizeN ? 0.85 : 0.9;
  float glint = smoothstep(glintEdge0, 1.0, highlight);

  float d = abs(length(p) - uRadius);
  float ringMask = 1.0 - smoothstep(0.0, 0.012, d - 0.01);

  vec3 ringColor = vec3(1.0, 0.85, 0.3) * glint;
  vec3 bg = vec3(0.05, 0.06, 0.09);
  return mix(bg, ringColor, ringMask);
}

void main() {
  vec2 p = vUv - 0.5;
  vec2 L = vec2(cos(uLightAngle), sin(uLightAngle));
  vec2 N = p; // unnormalized -- this IS the bug the probes below chase down
  float highlight = dot(N, L);

  vec3 color;
  if (uMode < 0.5) {
    // 0: final buggy composite -- the ring should glint but stays dark
    color = ringScene(p, false);
  } else if (uMode < 1.5) {
    // 1: probe A -- raw N straight to color; negative half clips to black
    color = vec3(N, 0.0);
  } else if (uMode < 2.5) {
    // 2: probe B -- remapped N; a real unit vector would span near-0..near-1,
    // here it stays clustered around 0.5 because |N| is small
    color = vec3(N * 0.5 + 0.5, 0.0);
  } else if (uMode < 3.5) {
    // 3: probe C -- the exact threshold condition from the bug, isolated
    color = vec3(step(0.9, highlight));
  } else {
    // 4: fixed -- normalize(N) restores the intended rim glint
    color = ringScene(p, true);
  }

  gl_FragColor = vec4(color, 1.0);
}
