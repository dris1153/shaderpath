import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "wave-period-and-frequency",
    kind: "concept",
    prompt: {
      vi: `Một sóng có phương trình $y(t) = 4\\sin(2t + \\frac{\\pi}{2})$. Không chạy code, tính $y(0)$ và chu kỳ $T$ của sóng (tính bằng giây, dùng $T = \\frac{2\\pi}{\\omega}$).

Sau đó trả lời: nếu đổi $\\omega$ từ $2$ thành $4$, giữ nguyên $A$ và $\\phi$, chu kỳ mới bằng bao nhiêu lần chu kỳ cũ — và vì sao tăng $\\omega$ lại làm $T$ *giảm* chứ không tăng?`,
      en: `A wave follows $y(t) = 4\\sin(2t + \\frac{\\pi}{2})$. Without running code, compute $y(0)$ and the wave's period $T$ in seconds, using $T = \\frac{2\\pi}{\\omega}$.

Then answer: if $\\omega$ changes from $2$ to $4$ while $A$ and $\\phi$ stay fixed, what fraction of the old period is the new one — and why does raising $\\omega$ make $T$ *shrink* rather than grow?`,
    },
    hints: [
      {
        vi: "Thay $t = 0$ vào bên trong sin trước — biểu thức góc còn lại là gì?",
        en: "Substitute $t = 0$ inside the sine first — what angle expression remains?",
      },
      {
        vi: "$T = 2\\pi/\\omega$ là quan hệ NGHỊCH, không phải thuận: $\\omega$ và $T$ tỉ lệ nghịch với nhau.",
        en: "$T = 2\\pi/\\omega$ is an INVERSE relationship, not a direct one: $\\omega$ and $T$ scale oppositely.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng $y(0) = 4$",
        en: "I computed $y(0) = 4$ correctly",
      },
      {
        vi: "Tôi tính đúng $T = \\pi \\approx 3.14$ giây",
        en: "I computed $T = \\pi \\approx 3.14$ seconds correctly",
      },
      {
        vi: "Tôi giải thích được vì sao tăng gấp đôi $\\omega$ làm $T$ còn một nửa, không phải gấp đôi",
        en: "I can explain why doubling $\\omega$ halves $T$ instead of doubling it",
      },
    ],
    solutionNote: {
      vi: `$y(0) = 4\\sin(2\\times 0 + \\pi/2) = 4\\sin(\\pi/2) = 4\\times 1 = 4$. $T = 2\\pi/\\omega = 2\\pi/2 = \\pi \\approx 3.14159$ giây.

Đổi $\\omega$: $2 \\to 4$ (gấp đôi), $T$ mới $= 2\\pi/4 = \\pi/2$ — bằng ĐÚNG MỘT NỬA chu kỳ cũ. $\\omega$ và $T$ tỉ lệ NGHỊCH ($T = 2\\pi/\\omega$), không tỉ lệ thuận: tăng tần số góc làm chu kỳ giảm, không phải tăng.`,
      en: `$y(0) = 4\\sin(2\\times 0 + \\pi/2) = 4\\sin(\\pi/2) = 4\\times 1 = 4$. $T = 2\\pi/\\omega = 2\\pi/2 = \\pi \\approx 3.14159$ seconds.

Changing $\\omega$: $2 \\to 4$ (doubling it), the new $T = 2\\pi/4 = \\pi/2$ — EXACTLY HALF the old period. $\\omega$ and $T$ are INVERSELY proportional ($T = 2\\pi/\\omega$), not directly: raising the angular frequency shrinks the period, it never grows it.`,
    },
  },
  {
    id: "orbit-position-from-time",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`orbitPosition(center, radius, omega, elapsedSeconds)\` trả về vị trí của một điểm bay quỹ đạo tròn quanh \`center\`, tính **trực tiếp** từ \`elapsedSeconds\` — không được cộng dồn góc qua từng lần gọi hàm.`,
      en: `Write a function \`orbitPosition(center, radius, omega, elapsedSeconds)\` that returns the position of a point orbiting \`center\` on a circle, computed **directly** from \`elapsedSeconds\` — no accumulating the angle across calls.`,
    },
    starterCode: `interface Point { x: number; y: number }

function orbitPosition(
  center: Point,
  radius: number,
  omega: number,
  elapsedSeconds: number,
): Point {
  // TODO: compute the angle directly from elapsedSeconds — do NOT accumulate
  // it across frames; the theory section derives the orbit formula
  return { x: center.x, y: center.y };
}`,
    solutionCode: `interface Point { x: number; y: number }

function orbitPosition(
  center: Point,
  radius: number,
  omega: number,
  elapsedSeconds: number,
): Point {
  const angle = omega * elapsedSeconds;
  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius,
  };
}`,
    hints: [
      {
        vi: "Góc tại thời điểm t chỉ đơn giản là `omega * elapsedSeconds` — không cần biến trạng thái nào lưu qua các lần gọi.",
        en: "The angle at time t is simply `omega * elapsedSeconds` — no state variable needs to persist across calls.",
      },
      {
        vi: "cos cho thành phần x, sin cho thành phần y — đúng định nghĩa vòng tròn đơn vị, chỉ nhân thêm bán kính và cộng tâm.",
        en: "cos gives the x component, sin gives the y component — the unit circle definition, just scaled by radius and offset by the center.",
      },
    ],
    checklist: [
      {
        vi: "Gọi hàm với hai giá trị `elapsedSeconds` khác nhau cho hai điểm khác nhau, cả hai đều cách `center` đúng `radius`",
        en: "Calling with two different `elapsedSeconds` values gives two different points, both exactly `radius` away from `center`",
      },
      {
        vi: "Gọi lại với cùng một `elapsedSeconds` luôn cho ra đúng cùng một điểm (hàm thuần, không phụ thuộc trạng thái ẩn)",
        en: "Calling again with the same `elapsedSeconds` always returns the exact same point (pure function, no hidden state)",
      },
      {
        vi: "`omega` lớn hơn làm điểm di chuyển nhanh hơn quanh quỹ đạo, không đổi bán kính quỹ đạo",
        en: "A larger `omega` moves the point faster around the orbit without changing the orbit's radius",
      },
    ],
  },
];
