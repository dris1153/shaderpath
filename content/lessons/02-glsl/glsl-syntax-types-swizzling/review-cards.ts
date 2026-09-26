import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "integer-division",
    q: {
      vi: "Thanh tiến độ tính `float progress = float(i / count);` với `int i = 3, count = 4;`. `progress` bằng bao nhiêu, và sửa thế nào?",
      en: "A progress bar computes `float progress = float(i / count);` with `int i = 3, count = 4;`. What is `progress`, and how do you fix it?",
    },
    a: {
      vi: "`0.0`, và nó giữ nguyên 0 cho tới khi `i` bằng `count`: hai toán hạng đều là `int` nên `i / count` là phép chia nguyên, bỏ phần dư, rồi mới được đổi sang float. Đổi sang float trước khi chia: `float(i) / float(count)`.",
      en: "`0.0`, and it stays 0 until `i` reaches `count`: both operands are `int`, so `i / count` is integer division that drops the remainder, converted to float only afterwards. Convert before dividing: `float(i) / float(count)`.",
    },
  },
  {
    id: "swizzle-write-cannot-repeat",
    q: {
      vi: "`vec2 a = v.xx;` biên dịch được, nhưng `v.xx = vec2(1.0, 2.0);` thì lỗi. Vì sao đọc lặp được mà ghi lặp thì không?",
      en: "`vec2 a = v.xx;` compiles, but `v.xx = vec2(1.0, 2.0);` does not. Why can a swizzle repeat when reading but not when writing?",
    },
    a: {
      vi: "Đọc lặp chỉ là chép cùng một giá trị hai lần. Ghi lặp thì cùng một slot `x` nhận hai giá trị nguồn mâu thuẫn nhau — 1.0 và 2.0 — nên không xác định được kết quả.",
      en: "Reading a repeat just copies the same value twice. Writing one sends two conflicting source values — 1.0 and 2.0 — into the same `x` slot, so the result would be undefined.",
    },
  },
];
