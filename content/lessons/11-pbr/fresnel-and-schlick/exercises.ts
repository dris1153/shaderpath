import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "f0-and-schlick-by-hand",
    kind: "concept",
    prompt: {
      vi: `Sapphire (đá saphia) có chỉ số khúc xạ $n = 1.77$. Không chạy code: (1) tính $F_0$ bằng công thức $F_0 = \\left(\\frac{n_1 - n_2}{n_1 + n_2}\\right)^2$ với $n_1 = 1$; (2) dùng $F_0$ vừa tính, áp công thức Schlick $F(\\theta) = F_0 + (1 - F_0)(1 - \\cos\\theta)^5$ để tính $F$ tại góc nhìn $\\theta = 60°$ (biết $\\cos 60° = 0.5$).

Sau đó so sánh: $F(60°)$ lớn hơn $F_0$ bao nhiêu lần? Con số này nói gì về việc chỉ nhìn $F_0$ (một con số duy nhất) có đủ để đoán độ phản chiếu của vật liệu ở MỌI góc nhìn hay không?`,
      en: `Sapphire has a refractive index of $n = 1.77$. Without running code: (1) compute $F_0$ using $F_0 = \\left(\\frac{n_1 - n_2}{n_1 + n_2}\\right)^2$ with $n_1 = 1$; (2) using that $F_0$, apply the Schlick formula $F(\\theta) = F_0 + (1 - F_0)(1 - \\cos\\theta)^5$ to find $F$ at a viewing angle of $\\theta = 60°$ (where $\\cos 60° = 0.5$).

Then compare: how many times larger is $F(60°)$ than $F_0$? What does that ratio tell you about whether $F_0$ alone (a single number) is enough to predict a material's reflectance at EVERY viewing angle?`,
    },
    hints: [
      {
        vi: "Bước 1: $\\frac{1 - 1.77}{1 + 1.77} = \\frac{-0.77}{2.77}$, bình phương lên sẽ dương. Giữ ít nhất 4 chữ số thập phân trước khi làm tròn.",
        en: "Step 1: $\\frac{1 - 1.77}{1 + 1.77} = \\frac{-0.77}{2.77}$, squaring makes it positive. Keep at least 4 decimal places before rounding.",
      },
      {
        vi: "Bước 2: $1 - \\cos 60° = 1 - 0.5 = 0.5$, rồi $0.5^5 = 0.03125$ — số này chính là hệ số nhân với $(1 - F_0)$.",
        en: "Step 2: $1 - \\cos 60° = 1 - 0.5 = 0.5$, then $0.5^5 = 0.03125$ — that's the factor multiplying $(1 - F_0)$.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng $F_0 \\approx 0.0772$ (≈ 7.7%) cho saphia",
        en: "I correctly computed $F_0 \\approx 0.0772$ (≈ 7.7%) for sapphire",
      },
      {
        vi: "Tôi tính đúng $F(60°) \\approx 0.1061$ (≈ 10.6%)",
        en: "I correctly computed $F(60°) \\approx 0.1061$ (≈ 10.6%)",
      },
      {
        vi: "Tôi giải thích được vì sao chỉ $F_0$ không đủ mô tả phản chiếu ở mọi góc — cần cả số hạng $(1-\\cos\\theta)^5$ nhân theo góc thực tế",
        en: "I can explain why $F_0$ alone doesn't describe reflectance at every angle — the $(1-\\cos\\theta)^5$ term scaling by actual angle is required too",
      },
    ],
    solutionCode: `// F0 = ((1 - 1.77) / (1 + 1.77))^2 = (-0.77 / 2.77)^2 ≈ (-0.2780)^2 ≈ 0.0773

// F(60°) = F0 + (1 - F0) * (1 - cos60°)^5
//         = 0.0773 + (1 - 0.0773) * (0.5)^5
//         = 0.0773 + 0.9227 * 0.03125
//         = 0.0773 + 0.02884
//        ≈ 0.1061  (≈ 10.6%)

// Ti le tang: 0.1061 / 0.0773 ≈ 1.37x — moi o goc 60° (chua phai grazing
// that su), phan xa da tang hon 37%. F0 chi la DIEM XUAT PHAT (theta = 0),
// khong phai gia tri co dinh cho toan bo be mat.`,
  },
  {
    id: "schlick-rim-in-playground",
    kind: "shader",
    prompt: {
      vi: `Trong playground (uTime, uResolution, uMouse, fragColor có sẵn), vẽ một quả cầu giả bằng SDF hình tròn: bên trong hình tròn bán kính $0.6$, tái tạo pháp tuyến quả cầu từ vị trí 2D (\`vec3 N = vec3(p, sqrt(1.0 - dot(p,p)))\` với \`p = uv/r\`), rồi tô màu bằng công thức Schlick với \`F0\` lấy từ \`uMouse.x\` (kéo chuột ngang để \`F0\` chạy từ $0$ đến $1$, mô phỏng chuyển từ điện môi nhạt sang kim loại sáng).`,
      en: `In the playground (uTime, uResolution, uMouse, fragColor are available), draw a fake sphere using a circle SDF: inside a circle of radius $0.6$, reconstruct the sphere's normal from the 2D position (\`vec3 N = vec3(p, sqrt(1.0 - dot(p,p)))\` where \`p = uv/r\`), then shade it with the Schlick formula, using \`uMouse.x\` as a live \`F0\` (drag the mouse horizontally to sweep \`F0\` from $0$ to $1$, simulating dielectric to bright metal).`,
    },
    starterCode: `void main() {
  vec2 uv = (gl_FragCoord.xy / uResolution) * 2.0 - 1.0;
  uv.x *= uResolution.x / uResolution.y;

  float r = 0.6;
  float d = length(uv);
  vec3 bg = vec3(0.05, 0.06, 0.1);
  if (d > r) {
    fragColor = vec4(bg, 1.0);
    return;
  }

  // TODO 1: fake sphere normal N from p = uv / r (see prompt)
  vec3 N = vec3(0.0, 0.0, 1.0);
  vec3 V = vec3(0.0, 0.0, 1.0);
  float cosTheta = max(dot(N, V), 0.0);

  // TODO 2: F0 driven live by uMouse.x (already in [0,1] range)
  float F0 = 0.0;

  // TODO 3: Schlick — F0 + (1 - F0) * (1 - cosTheta)^5, clamp the base first
  float F = F0;

  vec3 color = mix(vec3(0.1, 0.1, 0.12), vec3(1.0), F);
  fragColor = vec4(color, 1.0);
}`,
    solutionCode: `void main() {
  vec2 uv = (gl_FragCoord.xy / uResolution) * 2.0 - 1.0;
  uv.x *= uResolution.x / uResolution.y;

  float r = 0.6;
  float d = length(uv);
  vec3 bg = vec3(0.05, 0.06, 0.1);
  if (d > r) {
    fragColor = vec4(bg, 1.0);
    return;
  }

  vec2 p = uv / r;
  float z = sqrt(max(0.0, 1.0 - dot(p, p)));
  vec3 N = vec3(p, z);
  vec3 V = vec3(0.0, 0.0, 1.0);
  float cosTheta = max(dot(N, V), 0.0);

  float F0 = clamp(uMouse.x, 0.0, 1.0);

  float t = clamp(1.0 - cosTheta, 0.0, 1.0);
  float F = F0 + (1.0 - F0) * pow(t, 5.0);

  vec3 color = mix(vec3(0.1, 0.1, 0.12), vec3(1.0), F);
  fragColor = vec4(color, 1.0);
}`,
    hints: [
      {
        vi: "`p = uv / r` đưa toạ độ về trong khoảng $[-1,1]$ của riêng hình tròn; `z` tính từ `sqrt(1 - dot(p,p))` chính là chiều sâu giả của quả cầu hướng ra camera.",
        en: "`p = uv / r` rescales into the circle's own $[-1,1]$ range; `z` from `sqrt(1 - dot(p,p))` is the sphere's fake depth pointing toward the camera.",
      },
      {
        vi: "`uMouse` đã ở dạng UV $[0,1]$ (xem bài Cartesian & UV space) — `uMouse.x` dùng thẳng làm F0 không cần biến đổi thêm, chỉ cần `clamp` cho an toàn.",
        en: "`uMouse` is already UV-space $[0,1]$ (see the Cartesian & UV space lesson) — `uMouse.x` can be used directly as F0, just `clamp` it for safety.",
      },
    ],
    checklist: [
      {
        vi: "Rìa quả cầu luôn sáng gần trắng bất kể vị trí chuột, đúng hành vi $F \\to 1$ khi $\\theta \\to 90°$",
        en: "The sphere's rim always brightens toward near-white regardless of mouse position, matching $F \\to 1$ as $\\theta \\to 90°$",
      },
      {
        vi: "Tâm quả cầu đổi màu rõ rệt theo `uMouse.x`: gần trái tối (F0 thấp, giống điện môi), gần phải sáng đều (F0 cao, giống kim loại)",
        en: "The sphere's center color visibly tracks `uMouse.x`: near the left it's dark (low F0, dielectric-like), near the right it's uniformly bright (high F0, metal-like)",
      },
      {
        vi: "Không có artifact đen/nhấp nháy ở đúng viền hình tròn (cosTheta được clamp trước khi pow)",
        en: "No black/flickering artifacts right at the circle's edge (cosTheta is clamped before pow)",
      },
    ],
  },
];
