uniform float uDelta;
uniform float uTime;
uniform float uLifetime;
uniform float uRespawnEnabled;
uniform float uSpawnExtent;

float hash11(float n) {
  return fract(sin(n) * 43758.5453123);
}

vec3 hash3(vec3 p) {
  float n = dot(p, vec3(41.3, 289.1, 138.5));
  return vec3(hash11(n), hash11(n + 17.0), hash11(n + 53.0));
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 posData = texture2D(texturePosition, uv);
  vec3 vel = texture2D(textureVelocity, uv).xyz;

  vec3 pos = posData.xyz + vel * uDelta;
  float age = posData.w + uDelta;

  // Each texel ages and respawns independently — a hash of its own uv plus
  // the current time, never Math.random() from the CPU. Because initial
  // ages are staggered at spawn (see demo.tsx), respawns spread evenly
  // over time instead of the whole cloud blinking at once.
  if (uRespawnEnabled > 0.5 && age > uLifetime) {
    vec3 seed = vec3(uv, fract(uTime * 0.137));
    pos = (hash3(seed) * 2.0 - 1.0) * uSpawnExtent;
    age = 0.0;
  }

  gl_FragColor = vec4(pos, age);
}
