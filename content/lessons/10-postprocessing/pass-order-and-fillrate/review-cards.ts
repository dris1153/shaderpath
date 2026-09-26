import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "ao-before-tone-mapping",
    q: {
      vi: "Vì sao AO nên đứng ngay sau scene, trước tone mapping và grade?",
      en: "Why does AO belong right after the scene, before tone mapping and grading?",
    },
    a: {
      vi: "AO là hệ số nhân lên ánh sáng, nên phải đứng nơi giá trị vẫn còn là ánh sáng: linear, trước tone mapping. Tone mapping phi tuyến, nên cùng một hệ số AO nhân vào sau đó không còn nghĩa là \"bớt chừng này ánh sáng\" — nó làm tối các mức sáng khác nhau theo mức khác nhau, và nhân lên ảnh đã grade còn làm lệch cái look mà grade đã chọn.",
      en: "AO is a multiplier on light, so it belongs where values are still light: linear, before tone mapping. Tone mapping is non-linear, so the same AO factor applied afterward no longer means \"this much less light\" — it darkens different brightness levels by different amounts, and on top of a grade it also shifts the look the grade chose.",
    },
  },
  {
    id: "count-texels-not-passes",
    q: {
      vi: "`UnrealBloomPass` phát 13 draw call. Muốn ước lượng chi phí của nó, đếm gì mới đúng?",
      en: "`UnrealBloomPass` issues 13 draw calls. To estimate its cost, what should you count?",
    },
    a: {
      vi: "Số texel mà từng draw call thực sự chạm tới, không phải số draw call hay số lần `addPass()`. 12 trên 13 draw call chạy ở 1/4 số texel hoặc ít hơn (mỗi mip bằng nửa chiều mip trước), nên tính theo texel được ghi thì tổng chỉ cỡ 2 pass toàn độ phân giải — dù mỗi texel blur đọc 11–43 tap, nên vẫn đắt hơn 2 pass đơn giản.",
      en: "The texels each draw call really touches — not the number of draw calls or `addPass()` calls. 12 of its 13 draw calls run at a quarter of the texels or fewer (each mip is half the size of the one before), so by texels written it adds up to only about two full-resolution passes — though each blur texel reads 11–43 taps, so it still costs more than two simple passes.",
    },
  },
  {
    id: "disable-instead-of-zero",
    q: {
      vi: "Một pass đang để độ mạnh 0. Vì sao nên đặt `enabled = false` thay vì để nó chạy với độ mạnh 0?",
      en: "A pass sits at strength 0. Why set `enabled = false` instead of leaving it running at zero strength?",
    },
    a: {
      vi: "`enabled = false` khiến composer bỏ qua hẳn pass đó — tiết kiệm trọn một lần đọc và một lần ghi toàn màn hình. Ở độ mạnh 0, pass vẫn chạy nguyên shader trên mọi pixel, vẫn đọc và ghi toàn màn hình; chỉ là nó xuất ra một ảnh không đổi.",
      en: "`enabled = false` makes the composer skip the pass entirely — its whole fullscreen read and write are saved. At strength 0 the pass still runs its full shader on every pixel and still reads and writes the whole screen; it just outputs an unchanged image.",
    },
  },
];
