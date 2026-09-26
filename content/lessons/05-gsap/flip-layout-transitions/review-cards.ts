import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "getstate-before-mutation",
    q: {
      vi: "Bạn đổi class cho thẻ rồi mới gọi `Flip.getState()`, sau đó `Flip.from()`. Animation ra sao, và vì sao?",
      en: "You change the card's class first, then call `Flip.getState()`, then `Flip.from()`. What does the animation look like, and why?",
    },
    a: {
      vi: "Không có animation nào. First và Last đo ra cùng một giá trị, nên không có độ lệch để Invert. `getState()` phải chạy trước khi DOM đổi.",
      en: "There is no animation. First and Last measure the same values, so there is no difference to invert. `getState()` must run before the DOM changes.",
    },
  },
  {
    id: "flip-id-survives-remount",
    q: {
      vi: "Trong React, một thẻ bị unmount rồi mount lại ở vị trí mới, và Flip coi nó là phần tử vừa xuất hiện thay vì bay từ chỗ cũ sang. Thiếu gì?",
      en: "In React, a card is unmounted and mounted again in a new place, and Flip treats it as newly appearing instead of flying over from its old spot. What is missing?",
    },
    a: {
      vi: "`data-flip-id`. Node DOM mới là một node khác, nên Flip không khớp được bằng tham chiếu; cùng một id ở hai trạng thái cho Flip biết đó là cùng một thẻ. Và vì state cũ chỉ giữ node cũ, phải truyền `targets` (ví dụ `'.card'`) vào `Flip.from` để nó đo được node mới.",
      en: "`data-flip-id`. The new DOM node is a different node, so Flip cannot match it by reference; the same id in both states tells Flip it is the same card. And since the old state only holds the old nodes, pass `targets` (for example `'.card'`) to `Flip.from` so it measures the new ones.",
    },
  },
  {
    id: "flip-absolute",
    q: {
      vi: "Nhiều thẻ flip cùng lúc, và trong lúc chạy chúng xô đẩy nhau. Cờ nào sửa, và vì sao?",
      en: "Many cards flip at once, and they shove each other around while animating. Which flag fixes it, and why?",
    },
    a: {
      vi: "`absolute: true`. Mặc định Flip tween cả `width`/`height` thật, nên layout đổi ở từng frame và các thẻ đẩy nhau; `absolute` tách chúng khỏi luồng layout trong lúc animate — tránh đúng thứ layout thrash mà FLIP sinh ra để tránh.",
      en: "`absolute: true`. By default Flip tweens real `width`/`height`, so layout changes every frame and the cards push each other; `absolute` takes them out of the flow while animating — avoiding the very layout thrash FLIP exists to prevent.",
    },
  },
];
