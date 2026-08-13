import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "read-matrix-by-columns",
    kind: "concept",
    prompt: {
      vi: `Cho ma trận $M = \\begin{pmatrix} 0 & -1 \\\\ 1 & 0 \\end{pmatrix}$.

Không nhân theo quy tắc hàng-cột, hãy đọc trực tiếp hai cột để nêu: $\\hat i$ bị đưa tới đâu, $\\hat j$ bị đưa tới đâu, và đây là phép biến đổi gì (gọi tên và nêu góc nếu là phép xoay). Sau đó dùng đúng ý tưởng "tổ hợp tuyến tính của các cột" để tính tay $M \\begin{pmatrix}3\\\\2\\end{pmatrix}$.`,
      en: `Given the matrix $M = \\begin{pmatrix} 0 & -1 \\\\ 1 & 0 \\end{pmatrix}$.

Without multiplying row-by-column, read the two columns directly to state where $\\hat i$ lands, where $\\hat j$ lands, and name this transformation (with its angle, if it's a rotation). Then use the "linear combination of columns" idea to compute $M \\begin{pmatrix}3\\\\2\\end{pmatrix}$ by hand.`,
    },
    hints: [
      {
        vi: "Cột thứ nhất của M là ảnh của $\\hat i = (1,0)$, cột thứ hai là ảnh của $\\hat j = (0,1)$ — đọc thẳng từ ma trận, không cần nhân gì cả.",
        en: "The first column of M is the image of $\\hat i = (1,0)$, the second is the image of $\\hat j = (0,1)$ — read them straight off the matrix, no multiplication needed.",
      },
      {
        vi: "Công thức: $Mv = v_x \\, c_1 + v_y \\, c_2$, trong đó $c_1, c_2$ là hai cột vừa đọc ở trên — thay $v_x = 3$, $v_y = 2$ vào là ra kết quả.",
        en: "Formula: $Mv = v_x \\, c_1 + v_y \\, c_2$, where $c_1, c_2$ are the two columns you just read off — substitute $v_x = 3$, $v_y = 2$ to get the answer.",
      },
    ],
    checklist: [
      {
        vi: "Tôi đọc đúng cột 1 = $(0,1)$ (ảnh của $\\hat i$) và cột 2 = $(-1,0)$ (ảnh của $\\hat j$)",
        en: "I correctly read column 1 = $(0,1)$ (image of $\\hat i$) and column 2 = $(-1,0)$ (image of $\\hat j$)",
      },
      {
        vi: "Tôi nhận ra đây là phép xoay $90°$ ngược chiều kim đồng hồ",
        en: "I recognized this as a $90°$ counter-clockwise rotation",
      },
      {
        vi: "Tôi tính đúng $M(3,2) = 3(0,1) + 2(-1,0) = (-2, 3)$",
        en: "I correctly computed $M(3,2) = 3(0,1) + 2(-1,0) = (-2, 3)$",
      },
    ],
    solutionCode: `// Đọc trực tiếp 2 cột của M = [[0,-1],[1,0]]:
// cột 1 = (0,1) = ảnh của î, cột 2 = (-1,0) = ảnh của ĵ
// î xoay lên trục y dương, ĵ xoay sang trục x âm → xoay 90° ngược kim đồng hồ
//
// M(3,2) = 3*(0,1) + 2*(-1,0) = (0,3) + (-2,0) = (-2,3)`,
  },
  {
    id: "compose-2d-matrices",
    kind: "code",
    prompt: {
      vi: `Viết hai hàm thuần: \`matVec2(m, v)\` nhân ma trận 2×2 với vector, và \`matMul2(m1, m2)\` nhân hai ma trận 2×2 (với quy ước \`matMul2(m1, m2)\` nghĩa là áp dụng \`m2\` trước, \`m1\` sau). Dùng chúng để kiểm tra bằng số: với \`R\` là ma trận xoay $90°$ và \`S\` = diag(2, 1), \`matMul2(S, R)\` và \`matMul2(R, S)\` áp lên vector $(1, 0)$ có cho cùng kết quả không?`,
      en: `Write two pure functions: \`matVec2(m, v)\` multiplying a 2×2 matrix by a vector, and \`matMul2(m1, m2)\` multiplying two 2×2 matrices (with the convention that \`matMul2(m1, m2)\` means "apply \`m2\` first, then \`m1\`"). Use them to check numerically: with \`R\` a $90°$ rotation matrix and \`S\` = diag(2, 1), does \`matMul2(S, R)\` applied to $(1, 0)$ give the same result as \`matMul2(R, S)\` applied to the same vector?`,
    },
    starterCode: `interface Mat2 { a: number; b: number; c: number; d: number } // [[a,b],[c,d]]
interface Vec2 { x: number; y: number }

function matVec2(m: Mat2, v: Vec2): Vec2 {
  // TODO: v.x * cột 1 (a,c) + v.y * cột 2 (b,d)
  return { x: 0, y: 0 };
}

function matMul2(m1: Mat2, m2: Mat2): Mat2 {
  // TODO: cột mới = matVec2(m1, cột tương ứng của m2) — tái dùng matVec2 ở trên
  return { a: 1, b: 0, c: 0, d: 1 };
}`,
    solutionCode: `interface Mat2 { a: number; b: number; c: number; d: number }
interface Vec2 { x: number; y: number }

function matVec2(m: Mat2, v: Vec2): Vec2 {
  return { x: m.a * v.x + m.b * v.y, y: m.c * v.x + m.d * v.y };
}

function matMul2(m1: Mat2, m2: Mat2): Mat2 {
  const col1 = matVec2(m1, { x: m2.a, y: m2.c });
  const col2 = matVec2(m1, { x: m2.b, y: m2.d });
  return { a: col1.x, b: col2.x, c: col1.y, d: col2.y };
}

// R = xoay 90°, S = diag(2,1)
const R: Mat2 = { a: 0, b: -1, c: 1, d: 0 };
const S: Mat2 = { a: 2, b: 0, c: 0, d: 1 };

matVec2(matMul2(S, R), { x: 1, y: 0 }); // { x: 0, y: 1 }
matVec2(matMul2(R, S), { x: 1, y: 0 }); // { x: 0, y: 2 } — khác kết quả trên`,
    hints: [
      {
        vi: "matVec2 chỉ là công thức \"tổ hợp tuyến tính của cột\" viết bằng code: kết quả.x = m.a*v.x + m.b*v.y, kết quả.y = m.c*v.x + m.d*v.y.",
        en: "matVec2 is just the \"linear combination of columns\" formula written as code: result.x = m.a*v.x + m.b*v.y, result.y = m.c*v.x + m.d*v.y.",
      },
      {
        vi: "matMul2(m1, m2): mỗi cột của m2 (đọc bằng (m2.a, m2.c) và (m2.b, m2.d)) đem qua matVec2 với m1 sẽ ra cột tương ứng của kết quả.",
        en: "matMul2(m1, m2): take each column of m2 (read as (m2.a, m2.c) and (m2.b, m2.d)), run it through matVec2 with m1, and that's the matching column of the result.",
      },
    ],
    checklist: [
      {
        vi: "matVec2 áp dụng ma trận identity {a:1,b:0,c:0,d:1} lên bất kỳ vector nào trả về đúng vector đó",
        en: "matVec2 applied with the identity matrix {a:1,b:0,c:0,d:1} returns any vector unchanged",
      },
      {
        vi: "matMul2(S, R) áp lên (1,0) cho ra (0,1)",
        en: "matMul2(S, R) applied to (1,0) gives (0,1)",
      },
      {
        vi: "matMul2(R, S) áp lên (1,0) cho ra (0,2) — khác kết quả trên, đúng như lý thuyết dự đoán",
        en: "matMul2(R, S) applied to (1,0) gives (0,2) — different from above, exactly as the theory predicts",
      },
    ],
  },
];
