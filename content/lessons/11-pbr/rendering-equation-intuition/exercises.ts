import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "cosine-term-solar-panel",
    kind: "concept",
    prompt: {
      vi: `Một tấm pin mặt trời cố định, pháp tuyến $n$ chỉ thẳng lên trời. Lúc trưa mặt trời ở ngay trên đỉnh nên $\\theta = 0°$ giữa $n$ và hướng tới mặt trời $\\omega_i$; lúc 16h mặt trời đã lệch xuống, $\\theta = 60°$. Coi $L_i$ (độ chói mặt trời phát ra) không đổi suốt cả ngày.

Dùng đúng số hạng $(n \\cdot \\omega_i) = \\cos\\theta$ trong $L_o = L_e + \\int_\\Omega f_r L_i (n\\cdot\\omega_i)\\, d\\omega_i$, tính tấm pin lúc 16h nhận được bao nhiêu phần trăm năng lượng so với lúc trưa (coi $f_r$ không đổi theo thời gian). Sau đó giải thích bằng lời: sự sụt giảm này đến từ số hạng nào của phương trình — và vì sao KHÔNG phải vì "mặt trời phát ít ánh sáng hơn vào buổi chiều".`,
      en: `A fixed solar panel has its normal $n$ pointing straight up. At noon the sun sits directly overhead, so $\\theta = 0°$ between $n$ and the sun direction $\\omega_i$; at 4pm the sun has dropped, so $\\theta = 60°$. Assume $L_i$ (the sun's emitted radiance) stays constant all day.

Using exactly the $(n \\cdot \\omega_i) = \\cos\\theta$ term in $L_o = L_e + \\int_\\Omega f_r L_i (n\\cdot\\omega_i)\\, d\\omega_i$, compute what percentage of noon's energy the panel receives at 4pm (assume $f_r$ doesn't change over the day). Then explain in words which term of the equation this drop comes from — and why it is NOT because "the sun emits less light in the afternoon".`,
    },
    hints: [
      {
        vi: "Tỉ lệ năng lượng chỉ phụ thuộc vào tỉ số hai giá trị cosine, vì $L_i$ và $f_r$ giả định không đổi giữa hai thời điểm — mọi số hạng khác của phương trình triệt tiêu khi lấy tỉ số.",
        en: "The energy ratio only depends on the ratio of the two cosine values, since $L_i$ and $f_r$ are assumed unchanged between the two moments — every other term of the equation cancels out when you take the ratio.",
      },
      {
        vi: "$\\cos(0°) = 1$, $\\cos(60°) = 0.5$ — tỉ lệ chính là $0.5 / 1 = 50\\%$. Đây là chính công thức $dA_\\perp = dA\\cos\\theta$: cùng một chùm sáng, chiếu xiên hơn thì trải rộng hơn trên cùng diện tích panel.",
        en: "$\\cos(0°) = 1$, $\\cos(60°) = 0.5$ — the ratio is simply $0.5 / 1 = 50\\%$. This is exactly the $dA_\\perp = dA\\cos\\theta$ formula: the same beam, arriving at a shallower angle, spreads over a larger footprint on the same panel area.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng tỉ lệ 50% (cos 60° / cos 0° = 0.5)",
        en: "I correctly computed the 50% ratio (cos 60° / cos 0° = 0.5)",
      },
      {
        vi: "Tôi chỉ đúng số hạng gây ra sụt giảm là $(n\\cdot\\omega_i)$, không phải $L_e$ hay $L_i$",
        en: "I correctly identified $(n\\cdot\\omega_i)$, not $L_e$ or $L_i$, as the term causing the drop",
      },
      {
        vi: "Tôi giải thích được vì sao đây là hệ quả hình học (diện tích chiếu), không phải mặt trời phát ít sáng hơn",
        en: "I can explain why this is a geometric consequence (projected area), not the sun emitting less light",
      },
    ],
    solutionCode: `// Ti le nang luong = cos(theta_4pm) / cos(theta_noon)
// cos(0deg)  = 1.0
// cos(60deg) = 0.5
// ratio = 0.5 / 1.0 = 0.5 -> tam pin nhan dung 50% nang luong so voi truot trua
//
// Su sut giam nay den tu so hang (n . omega_i) = cos(theta) trong phuong
// trinh -- KHONG phai Le (mat troi khong doi cach phat sang) va cung
// khong phai Li (do choi cua mat troi khong doi theo gia thiet de bai).
// Cung mot chum sang, khi chieu xien hon, trai nang luong cua no len mot
// dien tich be mat LON HON (dA_perp = dA * cos(theta)) -- mat do nang
// luong tren moi don vi dien tich panel giam dung theo ty le cosine do.`,
  },
  {
    id: "discrete-sum-lambert-multilight",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`shadeLambertMultiLight\` cài đặt đúng xấp xỉ Lambert của rendering equation: thay tích phân $\\int_\\Omega f_r L_i (n\\cdot\\omega_i)\\, d\\omega_i$ bằng một TỔNG HỮU HẠN qua một mảng đèn điểm đã biết hướng — $f_r = \\text{albedo}/\\pi$ không đổi, mỗi đèn đóng góp $\\frac{\\text{albedo}}{\\pi} \\cdot \\text{light.color} \\cdot \\max(0, n\\cdot\\text{light.dir})$. Cộng thêm $L_e$ (emissive) vào tổng cuối cùng.`,
      en: `Write a \`shadeLambertMultiLight\` function implementing the Lambert approximation of the rendering equation correctly: replace the integral $\\int_\\Omega f_r L_i (n\\cdot\\omega_i)\\, d\\omega_i$ with a FINITE SUM over an array of point lights with known directions — $f_r = \\text{albedo}/\\pi$ stays constant, each light contributes $\\frac{\\text{albedo}}{\\pi} \\cdot \\text{light.color} \\cdot \\max(0, n\\cdot\\text{light.dir})$. Add $L_e$ (emissive) into the final sum.`,
    },
    starterCode: `interface Vec3 { x: number; y: number; z: number; }
interface PointLight { dir: Vec3; color: Vec3; } // dir: normalized, pointing FROM surface TOWARD the light

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}
function scale(v: Vec3, s: number): Vec3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}
function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}
function mul(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x * b.x, y: a.y * b.y, z: a.z * b.z };
}

// TODO: Lo ~= Le + sum_lights (albedo/PI) * light.color * max(0, dot(n, light.dir))
function shadeLambertMultiLight(
  n: Vec3,
  albedo: Vec3,
  emissive: Vec3,
  lights: PointLight[],
): Vec3 {
  return emissive;
}`,
    solutionCode: `interface Vec3 { x: number; y: number; z: number; }
interface PointLight { dir: Vec3; color: Vec3; }

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}
function scale(v: Vec3, s: number): Vec3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}
function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}
function mul(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x * b.x, y: a.y * b.y, z: a.z * b.z };
}

function shadeLambertMultiLight(
  n: Vec3,
  albedo: Vec3,
  emissive: Vec3,
  lights: PointLight[],
): Vec3 {
  // fr = albedo / PI, constant Lambert BRDF -- the "no integral" special case
  const fr = scale(albedo, 1 / Math.PI);

  let sum: Vec3 = { x: 0, y: 0, z: 0 };
  for (const light of lights) {
    const ndotl = Math.max(0, dot(n, light.dir)); // the cosine term, clamped
    sum = add(sum, scale(mul(fr, light.color), ndotl));
  }

  return add(emissive, sum); // Lo = Le + discrete sum approximating the integral
}`,
    hints: [
      {
        vi: "Đây chính là công thức $L_o \\approx L_e + \\sum_{\\text{lights}} \\frac{\\text{albedo}}{\\pi} L_i \\max(0, n\\cdot\\omega_i)$ trong bài lý thuyết — chỉ việc dịch thẳng từng ký hiệu sang code, không có logic nào khác.",
        en: "This is exactly the $L_o \\approx L_e + \\sum_{\\text{lights}} \\frac{\\text{albedo}}{\\pi} L_i \\max(0, n\\cdot\\omega_i)$ formula from the theory — just translate each symbol directly into code, there's no extra logic beyond that.",
      },
      {
        vi: "Đừng quên $\\max(0, \\ldots)$ quanh dot product — thiếu nó, một đèn nằm sau bề mặt (dot âm) sẽ TRỪ sáng thay vì đóng góp 0, một lỗi khác với lỗi 'quên cosine' nhưng cùng họ.",
        en: "Don't forget $\\max(0, \\ldots)$ around the dot product — without it, a light behind the surface (negative dot) SUBTRACTS light instead of contributing 0, a different but related mistake from 'forgetting cosine' entirely.",
      },
    ],
    checklist: [
      {
        vi: "Hàm cộng đúng L_e vào tổng cuối cùng, không nhân nó với gì cả",
        en: "The function adds L_e into the final sum unmodified, not multiplied by anything",
      },
      {
        vi: "fr = albedo/PI được tính một lần, dùng lại cho mọi đèn (BRDF không đổi theo đèn)",
        en: "fr = albedo/PI is computed once and reused for every light (the BRDF doesn't change per light)",
      },
      {
        vi: "Mỗi đèn được kẹp bằng max(0, dot(n, light.dir)) trước khi cộng vào tổng",
        en: "Each light is clamped with max(0, dot(n, light.dir)) before being added to the sum",
      },
    ],
  },
];
