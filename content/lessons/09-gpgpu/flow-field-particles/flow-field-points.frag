precision highp float;

uniform float uColorBy; // 0 = speed, 1 = age
uniform float uMaxSpeed;
uniform float uLifetime;

varying float vSpeed;
varying float vAge;

// Classic hue ramp (see The Book of Shaders, "Color" chapter)
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d2 = dot(c, c);
  if (d2 > 0.25) discard;

  float t = uColorBy < 0.5
    ? clamp(vSpeed / max(uMaxSpeed, 1e-4), 0.0, 1.0)
    : clamp(vAge / max(uLifetime, 1e-4), 0.0, 1.0);

  // Hue sweeps blue (slow/young) -> cyan -> yellow -> red (fast/old)
  float hue = mix(0.62, 0.0, t);
  vec3 color = hsv2rgb(vec3(hue, 0.85, 1.0));

  float edge = 1.0 - smoothstep(0.16, 0.25, d2);
  gl_FragColor = vec4(color, edge);
}
