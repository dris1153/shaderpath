uniform sampler2D tDiffuse; // ShaderPass writes readBuffer.texture here every frame
uniform float uMix;         // 0 = untouched passthrough, 1 = full effect
uniform vec2 uTexel;        // 1 / renderTargetSize, kept in sync on resize

varying vec2 vUv;

void main() {
  vec4 original = texture2D(tDiffuse, vUv);

  // A 3x3 box blur before the tint — nine texture reads per pixel gives this
  // pass a real, measurable fillrate cost instead of a free single-tap tint,
  // which is the whole point of the frame-time readout in this demo.
  vec3 sum = vec3(0.0);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      sum += texture2D(tDiffuse, vUv + uTexel * vec2(x, y)).rgb;
    }
  }
  vec3 blurred = sum / 9.0;

  vec3 inverted = vec3(1.0) - blurred;
  vec3 warmTint = vec3(1.0, 0.55, 0.15);
  vec3 tinted = mix(vec3(1.0), warmTint, 0.5) * inverted;

  gl_FragColor = vec4(mix(original.rgb, tinted, uMix), original.a);
}
