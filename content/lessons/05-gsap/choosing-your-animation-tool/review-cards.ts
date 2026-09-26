import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "css-first-for-hover",
    q: {
      vi: "Một dự án kéo GSAP vào chỉ để nút nhích lên 4px khi hover. Vì sao đó là lựa chọn tệ?",
      en: "A project pulls in GSAP just to lift a button 4px on hover. Why is that a poor choice?",
    },
    a: {
      vi: "Hai dòng CSS transition làm đúng việc đó, chạy trên compositor và không tốn JavaScript; GSAP thêm hàng chục kB JavaScript mà không mang lại gì. Mặc định dùng CSS, chỉ nâng lên JS khi biên đạo vượt quá thứ CSS diễn đạt được.",
      en: "Two lines of CSS transition do exactly that, run on the compositor and cost no JavaScript; GSAP adds tens of kilobytes of JavaScript for nothing. Default to CSS, and step up to JS only when the choreography outgrows what CSS can express.",
    },
  },
  {
    id: "scope-tweens-with-context",
    q: {
      vi: "Một component React tạo tween GSAP mà không bọc trong `gsap.context()`. Bug gì xuất hiện, và vì sao hay lọt qua lúc thử nhanh?",
      en: "A React component creates GSAP tweens without wrapping them in `gsap.context()`. What bug appears, and why does it slip past a quick test?",
    },
    a: {
      vi: "Tween sống qua unmount và tiếp tục chạy. Dưới Strict Mode, effect chạy hai lần trên cùng DOM nên tween bị nhân đôi — một `from()` chạy hai lần kẹt ở giá trị from — và ScrollTrigger chồng chất; mount một lần thì không lộ gì, lỗi chỉ hiện khi component mount lại (Strict Mode lúc dev, đổi route). `gsap.context()` gom mọi tween để `revert()` một lần trong cleanup.",
      en: "The tweens outlive the unmount and keep running. Under Strict Mode the effect runs twice on the same DOM, so tweens double up — a `from()` run twice ends stuck at its from-values — and ScrollTriggers pile up; a single mount shows nothing, so it only appears once the component remounts (Strict Mode in development, route changes). `gsap.context()` collects every tween so one `revert()` in the cleanup undoes them all.",
    },
  },
];
