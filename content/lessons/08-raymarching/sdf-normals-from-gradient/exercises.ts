import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "central-diff-by-hand",
    kind: "concept",
    prompt: {
      vi: `Cho SDF hình cầu tâm gốc bán kính $r = 2$: $f(p) = \\|p\\| - r$. Không chạy code, tính vector normal CHƯA chuẩn hoá tại điểm $p = (0, 2, 0)$ bằng central difference với $\\varepsilon = 0.02$ trên cả ba trục, rồi chuẩn hoá bằng tay để ra normal cuối cùng.

Sau đó: giả sử \`map()\` của cảnh trong demo (sphere + box + torus, ghép bằng hai lần smooth-min) tốn trung bình 4 phép tính SDF con mỗi lần gọi. So sánh central-diff (6 lần gọi \`map()\`) với tetrahedron (4 lần gọi) — chênh lệch tổng số phép tính SDF con để dựng MỘT normal là bao nhiêu?`,
      en: `A sphere SDF centered at the origin, radius $r = 2$: $f(p) = \\|p\\| - r$. Without running code, compute the UN-normalized normal vector at $p = (0, 2, 0)$ using central differences with $\\varepsilon = 0.02$ on all three axes, then normalize it by hand for the final normal.

Then: suppose the demo's scene \`map()\` (sphere + box + torus, combined with two smooth-min calls) costs 4 sub-SDF evaluations on average per call. Comparing central-diff (6 \`map()\` calls) against tetrahedron (4 calls) — what's the total difference in sub-SDF evaluations spent building ONE normal?`,
    },
    hints: [
      {
        vi: "Theo trục y, hai mẫu $p \\pm (0,\\varepsilon,0)$ nằm đối xứng qua chính đỉnh cầu — tính $f$ ở cả hai rồi trừ trực tiếp, đừng làm tròn sớm. Theo x và z, dùng khai triển $\\sqrt{4+\\varepsilon^2} \\approx 2 + \\varepsilon^2/4$ để thấy hai mẫu gần như bằng nhau.",
        en: "Along y, the two samples $p \\pm (0,\\varepsilon,0)$ sit symmetrically around the very top of the sphere — compute $f$ at both and subtract directly, don't round early. Along x and z, use the expansion $\\sqrt{4+\\varepsilon^2} \\approx 2 + \\varepsilon^2/4$ to see why both samples land almost equal.",
      },
      {
        vi: "Tổng sub-evaluation = (số lần gọi map()) × 4. Tính cho cả hai kỹ thuật rồi trừ.",
        en: "Total sub-evaluations = (number of map() calls) × 4. Compute for both techniques, then subtract.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng vector chưa chuẩn hoá ≈ (0, 0.04, 0) và chuẩn hoá ra (0, 1, 0)",
        en: "I correctly computed the un-normalized vector ≈ (0, 0.04, 0), normalizing to (0, 1, 0)",
      },
      {
        vi: "Tôi giải thích được vì sao thành phần x và z gần như triệt tiêu về 0 (đối xứng quanh trục y tại đỉnh cầu, sai số bậc hai)",
        en: "I can explain why the x and z components nearly cancel to 0 (symmetric around the y-axis at the sphere's top, second-order error)",
      },
      {
        vi: "Tôi tính đúng chênh lệch 8 sub-evaluation (24 cho central-diff vs 16 cho tetrahedron)",
        en: "I correctly computed the 8 sub-evaluation difference (24 for central-diff vs 16 for tetrahedron)",
      },
    ],
    solutionCode: `// Truc y: f(0,2.02,0) = 2.02 - 2 = 0.02 ; f(0,1.98,0) = 1.98 - 2 = -0.02
// diff_y = 0.02 - (-0.02) = 0.04
//
// Truc x: f(0.02,2,0) = sqrt(0.02^2 + 2^2) - 2 ~ (2 + 0.0001) - 2 = 0.0001
//         f(-0.02,2,0) cho cung gia tri ~0.0001 (doi xung qua truc y)
// diff_x = 0.0001 - 0.0001 ~ 0 (tuong tu cho truc z)
//
// Vector chua chuan hoa ~ (0, 0.04, 0) -> chuan hoa -> (0, 1, 0)
// Dung: dinh cau tai (0,2,0) co normal huong thang len +y.
//
// Sub-evaluation: central-diff = 6 lan goi map() * 4 = 24
//                 tetrahedron  = 4 lan goi map() * 4 = 16
// Chenh lech = 24 - 16 = 8 sub-evaluation moi normal (dung 33% ty le da neu trong ly thuyet).`,
  },
  {
    id: "tetrahedron-lambert-playground",
    kind: "shader",
    prompt: {
      vi: `Trong playground (uTime, uResolution, uMouse, fragColor có sẵn), hoàn thiện shader raymarch một hình cầu bán kính $0.5$ tại gốc toạ độ: cài đặt \`calcNormal\` bằng kỹ thuật tetrahedron (4 mẫu, \`eps = 0.001\`), rồi dùng normal đó tính Lambert diffuse với \`lightDir\` cố định để tô màu hình cầu.`,
      en: `In the playground (uTime, uResolution, uMouse, fragColor are all available), complete a shader that raymarches a sphere of radius $0.5$ at the origin: implement \`calcNormal\` using the tetrahedron technique (4 samples, \`eps = 0.001\`), then use that normal to compute Lambert diffuse against a fixed \`lightDir\` to shade the sphere.`,
    },
    starterCode: `float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float map(vec3 p) {
  return sdSphere(p, 0.5);
}

vec3 calcNormal(vec3 p) {
  // TODO: ky thuat tetrahedron - 4 mau, k = vec2(1.0, -1.0), eps = 0.001
  return vec3(0.0, 1.0, 0.0);
}

float raymarch(vec3 ro, vec3 rd) {
  float t = 0.0;
  for (int i = 0; i < 64; i++) {
    float d = map(ro + rd * t);
    if (d < 0.001) return t;
    t += d;
    if (t > 10.0) break;
  }
  return -1.0;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  vec3 ro = vec3(0.0, 0.0, 2.0);
  vec3 rd = normalize(vec3(uv, -1.0));

  vec3 color = vec3(0.05, 0.06, 0.09);
  float t = raymarch(ro, rd);
  if (t > 0.0) {
    vec3 p = ro + rd * t;
    vec3 n = calcNormal(p);
    vec3 lightDir = normalize(vec3(0.6, 0.7, 0.5));

    // TODO: Lambert diffuse = albedo * max(dot(n, lightDir), 0.0)
    float diff = 0.0;
    color = vec3(0.8, 0.4, 0.2) * diff;
  }

  fragColor = vec4(color, 1.0);
}`,
    solutionCode: `float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float map(vec3 p) {
  return sdSphere(p, 0.5);
}

vec3 calcNormal(vec3 p) {
  const float eps = 0.001;
  const vec2 k = vec2(1.0, -1.0);
  return normalize(
    k.xyy * map(p + k.xyy * eps) +
    k.yyx * map(p + k.yyx * eps) +
    k.yxy * map(p + k.yxy * eps) +
    k.xxx * map(p + k.xxx * eps)
  );
}

float raymarch(vec3 ro, vec3 rd) {
  float t = 0.0;
  for (int i = 0; i < 64; i++) {
    float d = map(ro + rd * t);
    if (d < 0.001) return t;
    t += d;
    if (t > 10.0) break;
  }
  return -1.0;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  vec3 ro = vec3(0.0, 0.0, 2.0);
  vec3 rd = normalize(vec3(uv, -1.0));

  vec3 color = vec3(0.05, 0.06, 0.09);
  float t = raymarch(ro, rd);
  if (t > 0.0) {
    vec3 p = ro + rd * t;
    vec3 n = calcNormal(p);
    vec3 lightDir = normalize(vec3(0.6, 0.7, 0.5));

    float diff = max(dot(n, lightDir), 0.0);
    color = vec3(0.8, 0.4, 0.2) * diff;
  }

  fragColor = vec4(color, 1.0);
}`,
    hints: [
      {
        vi: "k.xyy, k.yyx, k.yxy, k.xxx là bốn đỉnh tứ diện — nhân từng cái với map() tại điểm dịch chuyển tương ứng rồi cộng dồn, không cần chia cho 2*eps trước khi normalize.",
        en: "k.xyy, k.yyx, k.yxy, k.xxx are the four tetrahedron vertices — multiply each by map() at the corresponding offset point and sum, no need to divide by 2*eps before normalize.",
      },
      {
        vi: "max(dot(n, lightDir), 0.0) chặn giá trị âm về 0 — thiếu max() sẽ làm nửa tối của hình cầu có màu âm (bị clip nhưng có thể gây artefact nếu color dùng tiếp cho phép toán khác).",
        en: "max(dot(n, lightDir), 0.0) clamps negative values to 0 — skip max() and the sphere's dark side gets negative color (clipped visually, but could cause artifacts if color feeds further math).",
      },
    ],
    checklist: [
      {
        vi: "Hình cầu hiện rõ vùng sáng/tối theo đúng hướng lightDir cố định, không phải một màu phẳng",
        en: "The sphere clearly shows a light/dark gradient matching the fixed lightDir, not a flat single color",
      },
      {
        vi: "Bề mặt cầu mượt, không lấm tấm nhiễu (dấu hiệu eps quá nhỏ hoặc thiếu normalize)",
        en: "The sphere's surface is smooth, no speckled noise (a sign of eps too small or a missing normalize)",
      },
      {
        vi: "Thử đổi lightDir sang hướng khác và thấy vùng sáng dịch chuyển đúng theo hướng mới",
        en: "Try changing lightDir to a different direction and confirm the bright region shifts to match",
      },
    ],
  },
];
