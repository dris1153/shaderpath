#version 300 es
precision highp float;

in vec2 vUV;
uniform sampler2D uSceneTexture;
uniform int uEffect; // 0 = none, 1 = invert, 2 = pixelate, 3 = wave
uniform float uStrength; // 0..1
uniform float uTime;
out vec4 outColor;

void main() {
  vec2 uv = vUV;

  if (uEffect == 2) {
    // pixelate: snap to the CENTER of an NxN cell grid (same +0.5 idea as
    // the pixel-to-UV mapping from Track 0 and the previous texture lesson)
    float cells = mix(64.0, 4.0, uStrength);
    uv = (floor(uv * cells) + 0.5) / cells;
  } else if (uEffect == 3) {
    uv.x += sin(uv.y * 24.0 + uTime * 2.0) * 0.06 * uStrength;
  }

  vec4 color = texture(uSceneTexture, clamp(uv, 0.0, 1.0));

  if (uEffect == 1) {
    color.rgb = mix(color.rgb, 1.0 - color.rgb, uStrength);
  }

  outColor = color;
}
