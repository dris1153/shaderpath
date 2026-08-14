import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "vector-add-subtract-geometry",
    kind: "concept",
    prompt: {
      vi: `Cho hai vector định vị $\\vec a = (3, 4)$ và $\\vec b = (-1, 2)$ (đuôi đặt tại gốc toạ độ). Không cần vẽ hình, hãy tính $\\vec a + \\vec b$, $\\vec a - \\vec b$ và $2\\vec a$.

Sau đó trả lời bằng một câu: nếu $a$ và $b$ là hai điểm, $\\vec a - \\vec b$ trỏ từ điểm nào đến điểm nào?`,
      en: `Given two position vectors $\\vec a = (3, 4)$ and $\\vec b = (-1, 2)$ (tails at the origin). Without drawing anything, compute $\\vec a + \\vec b$, $\\vec a - \\vec b$ and $2\\vec a$.

Then answer in one sentence: if $a$ and $b$ are two points, which point does $\\vec a - \\vec b$ point from, and to which point?`,
    },
    hints: [
      {
        vi: "Cộng/trừ vector chỉ là cộng/trừ từng thành phần tương ứng: $(a_x \\pm b_x,\\ a_y \\pm b_y)$.",
        en: "Adding/subtracting vectors is just adding/subtracting matching components: $(a_x \\pm b_x,\\ a_y \\pm b_y)$.",
      },
      {
        vi: "$\\vec a - \\vec b$ là vector đi từ điểm $B$ đến điểm $A$ — thử vẽ tip-to-tail để kiểm tra lại nếu chưa chắc.",
        en: "$\\vec a - \\vec b$ is the vector running from point $B$ to point $A$ — sketch it tip-to-tail if you're unsure.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng $\\vec a + \\vec b = (2, 6)$",
        en: "I computed $\\vec a + \\vec b = (2, 6)$ correctly",
      },
      {
        vi: "Tôi tính đúng $\\vec a - \\vec b = (4, 2)$ và $2\\vec a = (6, 8)$",
        en: "I computed $\\vec a - \\vec b = (4, 2)$ and $2\\vec a = (6, 8)$ correctly",
      },
      {
        vi: "Tôi giải thích được $\\vec a - \\vec b$ trỏ từ điểm B đến điểm A",
        en: "I can explain that $\\vec a - \\vec b$ points from point B to point A",
      },
    ],
    solutionNote: {
      vi: `$\\vec a + \\vec b = (3 + (-1),\\ 4 + 2) = (2, 6)$, $\\vec a - \\vec b = (3 - (-1),\\ 4 - 2) = (4, 2)$, và $2\\vec a = (2\\times 3,\\ 2\\times 4) = (6, 8)$.

Nếu $a$ và $b$ là hai điểm $A$, $B$: $\\vec a - \\vec b$ có tail tại $B$, tip tại $A$ — nó là vector "đi từ $B$ đến $A$", không phải ngược lại.`,
      en: `$\\vec a + \\vec b = (3 + (-1),\\ 4 + 2) = (2, 6)$, $\\vec a - \\vec b = (3 - (-1),\\ 4 - 2) = (4, 2)$, and $2\\vec a = (2\\times 3,\\ 2\\times 4) = (6, 8)$.

If $a$ and $b$ are two points $A$, $B$: $\\vec a - \\vec b$ has its tail at $B$ and tip at $A$ — it's the vector "going from $B$ to $A$", not the other way around.`,
    },
  },
  {
    id: "vector2-length-and-normalize",
    kind: "code",
    prompt: {
      vi: `Viết hai hàm \`length(v)\` và \`normalize(v)\` cho kiểu \`Vec2 = { x, y }\`. \`length\` dùng định lý Pythagoras: $\\|\\vec v\\| = \\sqrt{x^2+y^2}$. \`normalize\` trả về vector đơn vị cùng hướng — nhưng phải xử lý an toàn trường hợp $\\vec v = (0, 0)$ (không được để lọt \`NaN\` ra ngoài).`,
      en: `Write two functions, \`length(v)\` and \`normalize(v)\`, for the type \`Vec2 = { x, y }\`. \`length\` uses the Pythagorean theorem: $\\|\\vec v\\| = \\sqrt{x^2+y^2}$. \`normalize\` returns a unit vector in the same direction — but it must safely handle $\\vec v = (0, 0)$ (never let \`NaN\` leak out).`,
    },
    starterCode: `interface Vec2 { x: number; y: number }

function length(v: Vec2): number {
  // TODO
  return 0;
}

function normalize(v: Vec2): Vec2 {
  // TODO: use length(v); if length is near 0, return (0,0) instead of dividing by 0
  return { x: 0, y: 0 };
}`,
    solutionCode: `interface Vec2 { x: number; y: number }

function length(v: Vec2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

function normalize(v: Vec2): Vec2 {
  const len = length(v);
  if (len < 1e-8) return { x: 0, y: 0 }; // guard: avoid divide-by-zero -> NaN
  return { x: v.x / len, y: v.y / len };
}`,
    hints: [
      {
        vi: "length chỉ là căn bậc hai của tổng bình phương từng thành phần — không có bẫy nào ở phần này.",
        en: "length is just the square root of the sum of squared components — no trap in this part.",
      },
      {
        vi: "normalize chia mỗi thành phần cho length — nhưng nếu length gần 0, phép chia cho ra Infinity/NaN, phải kiểm tra trước khi chia.",
        en: "normalize divides each component by length — but if length is near 0, that division yields Infinity/NaN, so guard it first.",
      },
    ],
    checklist: [
      {
        vi: "length({x: 3, y: 4}) trả về đúng 5",
        en: "length({x: 3, y: 4}) returns exactly 5",
      },
      {
        vi: "normalize trả về vector có độ dài xấp xỉ 1 với mọi input khác (0,0)",
        en: "normalize returns a vector with length approximately 1 for any input other than (0,0)",
      },
      {
        vi: "normalize({x: 0, y: 0}) không trả về NaN — có guard rõ ràng",
        en: "normalize({x: 0, y: 0}) does not return NaN — there's an explicit guard",
      },
    ],
  },
];
