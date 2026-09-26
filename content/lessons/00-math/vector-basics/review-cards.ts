import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "normalize-zero-length",
    q: {
      vi: "Enemy đứng đúng chỗ người chơi, và code gọi hàm `normalize` tự viết theo công thức của bài trên `player - enemy` để lao về phía người chơi. Chuyện gì xảy ra, và vì sao không có lỗi nào hiện ra?",
      en: "An enemy stands exactly where the player is, and the code calls a hand-written `normalize`, per the lesson's formula, on `player - enemy` to charge at the player. What happens, and why does no error show up?",
    },
    a: {
      vi: "`player - enemy` là vector độ dài 0, normalize chia cho 0 ra `NaN`. `NaN` lan qua mọi phép cộng, nhân phía sau, vị trí enemy thành `NaN` và nó biến khỏi màn hình — JavaScript không ném lỗi khi chia cho 0. Kiểm tra độ dài trước khi chia.",
      en: "`player - enemy` has length 0, and normalizing divides by 0, giving `NaN`. `NaN` spreads through every later add and multiply, the enemy's position becomes `NaN` and it vanishes — JavaScript throws nothing on division by zero. Check the length before dividing.",
    },
  },
  {
    id: "diagonal-speed",
    q: {
      vi: "Nhân vật đi bằng phím: W cho $(0, 1)$, D cho $(1, 0)$. Nhấn cả hai thì cộng lại rồi nhân với tốc độ. Đi chéo nhanh hơn đi thẳng bao nhiêu lần, và sửa thế nào?",
      en: "A character moves with keys: W gives $(0, 1)$, D gives $(1, 0)$. Holding both adds them, then multiplies by the speed. How much faster is diagonal movement, and what fixes it?",
    },
    a: {
      vi: "Khoảng $1.41$ lần: $(1, 1)$ dài $\\sqrt{1^2 + 1^2} = \\sqrt 2$ theo Pythagoras. Normalize tổng trước khi nhân tốc độ, để mọi hướng đều dài 1 — và bỏ qua khi tổng bằng 0, lúc không phím nào được nhấn.",
      en: "About $1.41$ times: $(1, 1)$ has length $\\sqrt{1^2 + 1^2} = \\sqrt 2$ by Pythagoras. Normalize the sum before multiplying by the speed, so every direction has length 1 — and skip it when the sum is 0, with no key held.",
    },
  },
  {
    id: "direction-has-no-position",
    q: {
      vi: "Một object dời từ gốc tới $(10, 0, 0)$. Pháp tuyến mặt trên của nó lúc đầu là $(0, 1, 0)$. Sau khi dời, pháp tuyến bằng bao nhiêu — và nếu code cộng vị trí object vào pháp tuyến thì sao?",
      en: "An object moves from the origin to $(10, 0, 0)$. Its top face's normal starts as $(0, 1, 0)$. What is the normal after the move — and what if the code adds the object's position to it?",
    },
    a: {
      vi: "Vẫn là $(0, 1, 0)$: hướng chỉ nói “quay về đâu”, không có vị trí, nên dời object không làm nó đổi. Cộng vị trí vào thì được $(10, 1, 0)$ — sau normalize gần như nằm ngang theo trục $x$, mặt trên bị tô sáng như thể là mặt bên.",
      en: "Still $(0, 1, 0)$: a direction says only “which way”, it has no position, so moving the object does not change it. Adding the position gives $(10, 1, 0)$ — nearly horizontal along $x$ once normalized, so the top face is lit as if it were a side.",
    },
  },
];
