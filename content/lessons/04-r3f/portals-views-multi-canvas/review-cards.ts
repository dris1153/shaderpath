import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "view-ortho-camera-manual",
    q: {
      vi: "Một `OrthographicCamera` trong `<View>` có `left/right/top/bottom` tự đặt, nhưng chúng liên tục bị ghi đè. Thiếu gì, và vì sao?",
      en: "An `OrthographicCamera` inside a `<View>` has its own `left/right/top/bottom`, but they keep being overwritten. What is missing, and why?",
    },
    a: {
      vi: "`manual` trên camera. Thiếu nó, `View` ép `left/right/top/bottom` khớp với pixel của vùng DOM đang theo dõi ở mỗi frame, lặng lẽ ghi đè frustum bạn tự đặt.",
      en: "`manual` on the camera. Without it, `View` forces `left/right/top/bottom` to match the tracked DOM rect's pixels every frame, silently overwriting the frustum you set.",
    },
  },
  {
    id: "views-do-not-share-a-scene",
    q: {
      vi: "Hai `<View>` cùng hiển thị một model. Bạn xoay model ở View A. Model ở View B có xoay theo không, và vì sao?",
      en: "Two `<View>`s show the same model. You rotate the model in View A. Does the model in View B turn too, and why?",
    },
    a: {
      vi: "Không: mỗi `<View>` render một scene ảo riêng, nên hai model là hai object khác nhau. Muốn đồng bộ, hãy điều khiển cả hai từ cùng một state bên ngoài.",
      en: "No: each `<View>` renders its own virtual scene, so the two models are separate objects. To keep them in sync, drive both from the same outside state.",
    },
  },
];
