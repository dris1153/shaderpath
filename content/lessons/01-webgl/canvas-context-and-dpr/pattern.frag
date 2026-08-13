#version 300 es
precision highp float;

uniform vec2 uResolution; // drawing buffer size, in device pixels
out vec4 outColor;

void main() {
  vec2 p = gl_FragCoord.xy;
  vec3 color = vec3(0.04, 0.05, 0.07);

  // Hard 1-device-pixel grid every 24px — no shader-side AA, so any blur
  // seen here comes only from the browser upscaling a low-res buffer.
  vec2 cell = mod(p, 24.0);
  float onLine = step(cell.x, 1.0) + step(cell.y, 1.0);
  color = mix(color, vec3(0.85), min(onLine, 1.0) * 0.7);

  // Thin ring, radius = 32% of the shorter side, same hard-edge treatment.
  vec2 center = uResolution * 0.5;
  float r = length(p - center);
  float radius = min(uResolution.x, uResolution.y) * 0.32;
  float onRing = step(abs(r - radius), 1.0);
  color = mix(color, vec3(1.0, 0.55, 0.2), onRing);

  outColor = vec4(color, 1.0);
}
