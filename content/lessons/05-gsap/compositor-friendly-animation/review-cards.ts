import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "scalex-needs-transform-origin",
    q: {
      vi: "Bạn đổi progress bar từ animate `width` sang `scaleX` cho mượt, nhưng giờ thanh phình ra từ giữa. Thiếu gì?",
      en: "You switch a progress bar from animating `width` to `scaleX` for smoothness, but now it grows from the middle. What is missing?",
    },
    a: {
      vi: "`transform-origin: left`. Mặc định là `50% 50%`, nên scale tính từ tâm; còn `width` (trong layout trái sang phải) lớn dần từ mép trái.",
      en: "`transform-origin: left`. The default is `50% 50%`, so scaling happens from the center; `width` (in a left-to-right layout) grew from the left edge.",
    },
  },
  {
    id: "left-vs-translate-pipeline",
    q: {
      vi: "Một hộp animate `left` từ 0 tới 300px mỗi frame. Mỗi frame trình duyệt phải chạy những giai đoạn nào, và đổi sang `transform: translateX` bỏ được giai đoạn nào?",
      en: "A box animates `left` from 0 to 300px every frame. Which stages must the browser run each frame, and which ones does switching to `transform: translateX` remove?",
    },
    a: {
      vi: "`left` kích hoạt style, layout, paint rồi composite ở mỗi frame. `translateX` trên một layer riêng bỏ được cả layout lẫn paint — chỉ còn composite (và bước style, nếu JavaScript đổi transform mỗi frame).",
      en: "`left` triggers style, layout, paint and then composite every frame. `translateX` on its own layer drops both layout and paint — leaving composite (plus the style step, if JavaScript changes the transform every frame).",
    },
  },
  {
    id: "will-change-costs-vram",
    q: {
      vi: "Rải `will-change: transform` lên mọi phần tử “cho chắc”. Cái giá là gì?",
      en: "Sprinkling `will-change: transform` on every element “to be safe”. What does it cost?",
    },
    a: {
      vi: "Mỗi layer được promote là một bitmap thật trong VRAM; quá nhiều layer cộng dồn thành áp lực bộ nhớ GPU, và trên máy yếu trình duyệt có thể phải huỷ rồi tạo lại layer giữa chừng — gây đúng cái giật mà `will-change` định tránh.",
      en: "Every promoted layer is a real bitmap in VRAM; too many add up to GPU memory pressure, and on weak devices the browser may have to tear layers down and rebuild them mid-flight — causing the very jank `will-change` was meant to prevent.",
    },
  },
];
