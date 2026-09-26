import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "lerp-across-wrap",
    q: {
      vi: "Lerp góc yaw từ 350° tới 10° tại $t = 0.5$. Kết quả là bao nhiêu, và đáng lẽ phải là bao nhiêu?",
      en: "Lerp a yaw angle from 350° to 10° at $t = 0.5$. What do you get, and what should it be?",
    },
    a: {
      vi: "Lerp thường cho 180° — đang ở nửa đường của vòng quét 340° theo đường dài. Đáng lẽ là 0°, tức đi 20° qua mốc 360°. Đưa hiệu góc về khoảng $(-180^\\circ, 180^\\circ]$ trước khi lerp: $10 - 350 = -340$ thành $+20$.",
      en: "A plain lerp gives 180° — halfway along a 340° sweep the long way round. It should be 0°, going 20° across the 360° mark. Wrap the difference into $(-180^\\circ, 180^\\circ]$ before lerping: $10 - 350 = -340$ becomes $+20$.",
    },
  },
  {
    id: "gimbal-lock-not-precision",
    q: {
      vi: "Có người đề xuất lưu góc Euler bằng `float64` để hết gimbal lock. Vì sao không ăn thua?",
      en: "Someone proposes storing Euler angles as `float64` to get rid of gimbal lock. Why won't it help?",
    },
    a: {
      vi: "Gimbal lock không phải sai số làm tròn. Khi trục giữa chạm 90°, trục thứ nhất và thứ ba trùng nhau, ma trận chỉ còn phụ thuộc một tổ hợp của góc thứ nhất và góc thứ ba — mất một bậc tự do ở mọi độ chính xác. Chỉ đổi cách biểu diễn, như quaternion, mới thoát.",
      en: "Gimbal lock is not rounding error. When the middle axis reaches 90°, the first and third axes coincide and the matrix depends only on one combination of the first and third angles — a degree of freedom is lost at any precision. Only a different representation, such as a quaternion, escapes it.",
    },
  },
  {
    id: "order-is-part-of-the-angles",
    q: {
      vi: "Giữ nguyên `rotation` với x = 90°, y = 90°, z = 0, chỉ đổi `rotation.order` từ `'XYZ'` sang `'ZYX'`. Hướng cuối có đổi không, và vì sao?",
      en: "Keep `rotation` at x = 90°, y = 90°, z = 0 and change only `rotation.order` from `'XYZ'` to `'ZYX'`. Does the final orientation change, and why?",
    },
    a: {
      vi: "Có. Order quyết định $R_x$, $R_y$, $R_z$ được nhân theo thứ tự nào, mà phép xoay 3D không giao hoán — cùng ba con số, thứ tự khác cho hướng khác. Ba góc Euler chỉ có nghĩa khi đi kèm order của chúng.",
      en: "Yes. The order decides in which sequence $R_x$, $R_y$, $R_z$ are multiplied, and 3D rotations do not commute — the same three numbers in another order give another orientation. Three Euler angles mean something only together with their order.",
    },
  },
];
