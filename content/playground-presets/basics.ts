import type { PlaygroundPreset } from "./types";

export const BASICS_PRESETS: PlaygroundPreset[] = [
  {
    slug: "uv-and-color",
    title: { vi: "UV & bảng màu", en: "UV & Color Palette" },
    source: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  // Bảng màu cosine: a + b * cos(2pi * (c*t + d))
  vec3 a = vec3(0.5);
  vec3 b = vec3(0.5);
  vec3 d = vec3(0.0, 0.33, 0.67);
  vec3 color = a + b * cos(6.28318 * (uv.x + d + uTime * 0.1));

  // Quầng sáng bám theo con trỏ (uMouse chuẩn hoá 0..1)
  float halo = 0.08 / (distance(uv, uMouse) + 0.06);
  fragColor = vec4(color + halo * 0.3, 1.0);
}
`,
  },
  {
    slug: "shaping-functions",
    title: { vi: "Shaping functions", en: "Shaping Functions" },
    source: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  // Bốn dải ngang, mỗi dải vẽ một hàm nhào nặn khác nhau
  float band = floor(uv.y * 4.0);
  float x = uv.x;

  float value = x;                                    // linear
  if (band > 0.5 && band < 1.5) {
    value = smoothstep(0.2, 0.8, x);                  // smoothstep
  } else if (band > 1.5 && band < 2.5) {
    value = smoothstep(0.0, 0.5, x) - smoothstep(0.5, 1.0, x); // pulse
  } else if (band > 2.5) {
    value = 0.5 + 0.5 * sin(6.28318 * x + uTime);     // sine
  }

  float local = fract(uv.y * 4.0);
  float curve = smoothstep(0.035, 0.0, abs(local - value));
  fragColor = vec4(vec3(value * 0.3) + curve, 1.0);
}
`,
  },
  {
    slug: "sdf-2d-smin",
    title: { vi: "SDF 2D & smooth min", en: "2D SDF & Smooth Min" },
    source: `float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

float sdBox(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

// Hoà hai hình như đất sét thay vì cắt góc cứng
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

void main() {
  vec2 p = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;

  float circle = sdCircle(p - vec2(sin(uTime * 0.8) * 0.45, 0.0), 0.3);
  float box = sdBox(p + vec2(0.35, 0.0), vec2(0.26, 0.2));
  float d = smin(circle, box, 0.25);

  vec3 color = d < 0.0 ? vec3(0.25, 0.65, 0.95) : vec3(0.09, 0.11, 0.16);
  color *= 1.0 - exp(-7.0 * abs(d));                  // vân đồng mức
  color = mix(color, vec3(1.0), 1.0 - smoothstep(0.0, 0.015, abs(d)));
  fragColor = vec4(color, 1.0);
}
`,
  },
  {
    slug: "tiling-grid",
    title: { vi: "Lưới lặp & hash màu", en: "Tiling Grid & Hashed Color" },
    source: `float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  uv.x *= uResolution.x / uResolution.y;

  vec2 grid = uv * 8.0;
  vec2 cell = floor(grid);          // ô nào
  vec2 local = fract(grid) - 0.5;   // vị trí trong ô

  float h = hash21(cell);
  float pulse = 0.5 + 0.5 * sin(uTime * 1.5 + h * 6.28318);
  float radius = 0.16 + 0.26 * pulse;
  float shape = smoothstep(radius, radius - 0.04, length(local));

  vec3 tint = 0.5 + 0.5 * cos(6.28318 * (h + vec3(0.0, 0.33, 0.67)));
  fragColor = vec4(tint * shape, 1.0);
}
`,
  },
  {
    slug: "mouse-ripple",
    title: { vi: "Gợn sóng theo chuột", en: "Mouse Ripple" },
    source: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;

  // Đo khoảng cách trong không gian đã sửa tỉ lệ khung hình
  vec2 p = vec2((uv.x - uMouse.x) * aspect, uv.y - uMouse.y);
  float dist = length(p);

  // Sóng lan ra, tắt dần theo khoảng cách
  float ripple = sin(dist * 38.0 - uTime * 6.0) * exp(-dist * 4.0);

  vec3 base = mix(vec3(0.04, 0.06, 0.11), vec3(0.11, 0.17, 0.27), uv.y);
  fragColor = vec4(base + ripple * vec3(0.35, 0.55, 0.9), 1.0);
}
`,
  },
];
