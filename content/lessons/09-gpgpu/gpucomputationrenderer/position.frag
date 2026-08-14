precision highp float;

uniform float uDelta;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 pos = texture2D(texturePosition, uv);
  vec4 vel = texture2D(textureVelocity, uv);

  pos.xyz += vel.xyz * uDelta;

  gl_FragColor = pos;
}
