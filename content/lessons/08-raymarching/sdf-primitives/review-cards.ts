import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "inverse-transform-order",
    q: {
      vi: "Để đặt một hộp tại $(2, 0, 0)$, xoay 30° quanh Y, vì sao bạn trừ $(2, 0, 0)$ khỏi `p` rồi mới xoay `p` một góc −30°, đúng thứ tự đó?",
      en: "To place a box at $(2, 0, 0)$ rotated 30° about Y, why do you subtract $(2, 0, 0)$ from `p` and then rotate `p` by −30°, in that order?",
    },
    a: {
      vi: "SDF không có đỉnh nào để di chuyển, nên bạn di chuyển câu hỏi: đưa điểm truy vấn về hệ toạ độ cục bộ của hộp bằng cách hoàn tác từng phép biến đổi. Hoàn tác phép tịnh tiến trước vì phép xoay tính quanh gốc toạ độ — xoay trước là xoay quanh sai điểm; và xoay theo góc ngược lại, không thì hộp quay sai chiều.",
      en: "An SDF has no vertices to move, so you move the question instead: bring the query point into the box's local frame by undoing each transform. Undo the translation first because the rotation is about the origin — rotate first and you spin around the wrong point; and rotate by the opposite angle, or the box turns the wrong way.",
    },
  },
  {
    id: "squeeze-overestimates",
    q: {
      vi: "Nén một mặt cầu còn nửa bề rộng theo X bằng `sdSphere(p * vec3(2.0, 1.0, 1.0), r)` làm thủng lỗ ở chỗ tia lướt cạnh. Vì sao, và làm gì để an toàn trở lại?",
      en: "Squeezing a sphere to half its width along X with `sdSphere(p * vec3(2.0, 1.0, 1.0), r)` punches holes where rays graze it. Why, and what makes it safe again?",
    },
    a: {
      vi: "Phép nén làm field đổi nhanh gấp đôi theo X, nên $f(p)$ có thể ước lượng THỪA khoảng cách thật; một bước $f(p)$ khi đó nhảy qua được phần mặt đã bị làm mỏng. Nhân kết quả với 0.5 — hệ số scale nhỏ nhất của hình — biến nó lại thành một bound không bao giờ ước lượng thừa: chậm hơn, nhưng an toàn.",
      en: "The squeeze makes the field change up to twice as fast along X, so $f(p)$ can overestimate the true distance; a step of $f(p)$ can then jump past the thinned surface. Multiplying the result by 0.5 — the smallest of the shape's scale factors — turns it back into a bound that never overestimates: slower, but safe.",
    },
  },
  {
    id: "capsule-without-clamp",
    q: {
      vi: "Bạn bỏ `clamp(h, 0.0, 1.0)` khỏi `sdCapsule`. Nó vẽ ra hình gì?",
      en: "You drop the `clamp(h, 0.0, 1.0)` from `sdCapsule`. What shape does it render instead?",
    },
    a: {
      vi: "Một hình trụ vô hạn bán kính $r$ quanh đường thẳng đi qua $a$ và $b$. Thiếu clamp, điểm gần nhất được trượt tuỳ ý dọc đường thẳng vô hạn đó, nên không có gì chặn hai đầu; clamp giữ nó trên đoạn thẳng, và chính điều đó bo tròn hai đầu.",
      en: "An infinite cylinder of radius $r$ around the line through $a$ and $b$. Without the clamp the closest point may slide anywhere along that infinite line, so nothing caps the ends; the clamp keeps it on the segment, which is what rounds off both ends.",
    },
  },
];
