import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "hash-at-pixel-scale",
    q: {
      vi: "Grain hash thẳng từ `uv` (dải $[0, 1]$) ra những dải chuyển mượt thay vì hạt mịn. Vì sao phải nhân `uv` với `resolution` trước khi hash?",
      en: "Grain hashed straight from `uv` (the $[0, 1]$ range) comes out as smooth ramps and bands instead of fine grain. Why multiply `uv` by `resolution` before hashing?",
    },
    a: {
      vi: "Hai pixel cạnh nhau chỉ lệch nhau khoảng $1/R$ về `uv` — quá nhỏ để hash cho ra hai giá trị độc lập, nên các pixel gần nhau nhận giá trị tương quan. Nhân với `resolution` kéo input về thang pixel, mỗi pixel lệch nhau đúng 1, và mỗi pixel nhận một giá trị thật sự độc lập.",
      en: "Two neighboring pixels differ by only about $1/R$ in `uv` — too little for the hash to produce independent values, so nearby pixels come out correlated. Multiplying by `resolution` moves the input to pixel scale, where neighbors differ by exactly 1 and each pixel gets a genuinely independent value.",
    },
  },
  {
    id: "monochrome-grain",
    q: {
      vi: "Vì sao cộng CÙNG một giá trị nhiễu vào cả R, G, B thay vì hash riêng từng kênh?",
      en: "Why add the SAME noise value to R, G and B instead of hashing each channel separately?",
    },
    a: {
      vi: "Grain được nhận ra là \"phim\" chủ yếu qua độ sáng: grain của phim đen trắng thuần là dao động mật độ, và mắt đọc kết cấu độ sáng ấy là \"phim\". Nhiễu độc lập từng kênh thêm các chấm màu — chroma noise của cảm biến số, một cảm giác hoàn toàn khác.",
      en: "Grain reads as film mostly through brightness: black-and-white film grain is purely a density fluctuation, and the eye reads that luminance texture as \"film\". Independent noise per channel adds colored speckles — digital-sensor chroma noise, an entirely different feel.",
    },
  },
  {
    id: "merge-cheap-effects",
    q: {
      vi: "Grain, vignette và chromatic aberration đều rẻ về toán. Vì sao vẫn nên gộp cả ba vào MỘT `ShaderPass`?",
      en: "Grain, vignette and chromatic aberration are all cheap math. Why still merge all three into ONE `ShaderPass`?",
    },
    a: {
      vi: "Chi phí thật của hiệu ứng rẻ nằm ở số lần mỗi pixel bị chạm, không ở phép toán: mỗi pass là một lượt đọc toàn màn hình và một lần ghi toàn màn hình vào render target trung gian. Ba hiệu ứng cục bộ trên cùng `tDiffuse` gộp lại chỉ còn một lượt đọc và một lần ghi.",
      en: "For cheap effects the real cost is how many times each pixel is touched, not the math: every pass is one fullscreen read pass and one fullscreen write into an intermediate target. Three local effects on the same `tDiffuse`, merged, become one read pass and one write.",
    },
  },
];
