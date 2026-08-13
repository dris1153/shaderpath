import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "point-vs-direction-translate",
    kind: "concept",
    prompt: {
      vi: `Ma trận translate mang vector dịch chuyển $\\vec t = (5, -2, 0)$ được viết ở dạng cột thứ tư: $T = \\begin{pmatrix}1&0&0&5\\\\0&1&0&-2\\\\0&0&1&0\\\\0&0&0&1\\end{pmatrix}$.

Không nhân đủ 16 số, hãy dùng ý tưởng "tổ hợp tuyến tính của các cột" để tính tay $T$ nhân với điểm $p = (1,1,1,1)$ và với hướng $d = (1,1,1,0)$. So sánh hai kết quả, rồi trả lời trong một câu: vì sao thành phần $w$ lại quyết định việc có bị dịch chuyển hay không.`,
      en: `The translation matrix carrying shift vector $\\vec t = (5, -2, 0)$ is written with $t$ packed into the fourth column: $T = \\begin{pmatrix}1&0&0&5\\\\0&1&0&-2\\\\0&0&1&0\\\\0&0&0&1\\end{pmatrix}$.

Without multiplying all 16 numbers, use the "linear combination of columns" idea to compute $T$ times the point $p = (1,1,1,1)$ and times the direction $d = (1,1,1,0)$ by hand. Compare the two results, then answer in one sentence why the $w$ component alone decides whether translation applies.`,
    },
    hints: [
      {
        vi: "Ba cột đầu của T là identity, chỉ cột thứ 4 (chứa $t$) khác — và cột đó chỉ được cộng vào kết quả với trọng số đúng bằng $w$ của vector đang nhân.",
        en: "The first three columns of T are identity — only the fourth column (holding $t$) differs, and it only gets added into the result weighted by the vector's own $w$.",
      },
      {
        vi: "Với $w=1$, cột thứ 4 được cộng nguyên vẹn; với $w=0$, cột thứ 4 được nhân với 0 — tức không cộng gì cả.",
        en: "With $w=1$, the fourth column gets added in full; with $w=0$, it's multiplied by zero — meaning nothing gets added at all.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng $Tp = (6, -1, 1, 1)$",
        en: "I correctly computed $Tp = (6, -1, 1, 1)$",
      },
      {
        vi: "Tôi tính đúng $Td = (1, 1, 1, 0)$ — không đổi so với $d$",
        en: "I correctly computed $Td = (1, 1, 1, 0)$ — unchanged from $d$",
      },
      {
        vi: "Tôi giải thích được vì sao $w$ là thứ duy nhất quyết định kết quả khác nhau",
        en: "I can explain why $w$ alone is what makes the two results diverge",
      },
    ],
    solutionCode: `// T*p (w=1): 3 cột đầu (identity) giữ nguyên x,y,z; cột 4 = (5,-2,0,1)
// được cộng vào NGUYÊN VẸN vì trọng số = w = 1
// → (1+5, 1-2, 1+0, 1) = (6, -1, 1, 1)
//
// T*d (w=0): cột 4 được nhân với w=0 → không cộng gì → (1, 1, 1, 0), y hệt d
//
// w chính là "công tắc" bật/tắt cột translation: w=1 bật (điểm), w=0 tắt (hướng)`,
  },
  {
    id: "translate-mat4-point-vs-direction",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`translationMat4(tx, ty, tz)\` dựng ma trận translate 4×4 (lưu ở dạng 4 cột \`col0..col3\`), và hàm \`mat4MulVec4(m, v)\` nhân ma trận đó với một \`Vec4\`. Dùng chúng để kiểm chứng: với cùng độ dịch $(5, -2, 0)$, một điểm ($w=1$) và một hướng ($w=0$) phản ứng khác nhau thế nào.`,
      en: `Write a function \`translationMat4(tx, ty, tz)\` that builds a 4×4 translation matrix (stored as 4 columns \`col0..col3\`), and a function \`mat4MulVec4(m, v)\` that multiplies it by a \`Vec4\`. Use them to verify: with the same shift $(5, -2, 0)$, how differently do a point ($w=1$) and a direction ($w=0$) react?`,
    },
    starterCode: `interface Vec4 { x: number; y: number; z: number; w: number }
interface Mat4 { col0: Vec4; col1: Vec4; col2: Vec4; col3: Vec4 }

function translationMat4(tx: number, ty: number, tz: number): Mat4 {
  // TODO: 3 cột đầu là identity, cột thứ 4 chứa (tx, ty, tz, 1)
  return {
    col0: { x: 1, y: 0, z: 0, w: 0 },
    col1: { x: 0, y: 1, z: 0, w: 0 },
    col2: { x: 0, y: 0, z: 1, w: 0 },
    col3: { x: 0, y: 0, z: 0, w: 1 },
  };
}

function mat4MulVec4(m: Mat4, v: Vec4): Vec4 {
  // TODO: tổ hợp tuyến tính của 4 cột, trọng số lần lượt là v.x, v.y, v.z, v.w
  return { x: 0, y: 0, z: 0, w: 0 };
}`,
    solutionCode: `interface Vec4 { x: number; y: number; z: number; w: number }
interface Mat4 { col0: Vec4; col1: Vec4; col2: Vec4; col3: Vec4 }

function translationMat4(tx: number, ty: number, tz: number): Mat4 {
  return {
    col0: { x: 1, y: 0, z: 0, w: 0 },
    col1: { x: 0, y: 1, z: 0, w: 0 },
    col2: { x: 0, y: 0, z: 1, w: 0 },
    col3: { x: tx, y: ty, z: tz, w: 1 },
  };
}

function mat4MulVec4(m: Mat4, v: Vec4): Vec4 {
  return {
    x: m.col0.x * v.x + m.col1.x * v.y + m.col2.x * v.z + m.col3.x * v.w,
    y: m.col0.y * v.x + m.col1.y * v.y + m.col2.y * v.z + m.col3.y * v.w,
    z: m.col0.z * v.x + m.col1.z * v.y + m.col2.z * v.z + m.col3.z * v.w,
    w: m.col0.w * v.x + m.col1.w * v.y + m.col2.w * v.z + m.col3.w * v.w,
  };
}

const T = translationMat4(5, -2, 0);
mat4MulVec4(T, { x: 1, y: 1, z: 1, w: 1 }); // { x: 6, y: -1, z: 1, w: 1 } — điểm bị dịch
mat4MulVec4(T, { x: 1, y: 1, z: 1, w: 0 }); // { x: 1, y: 1, z: 1, w: 0 } — hướng giữ nguyên`,
    hints: [
      {
        vi: "col3 chính là nơi $(tx, ty, tz)$ sống — ba cột đầu giữ nguyên identity, không cần đụng vào.",
        en: "col3 is exactly where $(tx, ty, tz)$ lives — leave the first three columns as identity, untouched.",
      },
      {
        vi: "mat4MulVec4 là đúng công thức \"tổ hợp tuyến tính của 4 cột\" đã học, chỉ nhiều hơn 2 cột so với ma trận 2×2 trước đó.",
        en: "mat4MulVec4 is exactly the \"linear combination of 4 columns\" formula from before, just with two more columns than the earlier 2×2 case.",
      },
    ],
    checklist: [
      {
        vi: "translationMat4(5, -2, 0) áp lên điểm (1,1,1,1) cho (6,-1,1,1)",
        en: "translationMat4(5, -2, 0) applied to point (1,1,1,1) gives (6,-1,1,1)",
      },
      {
        vi: "Cùng ma trận đó áp lên hướng (1,1,1,0) cho (1,1,1,0) — không đổi",
        en: "The same matrix applied to direction (1,1,1,0) gives (1,1,1,0) — unchanged",
      },
      {
        vi: "Tôi giải thích được bằng một câu vì sao cột thứ 4 \"biến mất\" khi w=0",
        en: "I can explain in one sentence why the fourth column \"disappears\" when w=0",
      },
    ],
  },
];
