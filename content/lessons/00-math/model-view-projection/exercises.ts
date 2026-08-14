import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "clip-w-and-ndc-z",
    kind: "concept",
    prompt: {
      vi: `Một điểm nằm trong view space tại $z_{view} = -8$ (8 đơn vị trước camera), với $\\text{near} = 0.1$ và $\\text{far} = 100$. Dùng đúng hai công thức $w_{clip} = -z_{view}$ và $z_{clip} = \\frac{\\text{far}+\\text{near}}{\\text{near}-\\text{far}} \\cdot z_{view} + \\frac{2\\,\\text{far}\\,\\text{near}}{\\text{near}-\\text{far}}$ (rồi $z_{ndc} = z_{clip} / w_{clip}$), hãy tính $w_{clip}$ và $z_{ndc}$.

Sau đó trả lời: điểm này chỉ cách camera 8 đơn vị trong khi far xa tới 100 đơn vị — vậy vì sao $z_{ndc}$ lại nằm rất gần đầu $+1$ (đầu far) của khoảng $[-1,1]$ thay vì ở giữa?`,
      en: `A point sits in view space at $z_{view} = -8$ (8 units in front of the camera), with $\\text{near} = 0.1$ and $\\text{far} = 100$. Using exactly two formulas, $w_{clip} = -z_{view}$ and $z_{clip} = \\frac{\\text{far}+\\text{near}}{\\text{near}-\\text{far}} \\cdot z_{view} + \\frac{2\\,\\text{far}\\,\\text{near}}{\\text{near}-\\text{far}}$ (then $z_{ndc} = z_{clip} / w_{clip}$), compute $w_{clip}$ and $z_{ndc}$.

Then answer: this point is only 8 units from the camera while far reaches all the way to 100 — so why does $z_{ndc}$ land so close to the $+1$ (far) end of $[-1,1]$ instead of near the middle?`,
    },
    hints: [
      {
        vi: "w_clip chỉ đơn giản là -z_view — không cần công thức phức tạp nào cho phần này.",
        en: "w_clip is just -z_view — no complex formula needed for that half.",
      },
      {
        vi: "Số hạng far*near/z_view làm z_ndc nén phi tuyến: phần lớn khoảng [-1,1] dành cho vùng GẦN near, phần còn lại rất hẹp trải dài hết quãng đường tới far.",
        en: "The far*near/z_view term compresses z_ndc nonlinearly: most of [-1,1] is spent near the near plane, and the remaining sliver stretches all the way out to far.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng w_clip = 8",
        en: "I computed w_clip = 8 correctly",
      },
      {
        vi: "Tôi tính đúng z_ndc ≈ 0.977",
        en: "I computed z_ndc ≈ 0.977 correctly",
      },
      {
        vi: "Tôi giải thích được vì sao độ chính xác depth buffer tập trung gần near plane, không dàn đều tới far",
        en: "I can explain why depth-buffer precision concentrates near the near plane instead of spreading evenly out to far",
      },
    ],
    solutionNote: {
      vi: `$w_{clip} = -z_{view} = -(-8) = 8$.

$z_{clip} = \\frac{far+near}{near-far} \\cdot z_{view} + \\frac{2\\,far\\,near}{near-far} = \\frac{100.1}{-99.9}\\cdot(-8) + \\frac{20}{-99.9} \\approx 8.016016 - 0.200200 \\approx 7.815816$.

$z_{ndc} = z_{clip} / w_{clip} = 7.815816 / 8 \\approx 0.976977$.

Phép ánh xạ từ $z$ trong view space sang $z$ trong NDC gần đúng là $z_{ndc} \\sim 1/z$ — không tuyến tính. Một điểm chỉ đi được 8% quãng đường từ near tới far theo trục *tuyến tính* đã nằm ở khoảng 99% dải NDC — phần lớn $[-1,1]$ được dùng để phân giải độ sâu gần camera, còn phần nhỏ còn lại bị kéo dãn ra để phủ hết quãng đường tới gần "far". Đây chính là lý do z-fighting xuất hiện ở hình học ở xa, không phải ở gần.`,
      en: `$w_{clip} = -z_{view} = -(-8) = 8$.

$z_{clip} = \\frac{far+near}{near-far} \\cdot z_{view} + \\frac{2\\,far\\,near}{near-far} = \\frac{100.1}{-99.9}\\cdot(-8) + \\frac{20}{-99.9} \\approx 8.016016 - 0.200200 \\approx 7.815816$.

$z_{ndc} = z_{clip} / w_{clip} = 7.815816 / 8 \\approx 0.976977$.

The mapping from view-space $z$ to NDC $z$ is roughly $z_{ndc} \\sim 1/z$ — not linear. A point just 8% of the way from near to far along the *linear* axis already sits at ~99% of the NDC range: most of $[-1,1]$ is spent resolving depth close to the camera, and the sliver left over is stretched to cover everything out near "far". This is exactly why z-fighting shows up on distant geometry, not nearby geometry.`,
    },
  },
  {
    id: "code-lookat-basis",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`lookAtBasis(eye, target, worldUp)\` trả về ba vector đơn vị \`right\`, \`up\`, \`forward\` dùng đúng công thức lookAt: $\\hat f = \\widehat{eye - target}$, $\\hat r = \\widehat{worldUp \\times \\hat f}$, $\\hat u = \\hat f \\times \\hat r$. Ba vector này chính là ba cột đầu của ma trận camera-to-world $C$.`,
      en: `Write a \`lookAtBasis(eye, target, worldUp)\` function returning three unit vectors, \`right\`, \`up\`, \`forward\`, using the lookAt formula: $\\hat f = \\widehat{eye - target}$, $\\hat r = \\widehat{worldUp \\times \\hat f}$, $\\hat u = \\hat f \\times \\hat r$. These three vectors are the first three columns of the camera-to-world matrix $C$.`,
    },
    starterCode: `interface Vec3 { x: number; y: number; z: number; }

function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}
function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}
function normalize(v: Vec3): Vec3 {
  const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  return len > 1e-8 ? { x: v.x / len, y: v.y / len, z: v.z / len } : { x: 0, y: 0, z: 0 };
}

function lookAtBasis(eye: Vec3, target: Vec3, worldUp: Vec3) {
  // TODO 1: forward = normalize(eye - target) — points AWAY from the view direction
  // TODO 2: right = normalize(cross(worldUp, forward))
  // TODO 3: up = cross(forward, right) — already unit length, no need to normalize again
  return {
    right: { x: 0, y: 0, z: 0 },
    up: { x: 0, y: 0, z: 0 },
    forward: { x: 0, y: 0, z: 0 },
  };
}`,
    solutionCode: `interface Vec3 { x: number; y: number; z: number; }

function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}
function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}
function normalize(v: Vec3): Vec3 {
  const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  return len > 1e-8 ? { x: v.x / len, y: v.y / len, z: v.z / len } : { x: 0, y: 0, z: 0 };
}

function lookAtBasis(eye: Vec3, target: Vec3, worldUp: Vec3) {
  const forward = normalize(sub(eye, target));
  const right = normalize(cross(worldUp, forward));
  const up = cross(forward, right);
  return { right, up, forward };
}`,
    hints: [
      {
        vi: "forward trỏ NGƯỢC hướng nhìn (quy ước tay phải): eye trừ target, không phải target trừ eye.",
        en: "forward points AWAY from the view direction (right-hand convention): eye minus target, not target minus eye.",
      },
      {
        vi: "up cuối cùng không cần normalize lại — forward và right đã trực giao và đơn vị, nên cross của chúng tự động có độ dài 1.",
        en: "The final up doesn't need re-normalizing — forward and right are already orthogonal unit vectors, so their cross product is automatically unit length.",
      },
    ],
    checklist: [
      {
        vi: "right, up, forward đều là vector đơn vị (độ dài ≈ 1)",
        en: "right, up, forward are all unit vectors (length ≈ 1)",
      },
      {
        vi: "Với eye=(0,0,5), target=(0,0,0), worldUp=(0,1,0): forward=(0,0,1), right=(1,0,0), up=(0,1,0)",
        en: "With eye=(0,0,5), target=(0,0,0), worldUp=(0,1,0): forward=(0,0,1), right=(1,0,0), up=(0,1,0)",
      },
      {
        vi: "Code không dùng bất kỳ thư viện vector/matrix ngoài nào — chỉ Math thuần",
        en: "The code doesn't use any external vector/matrix library — just plain Math",
      },
    ],
  },
];
