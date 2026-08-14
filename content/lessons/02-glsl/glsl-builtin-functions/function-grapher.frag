precision highp float;

varying vec2 vUv;
uniform float uMode; // 0 = stepStripes, 1 = smoothstepPulse, 2 = fractSawtooth, 3 = distanceRings
uniform float uCount;
uniform float uDetail;

// One evaluator shared by every mode — the whole point of this demo is that
// stripes, pulses, ramps and rings are the SAME kind of expression.
float evalFunc(float coord) {
  float t = fract(coord * uCount);

  if (uMode < 0.5) {
    // stepStripes: hard threshold — step(edge, x)
    return step(uDetail, t);
  } else if (uMode < 1.5) {
    // smoothstepPulse: two smoothsteps back to back = a soft pulse
    float s = clamp(uDetail * 0.49, 0.001, 0.49);
    return smoothstep(0.25, 0.25 + s, t) - smoothstep(0.75 - s, 0.75, t);
  } else if (uMode < 2.5) {
    // fractSawtooth: the raw fract IS the ramp, uDetail only shifts phase
    return fract(coord * uCount + uDetail);
  }

  // distanceRings: same fract-then-threshold idea, but coord is a distance
  float band = abs(t - 0.5);
  float s = clamp(uDetail * 0.45, 0.005, 0.45);
  return 1.0 - smoothstep(0.0, s, band);
}

void main() {
  vec2 uv = vUv;
  const float curveH = 0.32;
  const float gap = 0.015;
  float split = 1.0 - curveH;

  vec3 bg = vec3(0.08, 0.1, 0.16);
  vec3 on = vec3(0.98, 0.55, 0.25);
  vec3 line = vec3(0.35, 0.85, 0.95);
  vec3 grid = vec3(0.18, 0.22, 0.3);

  vec3 color;

  if (uv.y < split - gap) {
    // Pattern strip: local uv remapped to [0,1] within this region only
    vec2 pl = vec2(uv.x, uv.y / (split - gap));
    float coord = (uMode > 2.5) ? distance(pl, vec2(0.5)) : pl.x;
    float v = evalFunc(coord);
    color = mix(bg, on, v);
  } else if (uv.y < split) {
    color = vec3(0.02, 0.02, 0.04); // divider gap
  } else {
    // Curve strip: literally the pattern's horizontal cross-section, plotted
    float ly = (uv.y - split) / curveH;
    float coordC = (uMode > 2.5) ? abs(uv.x - 0.5) : uv.x;
    float fx = evalFunc(coordC);

    float onGridLine = step(0.98, fract(uv.x * uCount));
    color = mix(vec3(0.05, 0.06, 0.09), grid, onGridLine);
    float d = abs(ly - fx);
    float glow = 1.0 - smoothstep(0.0, 0.02, d);
    color = mix(color, line, glow);
  }

  gl_FragColor = vec4(color, 1.0);
}
