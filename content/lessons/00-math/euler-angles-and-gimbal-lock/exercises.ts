import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "gimbal-lock-numeric-check",
    kind: "concept",
    prompt: {
      vi: `Bài học chứng minh rằng tại $\\beta = 90°$ (pitch, trục giữa), ma trận $R(\\alpha,90°,\\gamma)$ chỉ còn phụ thuộc hiệu số $\\alpha - \\gamma$.

Không chạy code, hãy kiểm tra điều đó với hai cặp góc: $(\\alpha,\\gamma) = (60°, 25°)$ và $(\\alpha,\\gamma) = (10°, -25°)$. Tính $\\alpha - \\gamma$ cho từng cặp, rồi tính $\\sin(\\alpha-\\gamma)$ và $\\cos(\\alpha-\\gamma)$.

Sau đó trả lời bằng một câu: hai cặp góc Euler này có mô tả cùng một hướng xoay không, và vì sao?`,
      en: `The lesson proves that at $\\beta = 90°$ (pitch, the middle axis), the matrix $R(\\alpha,90°,\\gamma)$ only depends on the difference $\\alpha - \\gamma$.

Without running any code, verify this with two angle pairs: $(\\alpha,\\gamma) = (60°, 25°)$ and $(\\alpha,\\gamma) = (10°, -25°)$. Compute $\\alpha - \\gamma$ for each pair, then compute $\\sin(\\alpha-\\gamma)$ and $\\cos(\\alpha-\\gamma)$.

Then answer in one sentence: do these two Euler triples describe the same rotation, and why?`,
    },
    hints: [
      {
        vi: "Trừ trực tiếp: $60° - 25° = 35°$ và $10° - (-25°) = 35°$ — chú ý dấu trừ của số âm.",
        en: "Subtract directly: $60° - 25° = 35°$ and $10° - (-25°) = 35°$ — watch the sign on the negative number.",
      },
      {
        vi: "Nếu hai hiệu số bằng nhau, thay vào công thức $R(\\alpha,90°,\\gamma)$ ở bài học sẽ ra đúng cùng một ma trận — không cần biết $\\alpha$ và $\\gamma$ riêng lẻ là bao nhiêu.",
        en: "If the two differences are equal, plugging them into the lesson's $R(\\alpha,90°,\\gamma)$ formula yields the exact same matrix — you never need to know $\\alpha$ and $\\gamma$ individually.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng cả hai hiệu số bằng $35°$",
        en: "I correctly computed both differences as $35°$",
      },
      {
        vi: "Tôi tính đúng $\\sin 35° \\approx 0.574$ và $\\cos 35° \\approx 0.819$",
        en: "I correctly computed $\\sin 35° \\approx 0.574$ and $\\cos 35° \\approx 0.819$",
      },
      {
        vi: "Tôi giải thích được vì sao hai bộ ba góc khác nhau lại mô tả cùng một hướng xoay ở $\\beta=90°$",
        en: "I can explain why two different angle triples describe the same orientation at $\\beta=90°$",
      },
    ],
    solutionCode: `// (60°, 25°): alpha - gamma = 35°
// (10°, -25°): alpha - gamma = 10° - (-25°) = 35°  <- same difference
//
// sin(35°) ≈ 0.574, cos(35°) ≈ 0.819 for both pairs, so both plug into
// R(alpha, 90°, gamma) and produce the identical matrix:
//   [ 0     0.574   0.819]
//   [ 0     0.819  -0.574]
//   [-1     0       0    ]
//
// Cùng một hướng xoay, dù alpha/gamma riêng lẻ khác hẳn nhau — đúng là
// gimbal lock: ở beta=90°, chỉ (alpha - gamma) còn mang thông tin, một
// bậc tự do đã biến mất.`,
  },
  {
    id: "compose-euler-xyz-vs-zyx",
    kind: "code",
    prompt: {
      vi: `Hoàn thiện \`rotateZ\` (theo mẫu \`rotateX\`/\`rotateY\` đã có), rồi viết \`applyEulerXYZ\` (order \`"XYZ"\` mặc định của Three.js: xoay X trước, Y sau, Z cuối) và \`applyEulerZYX\` (thứ tự ngược lại: Z trước, Y sau, X cuối) bằng cách lồng ba hàm rotate lại với nhau.

Chạy cả hai với \`v = [1, 0, 0]\` và \`x = y = z = Math.PI / 2\`, và xác nhận hai hàm cho ra hai vector khác nhau.`,
      en: `Complete \`rotateZ\` (following the \`rotateX\`/\`rotateY\` pattern already given), then write \`applyEulerXYZ\` (Three.js's default \`"XYZ"\` order: rotate X first, then Y, then Z) and \`applyEulerZYX\` (reverse order: Z first, then Y, then X) by nesting the three rotate functions together.

Run both with \`v = [1, 0, 0]\` and \`x = y = z = Math.PI / 2\`, and confirm the two functions return different vectors.`,
    },
    starterCode: `type Vec3 = [number, number, number];

// đã có sẵn / already given
function rotateX(v: Vec3, a: number): Vec3 {
  const [x, y, z] = v;
  return [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
}
function rotateY(v: Vec3, a: number): Vec3 {
  const [x, y, z] = v;
  return [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)];
}

function rotateZ(v: Vec3, a: number): Vec3 {
  // TODO: theo mẫu rotateX/rotateY, nhưng z giữ nguyên, x/y trộn với nhau
  return v;
}

function applyEulerXYZ(v: Vec3, x: number, y: number, z: number): Vec3 {
  // TODO: xoay X trước (lồng trong cùng), rồi Y, rồi Z (ngoài cùng)
  return v;
}

function applyEulerZYX(v: Vec3, x: number, y: number, z: number): Vec3 {
  // TODO: thứ tự ngược lại: Z trước, rồi Y, rồi X
  return v;
}`,
    solutionCode: `type Vec3 = [number, number, number];

function rotateX(v: Vec3, a: number): Vec3 {
  const [x, y, z] = v;
  return [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
}
function rotateY(v: Vec3, a: number): Vec3 {
  const [x, y, z] = v;
  return [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)];
}
function rotateZ(v: Vec3, a: number): Vec3 {
  const [x, y, z] = v;
  return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z];
}

function applyEulerXYZ(v: Vec3, x: number, y: number, z: number): Vec3 {
  return rotateZ(rotateY(rotateX(v, x), y), z);
}

function applyEulerZYX(v: Vec3, x: number, y: number, z: number): Vec3 {
  return rotateX(rotateY(rotateZ(v, z), y), x);
}

// v=[1,0,0], x=y=z=Math.PI/2:
// applyEulerXYZ  -> [0, 0, -1]
// applyEulerZYX  -> [0, 0, 1]   <- opposite Z, same three angles`,
    hints: [
      {
        vi: "rotateZ theo đúng mẫu rotateX/rotateY: thành phần trùng tên trục thì giữ nguyên, hai thành phần còn lại trộn theo cos/sin.",
        en: "rotateZ follows the same pattern as rotateX/rotateY: the component sharing the axis name stays put, the other two mix via cos/sin.",
      },
      {
        vi: "Lồng hàm 'trong ra ngoài': phép xoay ĐẦU TIÊN áp dụng là lời gọi nằm trong cùng, gần \`v\` nhất.",
        en: "Nest the calls 'inside out': the FIRST rotation applied is the innermost call, the one closest to \`v\`.",
      },
    ],
    checklist: [
      {
        vi: "rotateZ([1, 0, 0], Math.PI / 2) trả về xấp xỉ [0, 1, 0]",
        en: "rotateZ([1, 0, 0], Math.PI / 2) returns approximately [0, 1, 0]",
      },
      {
        vi: "applyEulerXYZ và applyEulerZYX cho ra hai vector KHÁC nhau với cùng input [1,0,0] và góc 90°/90°/90°",
        en: "applyEulerXYZ and applyEulerZYX return DIFFERENT vectors for the same [1,0,0] input and 90°/90°/90° angles",
      },
      {
        vi: "Tôi giải thích được applyEulerXYZ khớp với order mặc định của THREE.Euler",
        en: "I can explain that applyEulerXYZ matches THREE.Euler's default order",
      },
    ],
  },
];
