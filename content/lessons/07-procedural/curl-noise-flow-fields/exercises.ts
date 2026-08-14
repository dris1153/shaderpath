import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "divergence-by-hand",
    kind: "concept",
    prompt: {
      vi: `Cho trường tiềm năng $\\psi(x, y) = x^2 y$. Không chạy code:

1. Tính trường gradient thô $F_{\\text{naive}} = \\nabla\\psi = (\\partial\\psi/\\partial x,\\ \\partial\\psi/\\partial y)$ và trường curl $F_{\\text{curl}} = (\\partial\\psi/\\partial y,\\ -\\partial\\psi/\\partial x)$, cả hai dưới dạng biểu thức theo $x, y$.
2. Tính phân kỳ $\\nabla \\cdot F$ cho cả hai trường, cũng dưới dạng biểu thức theo $x, y$.
3. Đánh giá cả hai trường (giá trị và phân kỳ) tại điểm $p = (1, 2)$.

Trường nào có phân kỳ bằng 0 tại **mọi** điểm, không chỉ tại $p = (1,2)$ — và vì sao đó là hệ quả tất yếu của cách xây dựng nó, không phải vì $\\psi = x^2y$ có gì đặc biệt?`,
      en: `Given the potential field $\\psi(x, y) = x^2 y$. Without running code:

1. Compute the naive gradient field $F_{\\text{naive}} = \\nabla\\psi = (\\partial\\psi/\\partial x,\\ \\partial\\psi/\\partial y)$ and the curl field $F_{\\text{curl}} = (\\partial\\psi/\\partial y,\\ -\\partial\\psi/\\partial x)$, both as expressions in $x, y$.
2. Compute the divergence $\\nabla \\cdot F$ for both fields, also as expressions in $x, y$.
3. Evaluate both fields (value and divergence) at the point $p = (1, 2)$.

Which field has divergence exactly 0 at **every** point, not just at $p = (1,2)$ — and why is that a necessary consequence of how it's built, not something specific to $\\psi = x^2y$?`,
    },
    hints: [
      {
        vi: "∂ψ/∂x = 2xy, ∂ψ/∂y = x² — dùng đúng hai biểu thức này cho cả F_naive lẫn F_curl, chỉ khác cách sắp xếp và dấu.",
        en: "∂ψ/∂x = 2xy, ∂ψ/∂y = x² — reuse these exact two expressions for both F_naive and F_curl, only the arrangement and sign change.",
      },
      {
        vi: "div(F_curl) rút gọn về ∂²ψ/∂x∂y − ∂²ψ/∂y∂x — hai đạo hàm hỗn hợp này LUÔN bằng nhau với hàm đủ mượt, bất kể ψ cụ thể là gì.",
        en: "div(F_curl) reduces to ∂²ψ/∂x∂y − ∂²ψ/∂y∂x — these two mixed partials are ALWAYS equal for a smooth function, regardless of what ψ specifically is.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng F_naive = (2xy, x²) và F_curl = (x², −2xy)",
        en: "I correctly computed F_naive = (2xy, x²) and F_curl = (x², −2xy)",
      },
      {
        vi: "Tôi tính đúng div(F_naive) = 2y (khác 0 nói chung) và div(F_curl) = 2x − 2x = 0",
        en: "I correctly computed div(F_naive) = 2y (nonzero in general) and div(F_curl) = 2x − 2x = 0",
      },
      {
        vi: "Tại p=(1,2): F_naive=(4,1) với div=4; F_curl=(1,−4) với div=0 — và tôi giải thích được div(F_curl)=0 mọi nơi vì đạo hàm hỗn hợp luôn giao hoán, không phụ thuộc dạng cụ thể của ψ",
        en: "At p=(1,2): F_naive=(4,1) with div=4; F_curl=(1,−4) with div=0 — and I can explain div(F_curl)=0 everywhere because mixed partials always commute, independent of ψ's specific form",
      },
    ],
    solutionCode: `// psi(x,y) = x^2 y
// dpsi/dx = 2xy         dpsi/dy = x^2
//
// F_naive = (2xy, x^2)
// F_curl  = (x^2, -2xy)     <- swap components, negate the second
//
// div(F_naive) = d(2xy)/dx + d(x^2)/dy = 2y + 0 = 2y   (depends on y, generally != 0)
// div(F_curl)  = d(x^2)/dx + d(-2xy)/dy = 2x - 2x = 0  (ALWAYS 0, for any x, y)
//
// At p = (1, 2):
//   F_naive = (4, 1),  div(F_naive) = 2*2 = 4   -> locally expanding here
//   F_curl  = (1, -4), div(F_curl)  = 0          -> zero everywhere, not just here
//
// div(F_curl) = d^2psi/dxdy - d^2psi/dydx is a mixed-partial identity: for
// any sufficiently smooth psi, these two are equal (Schwarz's theorem), so
// their difference is 0 regardless of what psi actually is.`,
  },
  {
    id: "curl-field-in-playground",
    kind: "shader",
    prompt: {
      vi: `Trong playground (uResolution, fragColor có sẵn), một hàm tiềm năng đơn giản \`psi(p) = sin(p.x * 3.0) * cos(p.y * 3.0)\` đã cho sẵn. Hoàn thành: (1) đạo hàm \`dPsiDx\`, \`dPsiDy\` bằng sai phân trung tâm với $\\varepsilon = 0.01$, (2) trường curl bằng cách xoay gradient 90° đúng công thức $F=(\\partial\\psi/\\partial y,\\ -\\partial\\psi/\\partial x)$, rồi remap hai thành phần có dấu của nó thành màu (kỹ thuật debug-by-color đã học) để xem trực tiếp trường vector.`,
      en: `In the playground (uResolution, fragColor are available), a simple potential function \`psi(p) = sin(p.x * 3.0) * cos(p.y * 3.0)\` is given. Complete: (1) the derivatives \`dPsiDx\`, \`dPsiDy\` via central differences with $\\varepsilon = 0.01$, (2) the curl field by rotating the gradient 90° per $F=(\\partial\\psi/\\partial y,\\ -\\partial\\psi/\\partial x)$, then remap its signed components into color (the debug-by-color technique) to see the vector field directly.`,
    },
    starterCode: `float psi(vec2 p) {
  return sin(p.x * 3.0) * cos(p.y * 3.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = (uv - 0.5) * 6.0;
  float eps = 0.01;

  // TODO 1: central-difference derivatives of psi at p
  float dPsiDx = 0.0;
  float dPsiDy = 0.0;

  // TODO 2: rotate the gradient 90 degrees -> divergence-free curl field
  // F = (dPsi/dy, -dPsi/dx)
  vec2 curl = vec2(0.0);

  // signed vector -> visible color, same remap as debug-by-color
  vec3 color = vec3(curl * 0.5 + 0.5, 0.5);
  fragColor = vec4(color, 1.0);
}`,
    solutionCode: `float psi(vec2 p) {
  return sin(p.x * 3.0) * cos(p.y * 3.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = (uv - 0.5) * 6.0;
  float eps = 0.01;

  float dPsiDx = (psi(p + vec2(eps, 0.0)) - psi(p - vec2(eps, 0.0))) / (2.0 * eps);
  float dPsiDy = (psi(p + vec2(0.0, eps)) - psi(p - vec2(0.0, eps))) / (2.0 * eps);

  vec2 curl = vec2(dPsiDy, -dPsiDx);

  vec3 color = vec3(curl * 0.5 + 0.5, 0.5);
  fragColor = vec4(color, 1.0);
}`,
    hints: [
      {
        vi: "Mỗi đạo hàm cần đúng 2 lần gọi psi() — một lệch +eps, một lệch -eps, theo đúng trục đang lấy đạo hàm — rồi chia cho 2*eps.",
        en: "Each derivative needs exactly 2 calls to psi() — one offset by +eps, one by -eps, along the axis being differentiated — then divide by 2*eps.",
      },
      {
        vi: "curl.x lấy dPsiDy (không phải dPsiDx), và curl.y là -dPsiDx (đừng quên dấu trừ) — đảo lộn thứ tự hoặc thiếu dấu vẫn ra một vector 'giống curl' nhưng không còn phân kỳ bằng 0.",
        en: "curl.x takes dPsiDy (not dPsiDx), and curl.y is -dPsiDx (don't drop the minus) — swapping the order or dropping the sign still produces a vector that 'looks like' curl but no longer has zero divergence.",
      },
    ],
    checklist: [
      {
        vi: "Hình hiện một trường màu xoáy mượt mà, khác hẳn dải sin/cos thẳng hàng nếu chỉ vẽ psi thô",
        en: "The image shows a smoothly swirling color field, clearly different from psi's plain sin/cos bands if drawn raw",
      },
      {
        vi: "curl.x dùng đúng dPsiDy và curl.y dùng đúng -dPsiDx, không đảo lộn",
        en: "curl.x correctly uses dPsiDy and curl.y correctly uses -dPsiDx, not swapped",
      },
      {
        vi: "Đổi eps thành một giá trị rất lớn (ví dụ 2.0) làm chi tiết xoáy mờ hẳn đi — xác nhận epsilon thực sự kiểm soát độ chi tiết của đạo hàm",
        en: "Changing eps to something very large (e.g. 2.0) visibly blurs out the swirl detail — confirming epsilon genuinely controls the derivative's detail level",
      },
    ],
  },
];
