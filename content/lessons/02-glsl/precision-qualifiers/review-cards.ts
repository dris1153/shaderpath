import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "mediump-desktop-vs-mobile",
    q: {
      vi: "Shader khai `precision mediump float;` chạy đẹp trên desktop nhưng vỡ sạn trên điện thoại. Không phải lỗi cú pháp — vậy nguyên nhân là gì?",
      en: "A shader declaring `precision mediump float;` looks clean on desktop but breaks up on a phone. It is not a syntax error — so what is it?",
    },
    a: {
      vi: "Spec chỉ đặt sàn tối thiểu cho `mediump`. Desktop thường cấp đủ 32-bit, còn nhiều GPU di động cấp đúng 16-bit — giá trị cần nhiều bit hơn chỉ vỡ ở nơi `mediump` thật sự hẹp.",
      en: "The spec only sets a minimum for `mediump`. Desktops usually provide full 32-bit, while many mobile GPUs provide exactly 16-bit — values that need more bits break only where `mediump` really is narrow.",
    },
  },
  {
    id: "lowp-clips-intermediates",
    q: {
      vi: "Trên một GPU cấp `lowp` đúng mức tối thiểu của spec, nhiều lớp bloom được cộng dồn trong biến `lowp` rồi tone-map về 0..1. Giá trị cuối vẫn nằm trong 0..1, vậy vì sao kết quả sai?",
      en: "On a GPU whose `lowp` is exactly the spec's minimum, several bloom layers are summed in a `lowp` variable, then tone-mapped into 0..1. The final value is within 0..1, so why is the result wrong?",
    },
    a: {
      vi: "`lowp` chỉ bảo đảm dải $[-2, 2]$. Tổng trung gian vượt 2 là tràn ngay giữa phép tính, trước khi tone-map kịp nén nó lại — giá trị cuối nằm trong dải không có nghĩa phép tính dọc đường cũng vậy.",
      en: "`lowp` only guarantees the range $[-2, 2]$. An intermediate sum above 2 overflows mid-calculation, before tone-mapping can compress it — a final value in range says nothing about the values along the way.",
    },
  },
];
