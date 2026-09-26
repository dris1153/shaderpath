import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "observer-target-scope",
    q: {
      vi: "Một widget đổi slide toàn màn hình dùng Observer với `target: window` và `preventDefault: true`. Hậu quả với phần còn lại của trang là gì, và sửa thế nào?",
      en: "A full-screen slide widget uses Observer with `target: window` and `preventDefault: true`. What does that do to the rest of the page, and how do you fix it?",
    },
    a: {
      vi: "Nó chặn cuộn và chạm trên toàn trang, không chỉ trong widget — người dùng không cuộn được trang nữa. Gắn `target` vào chính phần tử của widget.",
      en: "It blocks scrolling and touch on the whole page, not just the widget — users can no longer scroll the page. Point `target` at the widget's own element.",
    },
  },
  {
    id: "touch-hit-area",
    q: {
      vi: "Một knob 24×24px của Draggable kéo tốt bằng chuột nhưng trên điện thoại rất khó bắt. Vì sao, và vùng chạm tối thiểu nên cỡ nào?",
      en: "A 24×24px Draggable knob drags fine with a mouse but is very hard to grab on a phone. Why, and how big should the touch target be at minimum?",
    },
    a: {
      vi: "Ngón tay kém chính xác hơn con trỏ chuột rất nhiều, nên một vùng nhỏ vừa đủ cho chuột lại gần như không chạm trúng được. Vùng chạm nên tối thiểu khoảng 44×44px, như khuyến nghị của Apple.",
      en: "A finger is far less precise than a mouse pointer, so a target just big enough for a mouse is nearly impossible to hit by touch. Touch targets should be at least about 44×44px, as Apple recommends.",
    },
  },
];
