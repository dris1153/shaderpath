import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "grade-after-tone-mapping",
    q: {
      vi: "Đặt LUT pass TRƯỚC `OutputPass`: các vùng sáng, dù khác nhau thế nào, ra màu grade gần như giống nhau. Vì sao?",
      en: "You put the LUT pass BEFORE `OutputPass`: bright highlights, however different, come out graded almost alike. Why?",
    },
    a: {
      vi: "LUT chỉ phủ $[0, 1]$ và được dựng cho ảnh display-referred. Trước tone mapping, buffer còn là linear HDR (có thể 40.0): kênh nào vượt 1 bị kẹp về biên của trục đó, nên các vùng sáng dồn lên mặt ngoài của LUT — vùng trắng chói thì rơi đúng vào cùng một ô góc. Tone map trước, grade sau.",
      en: "A LUT covers only $[0, 1]$ and is built for display-referred images. Before tone mapping the buffer is still linear HDR (possibly 40.0): each channel above 1 clamps to the edge of its axis, so highlights pile up on the LUT's outer faces — the white-hot ones on the very same corner cell. Tone map first, grade after.",
    },
  },
  {
    id: "identity-lut-as-test",
    q: {
      vi: "Vì sao nên chạy một LUT identity (neutral) qua pipeline trước khi dùng LUT thật?",
      en: "Why run an identity (neutral) LUT through your pipeline before using a real one?",
    },
    a: {
      vi: "Với LUT identity, output phải bằng input, chỉ sai lệch do làm tròn. Ảnh vẫn lệch màu thì lỗi chắc chắn nằm ở phép lấy mẫu (đảo trục, sai inset), không phải nội dung LUT — một LUT có màu thì có thể che lỗi đó vì trông \"gần đúng\".",
      en: "With an identity LUT the output must equal the input, to within rounding. If the image still shifts color, the bug is in the sampling (swapped axes, wrong inset), not the LUT's content — a colored LUT can hide that bug because it looks \"close enough\".",
    },
  },
  {
    id: "filmic-toe-and-shoulder",
    q: {
      vi: "Vì sao một đường cong tone mapping kiểu phim (ACES, AgX) gần như tuyến tính ở vùng giữa và chỉ bẻ cong ở hai đầu?",
      en: "Why does a filmic tone curve (ACES, AgX) stay nearly linear through the midtones and bend only at the two ends?",
    },
    a: {
      vi: "Vùng giữa mang phần lớn nội dung ảnh nên giữ gần nguyên độ tương phản; toe hạ vùng tối thật nhẹ để giữ chi tiết bóng đổ, còn shoulder nén vùng sáng mạnh dần để chúng cong mượt về trắng thay vì bị cắt cứng.",
      en: "The midtones carry most of the image, so they keep their contrast almost untouched; the toe eases the darks down gently to keep shadow detail, and the shoulder compresses the highlights harder and harder so they roll off toward white instead of hitting a hard cutoff.",
    },
  },
];
