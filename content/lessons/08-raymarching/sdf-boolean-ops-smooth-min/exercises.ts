import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "hand-compute-smooth-min",
    kind: "concept",
    prompt: {
      vi: `Tại một điểm $p$, hai SDF trả về $d_A = 0.05$ và $d_B = 0.08$, với bán kính pha trộn $k = 0.1$. Không chạy code, tính $h$ theo công thức h-form \`h = clamp(0.5 + 0.5*(dB-dA)/k, 0, 1)\`, rồi tính \`smin(dA, dB, k) = mix(dB, dA, h) - k*h*(1-h)\`.

So sánh kết quả với $\\min(d_A, d_B) = 0.05$: giá trị \`smin\` lớn hơn, nhỏ hơn, hay bằng $0.05$? Giải thích số hạng nào trong công thức tạo ra chênh lệch đó, và nó tương ứng với chi tiết hình học gì trên bề mặt kết hợp.`,
      en: `At a point $p$, two SDFs return $d_A = 0.05$ and $d_B = 0.08$, with blend radius $k = 0.1$. Without running any code, compute $h$ using the h-form formula \`h = clamp(0.5 + 0.5*(dB-dA)/k, 0, 1)\`, then compute \`smin(dA, dB, k) = mix(dB, dA, h) - k*h*(1-h)\`.

Compare the result to $\\min(d_A, d_B) = 0.05$: is \`smin\` larger, smaller, or equal to $0.05$? Explain which term in the formula produces that difference, and what geometric detail on the combined surface it corresponds to.`,
    },
    hints: [
      {
        vi: "Tính $h$ trước: $0.5 + 0.5 \\times (0.08 - 0.05) / 0.1 = 0.5 + 0.15 = 0.65$, đã nằm trong $[0,1]$ nên không bị clamp.",
        en: "Compute $h$ first: $0.5 + 0.5 \\times (0.08 - 0.05) / 0.1 = 0.5 + 0.15 = 0.65$, already inside $[0,1]$ so clamp doesn't change it.",
      },
      {
        vi: "`mix(dB, dA, h)` với $h=0.65$ đã lớn hơn $\\min(d_A,d_B)$ một chút — số hạng trừ $k h (1-h)$ mới là phần kéo kết quả xuống dưới cả `min`.",
        en: "`mix(dB, dA, h)` at $h=0.65$ is already slightly above $\\min(d_A,d_B)$ — the subtracted term $k h (1-h)$ is what pulls the result below even the plain `min`.",
      },
    ],
    checklist: [
      {
        vi: "Tính đúng $h = 0.65$",
        en: "Correctly computed $h = 0.65$",
      },
      {
        vi: "Tính đúng \`smin(dA,dB,k) \\approx 0.0378\`, nhỏ hơn $\\min(d_A,d_B)=0.05$",
        en: "Correctly computed \`smin(dA,dB,k) \\approx 0.0378\`, smaller than $\\min(d_A,d_B)=0.05$",
      },
      {
        vi: "Giải thích được số hạng $-k h(1-h)$ là 'hố lõm' tạo nét bo tròn ở đường nối, không phải sai số làm tròn",
        en: "Explained that the $-k h(1-h)$ term is the 'dip' that carves the rounded fillet at the seam, not a rounding error",
      },
    ],
    solutionCode: `// h = clamp(0.5 + 0.5*(dB-dA)/k, 0, 1)
//   = clamp(0.5 + 0.5*(0.08-0.05)/0.1, 0, 1)
//   = clamp(0.5 + 0.15, 0, 1) = 0.65

// mix(dB, dA, h) = dB + (dA-dB)*h = 0.08 + (0.05-0.08)*0.65
//                = 0.08 - 0.0195 = 0.0605

// k*h*(1-h) = 0.1 * 0.65 * 0.35 = 0.02275

// smin(dA,dB,k) = 0.0605 - 0.02275 = 0.03775

// min(dA,dB) = 0.05
// 0.03775 < 0.05: smin dips BELOW the plain min. The subtracted term
// k*h*(1-h) is what creates that dip — geometrically it's the concave
// fillet that rounds the seam between the two shapes instead of a crease.
// It's largest when h is near 0.5 (the two distances are nearly equal,
// right at the crossover) and vanishes as h saturates to 0 or 1 away
// from the blend zone.`,
  },
  {
    id: "implement-smooth-union-raymarch",
    kind: "shader",
    prompt: {
      vi: `Trong playground, một cảnh raymarch (sphere tracing loop, \`calcNormal\`, camera) đã dựng sẵn, ghép một sphere và một box bằng \`min()\` cứng — chú ý đường nối gấp khúc. Cài đặt \`opSmoothUnion(d1, d2, k)\` bằng đúng công thức h-form của Quilez (\`h = clamp(0.5 + 0.5*(d2-d1)/k, 0, 1)\`, rồi \`mix(d2, d1, h) - k*h*(1-h)\`), sau đó đổi \`map()\` để gọi hàm này thay vì \`min()\` trực tiếp. \`K\` đã khai báo sẵn làm hằng số bán kính pha trộn.`,
      en: `In the playground, a raymarch scene (sphere tracing loop, \`calcNormal\`, camera) is already set up, combining a sphere and a box with a hard \`min()\` — notice the creased seam. Implement \`opSmoothUnion(d1, d2, k)\` using Quilez's exact h-form formula (\`h = clamp(0.5 + 0.5*(d2-d1)/k, 0, 1)\`, then \`mix(d2, d1, h) - k*h*(1-h)\`), then change \`map()\` to call it instead of \`min()\` directly. \`K\` is already declared as the blend-radius constant.`,
    },
    starterCode: `float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

const float K = 0.3;

float opSmoothUnion(float d1, float d2, float k) {
  // TODO 1: h = clamp(0.5 + 0.5*(d2-d1)/k, 0.0, 1.0)
  // TODO 2: return mix(d2, d1, h) - k*h*(1.0-h)
  return min(d1, d2);
}

float map(vec3 p) {
  float sphere = sdSphere(p - vec3(-0.4, 0.0, 0.0), 0.6);
  float box = sdBox(p - vec3(0.45, 0.0, 0.0), vec3(0.45));
  // TODO 3: replace with opSmoothUnion(sphere, box, K)
  return min(sphere, box);
}

vec3 calcNormal(vec3 p) {
  vec2 e = vec2(0.001, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)
  ));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;

  vec3 ro = vec3(0.0, 0.6, 3.0);
  vec3 ta = vec3(0.0, 0.0, 0.0);
  vec3 ww = normalize(ta - ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = cross(uu, ww);
  vec3 rd = normalize(uv.x * uu + uv.y * vv + 1.6 * ww);

  vec3 col = vec3(0.05, 0.06, 0.09);
  float t = 0.0;
  for (int i = 0; i < 80; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);
    if (d < 0.001) {
      vec3 n = calcNormal(p);
      float diff = max(dot(n, normalize(vec3(0.6, 0.8, 0.3))), 0.0);
      col = vec3(0.9, 0.55, 0.25) * (0.25 + diff * 0.8);
      break;
    }
    t += d;
    if (t > 10.0) break;
  }

  fragColor = vec4(col, 1.0);
}`,
    solutionCode: `float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

const float K = 0.3;

float opSmoothUnion(float d1, float d2, float k) {
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

float map(vec3 p) {
  float sphere = sdSphere(p - vec3(-0.4, 0.0, 0.0), 0.6);
  float box = sdBox(p - vec3(0.45, 0.0, 0.0), vec3(0.45));
  return opSmoothUnion(sphere, box, K);
}

vec3 calcNormal(vec3 p) {
  vec2 e = vec2(0.001, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)
  ));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;

  vec3 ro = vec3(0.0, 0.6, 3.0);
  vec3 ta = vec3(0.0, 0.0, 0.0);
  vec3 ww = normalize(ta - ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = cross(uu, ww);
  vec3 rd = normalize(uv.x * uu + uv.y * vv + 1.6 * ww);

  vec3 col = vec3(0.05, 0.06, 0.09);
  float t = 0.0;
  for (int i = 0; i < 80; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);
    if (d < 0.001) {
      vec3 n = calcNormal(p);
      float diff = max(dot(n, normalize(vec3(0.6, 0.8, 0.3))), 0.0);
      col = vec3(0.9, 0.55, 0.25) * (0.25 + diff * 0.8);
      break;
    }
    t += d;
    if (t > 10.0) break;
  }

  fragColor = vec4(col, 1.0);
}`,
    hints: [
      {
        vi: "\`h\` phải dùng \`d2 - d1\` (không phải \`d1 - d2\`) để khi \`d1\` nhỏ hơn hẳn, \`h\` tiến về 1 và \`mix(d2,d1,h)\` chọn đúng \`d1\` — thử đảo dấu để thấy hình bị lệch méo nếu sai.",
        en: "\`h\` must use \`d2 - d1\` (not \`d1 - d2\`) so that when \`d1\` is much smaller, \`h\` approaches 1 and \`mix(d2,d1,h)\` correctly picks \`d1\` — flip the sign to see the shape distort if this is wrong.",
      },
      {
        vi: "Sửa xong \`opSmoothUnion\` mà quên đổi \`map()\` vẫn còn gọi \`min(sphere, box)\` thì đường nối vẫn gấp khúc y như cũ — hai TODO phải sửa cùng nhau.",
        en: "Fixing \`opSmoothUnion\` but leaving \`map()\` still calling \`min(sphere, box)\` keeps the seam just as creased as before — both TODOs must change together.",
      },
    ],
    checklist: [
      {
        vi: "\`opSmoothUnion\` tính \`h\` bằng đúng công thức \`clamp(0.5 + 0.5*(d2-d1)/k, 0, 1)\`, không phải \`min(d1,d2)\` giữ nguyên",
        en: "\`opSmoothUnion\` computes \`h\` with the exact formula \`clamp(0.5 + 0.5*(d2-d1)/k, 0, 1)\`, not left as \`min(d1,d2)\`",
      },
      {
        vi: "\`opSmoothUnion\` trả về \`mix(d2, d1, h) - k*h*(1-h)\`, có trừ số hạng bù, không chỉ \`mix\`",
        en: "\`opSmoothUnion\` returns \`mix(d2, d1, h) - k*h*(1-h)\`, including the subtracted correction term, not just \`mix\`",
      },
      {
        vi: "\`map()\` gọi \`opSmoothUnion(sphere, box, K)\` và hình hiển thị có đường nối bo tròn mềm mại giữa sphere và box, không còn góc gấp cứng",
        en: "\`map()\` calls \`opSmoothUnion(sphere, box, K)\` and the rendered shape shows a soft rounded fillet between the sphere and box, no more hard crease",
      },
    ],
  },
];
