import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "barycentric-and-fragment-count",
    kind: "concept",
    prompt: {
      vi: `Ba đỉnh của một tam giác được gán màu qua varying \`vColor\`: đỏ $(1,0,0)$, lục $(0,1,0)$, lam $(0,0,1)$. Không chạy code:

(a) Tính màu nội suy tại một fragment có toạ độ trọng tâm $(\\lambda_0, \\lambda_1, \\lambda_2) = (0.5, 0.3, 0.2)$ bằng công thức $V = \\lambda_0 V_0 + \\lambda_1 V_1 + \\lambda_2 V_2$.

(b) Tam giác đó là đúng nửa một hình vuông 400×400 pixel trên canvas 1920×1080 (diện tích tam giác = nửa diện tích hình vuông). Ước lượng: vertex shader chạy bao nhiêu lần, và fragment shader chạy khoảng bao nhiêu lần?`,
      en: `A triangle's three vertices are assigned colors through a \`vColor\` varying: red $(1,0,0)$, green $(0,1,0)$, blue $(0,0,1)$. Without running code:

(a) Compute the interpolated color at a fragment with barycentric coordinates $(\\lambda_0, \\lambda_1, \\lambda_2) = (0.5, 0.3, 0.2)$ using $V = \\lambda_0 V_0 + \\lambda_1 V_1 + \\lambda_2 V_2$.

(b) That triangle is exactly half of a 400×400 pixel square on a 1920×1080 canvas (the triangle's area = half the square's area). Estimate: how many times does the vertex shader run, and roughly how many times does the fragment shader run?`,
    },
    hints: [
      {
        vi: "Với (a): nhân từng thành phần R, G, B riêng biệt theo đúng trọng số λ tương ứng, rồi cộng lại — giống hệt phép lerp 3 chiều.",
        en: "For (a): multiply each of the R, G, B components separately by its matching λ weight, then sum — it's exactly a 3-way lerp.",
      },
      {
        vi: "Với (b): vertex shader luôn chạy đúng 3 lần cho một tam giác, không phụ thuộc kích thước. Diện tích hình vuông là 400×400; tam giác chiếm nửa diện tích đó.",
        en: "For (b): the vertex shader always runs exactly 3 times for one triangle, regardless of size. The square's area is 400×400; the triangle covers half of that.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng màu nội suy = (0.5, 0.3, 0.2)",
        en: "I computed the interpolated color correctly as (0.5, 0.3, 0.2)",
      },
      {
        vi: "Tôi nêu đúng vertex shader chạy 3 lần, không đổi theo kích thước tam giác",
        en: "I correctly stated the vertex shader runs 3 times, unaffected by triangle size",
      },
      {
        vi: "Tôi tính đúng fragment shader chạy khoảng 80.000 lần (400×400/2) và ghi rõ đây là số ước lượng",
        en: "I computed the fragment shader runs roughly 80,000 times (400×400/2) and labeled it as an estimate",
      },
    ],
    solutionNote: {
      vi: `(a) $V = 0.5(1,0,0) + 0.3(0,1,0) + 0.2(0,0,1) = (0.5, 0, 0) + (0, 0.3, 0) + (0, 0, 0.2) = (0.5, 0.3, 0.2)$.

(b) vertex shader: đúng 3 lần (3 đỉnh, không phụ thuộc kích thước tam giác). fragment shader: ước lượng khoảng $(400 \\times 400) / 2 = 80.000$ lần (diện tích tam giác tính theo pixel xấp xỉ số fragment được sinh ra).`,
      en: `(a) $V = 0.5(1,0,0) + 0.3(0,1,0) + 0.2(0,0,1) = (0.5, 0, 0) + (0, 0.3, 0) + (0, 0, 0.2) = (0.5, 0.3, 0.2)$.

(b) vertex shader: exactly 3 times (3 vertices, independent of triangle size). fragment shader: roughly $(400 \\times 400) / 2 = 80,000$ times (the triangle's pixel area approximates the number of fragments generated).`,
    },
  },
  {
    id: "compute-barycentric-coords",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`barycentric\` nhận một điểm $P$ và ba đỉnh tam giác 2D $A, B, C$, trả về $(\\lambda_0, \\lambda_1, \\lambda_2)$ — đúng phép tính rasterizer thực hiện để quyết định coverage và trọng số nội suy varying cho mỗi fragment.`,
      en: `Write a \`barycentric\` function that takes a point $P$ and a 2D triangle's three vertices $A, B, C$, and returns $(\\lambda_0, \\lambda_1, \\lambda_2)$ — the exact computation a rasterizer performs to decide coverage and the varying-interpolation weights for each fragment.`,
    },
    starterCode: `interface Point {
  x: number;
  y: number;
}

function barycentric(p: Point, a: Point, b: Point, c: Point): [number, number, number] {
  // TODO: use the standard barycentric coordinate formula (2D Cramer's rule).
  // Hint: compute "denom" shared by both l0 and l1 first.
  return [0, 0, 0];
}`,
    solutionCode: `interface Point {
  x: number;
  y: number;
}

function barycentric(p: Point, a: Point, b: Point, c: Point): [number, number, number] {
  const denom = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
  const l0 = ((b.y - c.y) * (p.x - c.x) + (c.x - b.x) * (p.y - c.y)) / denom;
  const l1 = ((c.y - a.y) * (p.x - c.x) + (a.x - c.x) * (p.y - c.y)) / denom;
  const l2 = 1 - l0 - l1;
  return [l0, l1, l2];
}

// barycentric(centroid, A, B, C) always returns (1/3, 1/3, 1/3)
// A negative component means P lies OUTSIDE the triangle — exactly the
// coverage check a rasterizer uses before generating a fragment.`,
    hints: [
      {
        vi: "$\\lambda_0 + \\lambda_1 + \\lambda_2 = 1$ luôn đúng — tính $\\lambda_0$ và $\\lambda_1$ trước rồi suy ra $\\lambda_2 = 1 - \\lambda_0 - \\lambda_1$, đỡ một phép tính.",
        en: "$\\lambda_0 + \\lambda_1 + \\lambda_2 = 1$ always holds — compute $\\lambda_0$ and $\\lambda_1$ first, then derive $\\lambda_2 = 1 - \\lambda_0 - \\lambda_1$ to save a computation.",
      },
      {
        vi: "Test nhanh: nếu $P$ trùng đúng centroid (trung bình cộng 3 đỉnh), kết quả phải là $(1/3, 1/3, 1/3)$.",
        en: "Quick sanity check: if $P$ equals the centroid (the average of the three vertices), the result must be $(1/3, 1/3, 1/3)$.",
      },
    ],
    checklist: [
      {
        vi: "barycentric(centroid, A, B, C) trả về xấp xỉ (1/3, 1/3, 1/3)",
        en: "barycentric(centroid, A, B, C) returns approximately (1/3, 1/3, 1/3)",
      },
      {
        vi: "Ba giá trị trả về luôn cộng lại đúng bằng 1 (trong sai số dấu phẩy động)",
        en: "The three returned values always sum to exactly 1 (within floating-point error)",
      },
      {
        vi: "Với điểm P nằm ngoài tam giác, ít nhất một thành phần trả về là số âm",
        en: "For a point P outside the triangle, at least one returned component is negative",
      },
    ],
  },
];
