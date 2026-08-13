// Single source of truth for the fragment prelude AND the error-line offset.
// §11.5 depends on PRELUDE_LINES being derived, never hardcoded.

export const FRAG_PRELUDE = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
out vec4 fragColor;
`;

/** Number of lines the compiler sees BEFORE the user's first line. */
export const PRELUDE_LINES = (FRAG_PRELUDE.match(/\n/g) ?? []).length;

export function assembleFragment(userSource: string): string {
  return FRAG_PRELUDE + userSource;
}

export const FULLSCREEN_VERT = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

export const DEFAULT_FRAGMENT = `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float glow = 0.15 / distance(uv, uMouse);
  vec3 color = 0.5 + 0.5 * cos(uTime + uv.xyx + vec3(0.0, 2.0, 4.0));
  fragColor = vec4(color + glow * 0.4, 1.0);
}
`;
