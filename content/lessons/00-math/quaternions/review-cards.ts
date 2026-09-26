import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "multiply-order",
    q: {
      vi: "Ghép hai phép xoay bằng `q1 * q2`, rồi lỡ đổi thành `q2 * q1`. Object bị sai thế nào, và vì sao?",
      en: "Two rotations are composed as `q1 * q2`, then accidentally swapped to `q2 * q1`. How does the object go wrong, and why?",
    },
    a: {
      vi: "Xoay đúng góc nhưng sai hẳn hướng tổng thể: phép nhân quaternion không giao hoán, và thứ tự quyết định phép xoay nào tính theo hệ local, phép nào theo hệ world. Giống ma trận xoay 3D, $q_1 q_2 \\neq q_2 q_1$ nói chung.",
      en: "The right angle but a wrong overall orientation: quaternion multiplication does not commute, and the order decides which rotation happens in the local frame and which in the world frame. As with 3D rotation matrices, $q_1 q_2 \\neq q_2 q_1$ in general.",
    },
  },
  {
    id: "normalize-drift",
    q: {
      vi: "Sau rất nhiều lần nhân dồn quaternion, object không quay sai hướng nhưng hơi to ra hoặc méo đi. Vì sao, và sửa thế nào?",
      en: "After a great many quaternion multiplications in a row, the object doesn't face the wrong way but looks slightly bigger or skewed. Why, and what fixes it?",
    },
    a: {
      vi: "Sai số dấu phẩy động làm $\\|q\\|$ trôi khỏi 1, mà quaternion không đơn vị khi đổi sang ma trận thì mang theo cả co giãn. Normalize lại sau mỗi lần ghép.",
      en: "Floating-point error lets $\\|q\\|$ drift away from 1, and a non-unit quaternion turned into a matrix carries scaling along with the rotation. Normalize again after each composition.",
    },
  },
  {
    id: "fps-camera-no-quaternion",
    q: {
      vi: "Camera FPS dùng order `'YXZ'`: yaw xoay tự do, pitch bị giới hạn trong ±85°. Vì sao thiết lập này không bao giờ gặp gimbal lock, dù không dùng quaternion?",
      en: "An FPS camera uses order `'YXZ'`: yaw turns freely, pitch is clamped to ±85°. Why does this setup never hit gimbal lock, even without a quaternion?",
    },
    a: {
      vi: "Với `'YXZ'`, pitch là trục giữa, mà gimbal lock chỉ xảy ra khi trục giữa chạm ±90° — pitch bị giới hạn nên không bao giờ tới đó. Hai biến `float` cho yaw và pitch là đủ, rẻ hơn và dễ đọc hơn.",
      en: "With `'YXZ'`, pitch is the middle axis, and gimbal lock happens only when the middle axis reaches ±90° — the clamped pitch never gets there. Two `float` values for yaw and pitch are enough, cheaper and easier to read.",
    },
  },
];
