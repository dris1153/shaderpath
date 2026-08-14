import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-cosine-gradient-palette",
    kind: "build",
    prompt: {
      vi: `Dựng một **bảng màu (palette) chuyển động** trong GLSL Playground, chỉ bằng công thức cosine palette của Inigo Quilez — không texture, không \`if\`.

Yêu cầu: hàm \`palette(t, a, b, c, d)\` áp đúng \`pal(t) = a + b * cos(2π(c*t + d))\`; \`t\` kết hợp \`uv.x\` (dải màu ngang) với \`uTime\` (chuyển động); ít nhất **2 preset** \`(a, b, c, d)\` khác nhau, chuyển đổi giữa chúng theo nửa trái/phải màn hình bằng \`step(0.5, uv.x)\` làm hệ số cho \`mix\`.

Gợi ý cấu trúc: viết \`palette()\` một lần, gọi hai lần với hai bộ tham số, rồi \`mix\` hai kết quả.`,
      en: `Build an **animated color palette** in the GLSL Playground using only Inigo Quilez's cosine palette formula — no textures, no \`if\`.

Requirements: a \`palette(t, a, b, c, d)\` function implementing \`pal(t) = a + b * cos(2π(c*t + d))\`; \`t\` combining \`uv.x\` (horizontal color band) with \`uTime\` (motion); at least **2 different** \`(a, b, c, d)\` presets, switched by screen left/right half using \`step(0.5, uv.x)\` as the \`mix\` factor.

Suggested structure: write \`palette()\` once, call it twice with two parameter sets, then \`mix\` the two results.`,
    },
    starterCode: `// Công thức cosine palette của Inigo Quilez:
// pal(t) = a + b * cos(2*PI * (c*t + d))
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  // TODO 1: khai báo 2 bộ tham số (a, b, c, d) khác nhau — 2 preset palette
  vec3 a1 = vec3(0.5), b1 = vec3(0.5), c1 = vec3(1.0), d1 = vec3(0.0, 0.33, 0.67);
  vec3 a2 = vec3(0.5), b2 = vec3(0.5), c2 = vec3(1.0), d2 = vec3(0.0, 0.1, 0.2);

  // TODO 2: t nên trộn uv.x (dải màu ngang) với uTime (chuyển động theo thời gian)
  float t = 0.0;

  vec3 left = palette(t, a1, b1, c1, d1);
  vec3 right = palette(t, a2, b2, c2, d2);

  // TODO 3: chọn preset theo NỬA màn hình bằng step() trên uv.x — KHÔNG dùng if
  vec3 color = left;

  fragColor = vec4(color, 1.0);
}`,
    solutionCode: `vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  vec3 a1 = vec3(0.5, 0.5, 0.5), b1 = vec3(0.5, 0.5, 0.5), c1 = vec3(1.0, 1.0, 1.0), d1 = vec3(0.0, 0.33, 0.67);
  vec3 a2 = vec3(0.5, 0.5, 0.5), b2 = vec3(0.5, 0.5, 0.5), c2 = vec3(1.0, 1.0, 0.5), d2 = vec3(0.8, 0.9, 0.3);

  float t = uv.x + uTime * 0.15;

  vec3 left = palette(t, a1, b1, c1, d1);
  vec3 right = palette(t, a2, b2, c2, d2);
  vec3 color = mix(left, right, step(0.5, uv.x));

  fragColor = vec4(color, 1.0);
}`,
    hints: [
      {
        vi: "Công thức chỉ có 4 vec3 và một cos: pal(t) = a + b*cos(2π(c*t+d)). 6.28318 xấp xỉ 2π — không cần độ chính xác hơn cho mục đích màu sắc.",
        en: "The formula is just 4 vec3s and a cos: pal(t) = a + b*cos(2π(c*t+d)). 6.28318 approximates 2π — plenty precise for color purposes.",
      },
      {
        vi: "t nên là TỔNG của uv.x và uTime nhân với một hệ số nhỏ (ví dụ 0.15) — cộng, không nhân, để cả hai ảnh hưởng độc lập lên màu.",
        en: "t should be the SUM of uv.x and uTime scaled by a small factor (e.g. 0.15) — addition, not multiplication, so both influence color independently.",
      },
      {
        vi: "step(0.5, uv.x) cho 0.0 ở nửa trái, 1.0 ở nửa phải — dùng thẳng làm tham số t thứ ba của mix(left, right, t).",
        en: "step(0.5, uv.x) gives 0.0 on the left half, 1.0 on the right — use it directly as mix(left, right, t)'s third argument.",
      },
    ],
    checklist: [
      {
        vi: "Hàm palette() nhận đúng 4 tham số vec3 (a, b, c, d) và áp đúng công thức cosine",
        en: "palette() takes exactly 4 vec3 parameters (a, b, c, d) and applies the correct cosine formula",
      },
      {
        vi: "Màu chuyển động mượt liên tục theo thời gian nhờ uTime cộng vào t",
        en: "Color animates smoothly and continuously over time via uTime added into t",
      },
      {
        vi: "Có ít nhất 2 preset (a, b, c, d) cho ra 2 dải màu rõ ràng khác nhau",
        en: "At least 2 presets (a, b, c, d) produce 2 visibly distinct color ranges",
      },
      {
        vi: "Ranh giới 2 preset đúng tại uv.x = 0.5, dùng step() chứ không if/else",
        en: "The boundary between presets sits exactly at uv.x = 0.5, using step() rather than if/else",
      },
      {
        vi: "Không có lỗi biên dịch trong Playground và shader chạy mượt không giật hình",
        en: "No compile errors in the Playground and the shader runs smoothly with no stutter",
      },
    ],
  },
];
