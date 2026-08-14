precision highp float;

uniform sampler2D tDiffuse;
uniform sampler2D tDepth;
uniform mat4 currentViewProjectionInverse;
uniform mat4 previousViewProjectionMatrix;
uniform float velocityScale;

varying vec2 vUv;

#include <packing>

const int SAMPLES = 16;

void main() {
  float depth = unpackRGBAToDepth(texture2D(tDepth, vUv));

  // Depth + UV -> world position, using only the CURRENT camera's own
  // matrices (no per-object data at all — this is the "camera-only" trick).
  vec4 currentClip = vec4(vUv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
  vec4 worldPos = currentViewProjectionInverse * currentClip;
  worldPos /= worldPos.w;

  // Re-project the SAME world point through last frame's camera matrices —
  // the screen-space delta between the two is this pixel's velocity.
  vec4 previousClip = previousViewProjectionMatrix * worldPos;
  vec2 previousNDC = previousClip.xy / previousClip.w;
  vec2 velocity = (currentClip.xy - previousNDC) * 0.5 * velocityScale;

  // Gather along the velocity vector, centered on this pixel — an integral
  // approximation, not a blend of discrete frames (see theory: ghosting).
  vec4 sum = vec4(0.0);
  for (int i = 0; i < SAMPLES; i++) {
    float t = float(i) / float(SAMPLES - 1) - 0.5;
    sum += texture2D(tDiffuse, vUv + velocity * t);
  }
  gl_FragColor = sum / float(SAMPLES);
}
