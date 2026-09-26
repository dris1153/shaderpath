import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "repetition-costs-one-copy",
    q: {
      vi: "Vì sao chi phí của một lần gọi `map()` không tăng theo số bản sao nhìn thấy trong domain repetition, trong khi `InstancedMesh` cần một ma trận cho mỗi bản sao?",
      en: "With domain repetition, why doesn't the cost of one `map()` call grow with the number of visible copies, the way an `InstancedMesh` needs a matrix per copy?",
    },
    a: {
      vi: "Mỗi lần gọi `map()` fold điểm truy vấn về một ô và chỉ đánh giá bản sao duy nhất của ô đó, nên bộ nhớ và công việc mỗi lần truy vấn không đổi dù trên màn hình có bao nhiêu bản sao — kể cả vô hạn. Không có gì được lưu cho từng bản sao; sự lặp lại chỉ tồn tại trong phép fold.",
      en: "Each `map()` call folds the query point into one cell and evaluates that cell's single copy, so memory and per-query work stay constant however many copies are on screen — even infinitely many. Nothing is stored per copy; the repetition exists only in the fold.",
    },
  },
  {
    id: "hash-the-cell-id",
    q: {
      vi: "Bạn cho mỗi cột lặp một chiều cao ngẫu nhiên bằng `hash(q)`, với `q` là toạ độ đã fold. Các cột ra loang lổ. Vì sao?",
      en: "You give each repeated pillar a random height with `hash(q)`, where `q` is the folded coordinate. The pillars come out blotchy. Why?",
    },
    a: {
      vi: "`q` đổi liên tục bên trong một ô, nên mỗi fragment của cùng một cột hash ra một giá trị khác. Hãy hash chỉ số ô nguyên — `round(p / c)` hoặc `floor(p / c + 0.5)`, tính trước khi fold — giá trị này giống nhau trên cả ô.",
      en: "`q` changes continuously inside a cell, so every fragment of the same pillar hashes a different value. Hash the integer cell index — `round(p / c)` or `floor(p / c + 0.5)`, computed before folding — which is the same across the whole cell.",
    },
  },
  {
    id: "finite-repetition-clamp",
    q: {
      vi: "Bạn cần đúng 5 × 5 cột, không phải một cánh đồng vô hạn. Vì sao phải clamp chỉ số ô, `clamp(round(p / c), -2.0, 2.0)`, thay vì để nguyên phép fold?",
      en: "You need exactly 5 × 5 pillars, not an infinite field. Why clamp the cell index, `clamp(round(p / c), -2.0, 2.0)`, instead of leaving the fold alone?",
    },
    a: {
      vi: "Không clamp, một điểm ở xa vẫn fold về một bản sao ma trong chính ô của nó, nên trường không bao giờ kết thúc. Có clamp, một điểm vượt quá ô cuối đo khoảng cách tới bản sao ở rìa, và khoảng cách đó tăng dần khi điểm đi xa — một trường đúng cho đúng 25 vật thể.",
      en: "Unclamped, a point far outside still folds back onto a phantom copy in its own cell, so the field never ends. Clamped, a point beyond the last cell measures distance to the edge copy, and that distance keeps growing as the point moves away — a correct field for exactly 25 objects.",
    },
  },
];
