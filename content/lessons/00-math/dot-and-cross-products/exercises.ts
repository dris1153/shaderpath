import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "dot-product-angle-and-facing",
    kind: "concept",
    prompt: {
      vi: `Một bề mặt có pháp tuyến đã normalize $\\hat n = (0, 1, 0)$. Hướng tới nguồn sáng cũng đã normalize là $\\hat L = (0.6, 0.8, 0)$.

Tính $\\hat n \\cdot \\hat L$ bằng công thức đại số (tổng tích từng thành phần). Từ kết quả đó, hãy suy ra góc $\\theta$ giữa hai vector bằng $\\theta = \\arccos(\\hat n \\cdot \\hat L)$, và trả lời: bề mặt này có đang "quay về phía" ánh sáng hay không?`,
      en: `A surface has a normalized normal $\\hat n = (0, 1, 0)$. The direction toward a light source, also normalized, is $\\hat L = (0.6, 0.8, 0)$.

Compute $\\hat n \\cdot \\hat L$ using the algebraic formula (sum of component products). From that result, derive the angle $\\theta$ between the two vectors using $\\theta = \\arccos(\\hat n \\cdot \\hat L)$, and answer: is this surface currently "facing" the light?`,
    },
    hints: [
      {
        vi: "Với hai vector đã normalize, dot product bằng đúng $\\cos\\theta$ — không cần chia cho độ dài nào cả.",
        en: "For two normalized vectors, the dot product equals $\\cos\\theta$ exactly — no length division needed.",
      },
      {
        vi: "Dot dương nghĩa là góc nhỏ hơn 90°, tức bề mặt hướng về phía nguồn sáng chứ không quay lưng lại.",
        en: "A positive dot means the angle is under 90°, meaning the surface faces the light rather than turning away from it.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng $\\hat n \\cdot \\hat L = 0.8$",
        en: "I computed $\\hat n \\cdot \\hat L = 0.8$ correctly",
      },
      {
        vi: "Tôi suy ra đúng $\\theta = \\arccos(0.8) \\approx 36.87°$",
        en: "I correctly derived $\\theta = \\arccos(0.8) \\approx 36.87°$",
      },
      {
        vi: "Tôi giải thích được vì sao dot dương nghĩa là bề mặt hướng về phía ánh sáng",
        en: "I can explain why a positive dot means the surface faces the light",
      },
    ],
    solutionNote: {
      vi: `$\\hat n \\cdot \\hat L = (0)(0.6) + (1)(0.8) + (0)(0) = 0.8$, nên $\\theta = \\arccos(0.8) \\approx 36.87^\\circ$.

Vì $0.8 > 0$ nên $\\theta < 90^\\circ$: bề mặt đang hướng về phía nguồn sáng, tức là được chiếu sáng. Bề mặt chỉ quay lưng lại với nguồn sáng khi dot product $\\le 0$.`,
      en: `$\\hat n \\cdot \\hat L = (0)(0.6) + (1)(0.8) + (0)(0) = 0.8$, so $\\theta = \\arccos(0.8) \\approx 36.87^\\circ$.

Since $0.8 > 0$, $\\theta < 90^\\circ$: the surface faces the light source and is lit. A surface only turns away from the light once the dot product is $\\le 0$.`,
    },
  },
  {
    id: "cross-product-triangle-normal",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`triangleNormal(a, b, c)\` trả về pháp tuyến đơn vị của một tam giác có ba đỉnh \`a\`, \`b\`, \`c\` (kiểu \`Vec3\`), dùng cross product của hai vector cạnh xuất phát từ đỉnh \`a\`.`,
      en: `Write a function \`triangleNormal(a, b, c)\` that returns the unit normal of a triangle with vertices \`a\`, \`b\`, \`c\` (type \`Vec3\`), using the cross product of two edge vectors starting from vertex \`a\`.`,
    },
    starterCode: `interface Vec3 { x: number; y: number; z: number }

function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function triangleNormal(a: Vec3, b: Vec3, c: Vec3): Vec3 {
  // TODO: take the two edge vectors (b-a) and (c-a), cross them, then normalize
  return { x: 0, y: 0, z: 0 };
}`,
    solutionCode: `interface Vec3 { x: number; y: number; z: number }

function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function cross(u: Vec3, v: Vec3): Vec3 {
  return {
    x: u.y * v.z - u.z * v.y,
    y: u.z * v.x - u.x * v.z,
    z: u.x * v.y - u.y * v.x,
  };
}

function length(v: Vec3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function triangleNormal(a: Vec3, b: Vec3, c: Vec3): Vec3 {
  const n = cross(sub(b, a), sub(c, a));
  const len = length(n);
  if (len < 1e-8) return { x: 0, y: 0, z: 0 }; // degenerate triangle (collinear points)
  return { x: n.x / len, y: n.y / len, z: n.z / len };
}`,
    hints: [
      {
        vi: "Thứ tự cross quan trọng: cross(b-a, c-a) và cross(c-a, b-a) cho hai pháp tuyến ngược hướng nhau.",
        en: "Cross order matters: cross(b-a, c-a) and cross(c-a, b-a) give two normals pointing opposite ways.",
      },
      {
        vi: "Đừng quên normalize kết quả cross — độ dài của nó bằng diện tích hình bình hành (gấp đôi diện tích tam giác), không phải 1.",
        en: "Don't forget to normalize the cross result — its length equals the parallelogram's area (twice the triangle's), not 1.",
      },
    ],
    checklist: [
      {
        vi: "Với tam giác nằm trong mặt phẳng XY, ba đỉnh theo chiều ngược kim đồng hồ, pháp tuyến trả về là (0, 0, 1)",
        en: "For a triangle in the XY plane with vertices wound counter-clockwise, the returned normal is (0, 0, 1)",
      },
      {
        vi: "Kết quả trả về luôn là vector đơn vị (độ dài xấp xỉ 1)",
        en: "The returned result is always a unit vector (length approximately 1)",
      },
      {
        vi: "Đổi thứ tự hai đỉnh bất kỳ (đảo winding) làm pháp tuyến đảo dấu",
        en: "Swapping any two vertices (reversing the winding) flips the sign of the normal",
      },
    ],
  },
];
