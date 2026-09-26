import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "position-is-local",
    q: {
      vi: "Một object lồng sâu trong hierarchy. Bạn đọc `object.position` để đặt hiệu ứng nổ đúng chỗ nó, nhưng vụ nổ lệch hẳn. Vì sao, và dùng gì?",
      en: "An object sits deep in a hierarchy. You read `object.position` to place an explosion where it is, but the explosion lands far off. Why, and what do you use?",
    },
    a: {
      vi: "`.position` là toạ độ local so với cha trực tiếp; lệch bao nhiêu so với vị trí world thật tuỳ vào transform của mọi cha phía trên. Dùng `object.getWorldPosition(target)`.",
      en: "`.position` is local to the direct parent; how far it is from the real world position depends on the transforms of every parent above it. Use `object.getWorldPosition(target)`.",
    },
  },
  {
    id: "matrix-auto-update-off",
    q: {
      vi: "Để tối ưu, bạn tắt `matrixAutoUpdate` trên các object tĩnh. Sau đó code đặt `object.position.x = 5`, nhưng object đứng yên. Vì sao, và sửa thế nào?",
      en: "To optimize, you turn off `matrixAutoUpdate` on static objects. Later the code sets `object.position.x = 5`, but the object does not move. Why, and how do you fix it?",
    },
    a: {
      vi: "`position` đổi trong bộ nhớ, nhưng ma trận local vẽ ra hình không được tính lại nữa. Gọi `object.updateMatrix()` sau khi chỉnh transform.",
      en: "`position` changed in memory, but the local matrix that drives rendering is no longer recomputed. Call `object.updateMatrix()` after changing the transform.",
    },
  },
];
