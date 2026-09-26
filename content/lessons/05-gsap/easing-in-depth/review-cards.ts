import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "ease-in-for-exits",
    q: {
      vi: "Một hộp thoại dùng `power2.out` cho cả lúc hiện lẫn lúc biến mất. Lúc biến mất trông sai thế nào, và nên dùng ease gì?",
      en: "A dialog uses `power2.out` both to appear and to disappear. What looks wrong on the way out, and which ease should it use?",
    },
    a: {
      vi: "Ease `out` giảm tốc dần vào điểm cuối, nên lúc biến mất phần tử như từ từ “đáp xuống” chỗ biến mất thay vì bị đẩy đi. Exit nên dùng ease `in`: chậm lúc đầu rồi tăng tốc khi rời đi.",
      en: "An `out` ease decelerates into its end point, so on exit the element seems to gently “land” where it vanishes instead of being pushed away. An exit wants an `in` ease: slow at first, speeding up as it leaves.",
    },
  },
  {
    id: "scrub-wants-linear",
    q: {
      vi: "Một tween scrub theo ScrollTrigger dùng ease mặc định `power1.out`. Người dùng cuộn đều tay thì thấy gì, và nên đặt ease nào?",
      en: "A ScrollTrigger scrub tween keeps the default `power1.out` ease. What does a user scrolling at a steady pace see, and which ease should it use?",
    },
    a: {
      vi: "Animation chạy vọt trước ở đầu rồi chậm lại ở cuối, không còn khớp 1:1 với vị trí cuộn — cuộn đã là thứ điều khiển tiến độ rồi. Đặt `ease: \"none\"` để tiến độ tỉ lệ thẳng với quãng cuộn.",
      en: "The animation races ahead at the start and slows to a crawl at the end, no longer matching the scroll position 1:1 — scrolling already drives the progress. Set `ease: \"none\"` so progress stays proportional to scroll distance.",
    },
  },
];
