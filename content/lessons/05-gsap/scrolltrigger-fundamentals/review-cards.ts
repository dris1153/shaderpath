import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "refresh-after-layout-change",
    q: {
      vi: "Một ảnh lazy-load phía trên làm trang dài ra, và trigger bắn sai chỗ cho tới khi bạn resize cửa sổ. Vì sao, và sửa thế nào?",
      en: "A lazy-loaded image higher up makes the page taller, and a trigger fires in the wrong place until you resize the window. Why, and how do you fix it?",
    },
    a: {
      vi: "Toạ độ `start`/`end` được tính và cache lúc tạo hoặc lần refresh gần nhất; layout đổi vì lý do khác ngoài resize — ảnh tải xong, font swap, accordion mở — không tự kích hoạt refresh. Gọi `ScrollTrigger.refresh()` khi layout đổi.",
      en: "The `start`/`end` positions are computed and cached at creation or the last refresh; layout changes other than a resize — an image finishing, a font swap, an accordion opening — do not trigger a refresh. Call `ScrollTrigger.refresh()` when the layout changes.",
    },
  },
  {
    id: "toggle-actions-has-four-slots",
    q: {
      vi: "Bạn viết `toggleActions: \"play reverse\"` với mong muốn cuộn lên lại thì animation chạy ngược. Vì sao nó không chạy ngược, và viết đúng thế nào?",
      en: "You write `toggleActions: \"play reverse\"` expecting the animation to reverse when scrolling back up. Why doesn't it, and what is the right value?",
    },
    a: {
      vi: "`toggleActions` có đúng bốn vị trí theo thứ tự onEnter, onLeave, onEnterBack, onLeaveBack; viết hai từ thì `reverse` rơi vào onLeave, còn hai vị trí sau thành `none`. Muốn đảo lại khi cuộn ngược qua điểm start: `\"play none none reverse\"`.",
      en: "`toggleActions` has exactly four slots, in order onEnter, onLeave, onEnterBack, onLeaveBack; with two words, `reverse` lands on onLeave and the last two become `none`. To reverse when scrolling back past the start: `\"play none none reverse\"`.",
    },
  },
];
