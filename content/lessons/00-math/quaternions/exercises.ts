import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "quaternion-from-axis-angle-and-double-cover",
    kind: "concept",
    prompt: {
      vi: `Cho trục $\\hat a = (0, 0, 1)$ (trục Z) và góc $\\theta = 120°$. Không chạy code, dùng công thức $q = (\\hat a \\sin\\frac{\\theta}{2}, \\cos\\frac{\\theta}{2})$ để tính bốn thành phần $(x, y, z, w)$ của $q$, rồi xác nhận $\\|q\\| = 1$.

Sau đó trả lời: quaternion $-q$ (đảo dấu cả bốn thành phần) mô tả phép xoay nào so với $q$? Và slerp giữa hai quaternion $q_1, q_2$ sẽ chọn đi qua $-q_2$ thay vì $q_2$ khi nào?`,
      en: `Given axis $\\hat a = (0, 0, 1)$ (the Z axis) and angle $\\theta = 120°$. Without running any code, use $q = (\\hat a \\sin\\frac{\\theta}{2}, \\cos\\frac{\\theta}{2})$ to compute the four components $(x, y, z, w)$ of $q$, then confirm $\\|q\\| = 1$.

Then answer: which rotation does $-q$ (all four components negated) describe compared to $q$? And when would slerp between two quaternions $q_1, q_2$ choose to go through $-q_2$ instead of $q_2$?`,
    },
    hints: [
      {
        vi: "$\\theta/2 = 60°$. $\\sin 60° \\approx 0.866$, $\\cos 60° = 0.5$. Trục $(0,0,1)$ chỉ để nguyên thành phần $z$ khác không.",
        en: "$\\theta/2 = 60°$. $\\sin 60° \\approx 0.866$, $\\cos 60° = 0.5$. The axis $(0,0,1)$ leaves only the $z$ component non-zero.",
      },
      {
        vi: "Ma trận xoay dựng từ quaternion chỉ chứa tích của từng CẶP thành phần — đảo dấu cả bốn không đổi bất kỳ tích nào.",
        en: "The rotation matrix built from a quaternion only contains products of PAIRS of components — negating all four changes none of those products.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng $q = (0, 0, 0.866, 0.5)$",
        en: "I correctly computed $q = (0, 0, 0.866, 0.5)$",
      },
      {
        vi: "Tôi xác nhận $0.866^2 + 0.5^2 = 1$",
        en: "I confirmed $0.866^2 + 0.5^2 = 1$",
      },
      {
        vi: "Tôi giải thích được $-q$ mô tả CÙNG một phép xoay với $q$, và slerp chọn $-q_2$ khi $q_1 \\cdot q_2 < 0$",
        en: "I can explain that $-q$ describes the SAME rotation as $q$, and slerp picks $-q_2$ when $q_1 \\cdot q_2 < 0$",
      },
    ],
    solutionNote: {
      vi: `$\\theta/2 = 60^\\circ$, $\\sin 60^\\circ \\approx 0.866$, $\\cos 60^\\circ = 0.5$. $q = ((0,0,1)\\times 0.866,\\ 0.5) = (0, 0, 0.866, 0.5)$. $\\|q\\| = \\sqrt{0^2+0^2+0.866^2+0.5^2} = \\sqrt{0.75+0.25} = 1$ ✓.

$-q = (0, 0, -0.866, -0.5)$ mô tả CÙNG một phép xoay với $q$ (double cover: $R(q) = R(-q)$, vì ma trận xoay chỉ chứa tích từng cặp thành phần).

$\\mathrm{slerp}(q_1, q_2, t)$ đi qua $-q_2$ thay vì $q_2$ khi $\\mathrm{dot}(q_1, q_2) < 0$ — tức góc đo trực tiếp giữa hai quaternion lớn hơn $90^\\circ$, nên đảo dấu một cái trước khi slerp mới ra đường ngắn nhất trên mặt cầu $S^3$.`,
      en: `$\\theta/2 = 60^\\circ$, $\\sin 60^\\circ \\approx 0.866$, $\\cos 60^\\circ = 0.5$. $q = ((0,0,1)\\times 0.866,\\ 0.5) = (0, 0, 0.866, 0.5)$. $\\|q\\| = \\sqrt{0^2+0^2+0.866^2+0.5^2} = \\sqrt{0.75+0.25} = 1$ ✓.

$-q = (0, 0, -0.866, -0.5)$ describes the SAME rotation as $q$ (double cover: $R(q) = R(-q)$, since the rotation matrix only contains products of pairs of components).

$\\mathrm{slerp}(q_1, q_2, t)$ goes through $-q_2$ instead of $q_2$ when $\\mathrm{dot}(q_1, q_2) < 0$ — meaning the angle directly between the two quaternions exceeds $90^\\circ$, so one needs to be negated before slerp takes the shortest path on the $S^3$ sphere.`,
    },
  },
  {
    id: "axis-angle-to-quaternion-code",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`axisAngleToQuaternion(axis, angleRad)\` trả về quaternion $(x,y,z,w)$ theo công thức $q = (\\hat a \\sin\\frac{\\theta}{2}, \\cos\\frac{\\theta}{2})$. Hàm phải tự normalize \`axis\` trước khi dùng (không giả định input đã là vector đơn vị), và không được để lọt \`NaN\` khi \`axis\` là $(0,0,0)$.`,
      en: `Write a function \`axisAngleToQuaternion(axis, angleRad)\` that returns the quaternion $(x,y,z,w)$ using $q = (\\hat a \\sin\\frac{\\theta}{2}, \\cos\\frac{\\theta}{2})$. The function must normalize \`axis\` itself before using it (don't assume the input is already a unit vector), and must not let \`NaN\` leak out when \`axis\` is $(0,0,0)$.`,
    },
    starterCode: `interface Quat { x: number; y: number; z: number; w: number }
interface Vec3 { x: number; y: number; z: number }

function axisAngleToQuaternion(axis: Vec3, angleRad: number): Quat {
  // TODO 1: compute length(axis); if it's too small, fall back to the default axis (0,0,1) to avoid dividing by 0
  // TODO 2: normalize axis
  // TODO 3: half = angleRad / 2; apply the formula q = (axis * sin(half), cos(half))
  return { x: 0, y: 0, z: 0, w: 1 };
}`,
    solutionCode: `interface Quat { x: number; y: number; z: number; w: number }
interface Vec3 { x: number; y: number; z: number }

function axisAngleToQuaternion(axis: Vec3, angleRad: number): Quat {
  const len = Math.hypot(axis.x, axis.y, axis.z);
  const ax = len < 1e-8 ? 0 : axis.x / len;
  const ay = len < 1e-8 ? 0 : axis.y / len;
  const az = len < 1e-8 ? 1 : axis.z / len; // guard: degenerate input falls back to Z axis
  const half = angleRad / 2;
  const s = Math.sin(half);
  return { x: ax * s, y: ay * s, z: az * s, w: Math.cos(half) };
}`,
    hints: [
      {
        vi: "Dùng \`Math.hypot(x, y, z)\` để tính độ dài axis an toàn — tránh tự cộng bình phương rồi Math.sqrt bị tràn số với input rất lớn.",
        en: "Use \`Math.hypot(x, y, z)\` for a safe axis length — avoids manually squaring-and-summing, which can overflow on very large inputs.",
      },
      {
        vi: "w luôn là \`Math.cos(angleRad / 2)\`, không phụ thuộc axis — chỉ x, y, z mới cần axis đã normalize.",
        en: "w is always \`Math.cos(angleRad / 2)\`, independent of the axis — only x, y, z need the normalized axis.",
      },
    ],
    checklist: [
      {
        vi: "axisAngleToQuaternion({x:0,y:0,z:1}, Math.PI) trả về xấp xỉ {x:0,y:0,z:1,w:0}",
        en: "axisAngleToQuaternion({x:0,y:0,z:1}, Math.PI) returns approximately {x:0,y:0,z:1,w:0}",
      },
      {
        vi: "Kết quả luôn có độ dài xấp xỉ 1 (x²+y²+z²+w² ≈ 1) với mọi axis khác (0,0,0)",
        en: "The result always has length approximately 1 (x²+y²+z²+w² ≈ 1) for any axis other than (0,0,0)",
      },
      {
        vi: "axisAngleToQuaternion({x:0,y:0,z:0}, ...) không trả về NaN — có guard rõ ràng",
        en: "axisAngleToQuaternion({x:0,y:0,z:0}, ...) does not return NaN — there's an explicit guard",
      },
    ],
  },
];
