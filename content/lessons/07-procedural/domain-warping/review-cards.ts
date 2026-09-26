import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "same-offset-both-channels",
    q: {
      vi: "Bạn dựng `q = vec2(fbm(p), fbm(p))` rồi warp bằng `fbm(p + strength * q)`. Ảnh vẫn trông bị warp. Sai ở đâu mà không lộ?",
      en: "You build `q = vec2(fbm(p), fbm(p))` and warp with `fbm(p + strength * q)`. The image still looks warped. What is quietly wrong?",
    },
    a: {
      vi: "Hai thành phần là cùng một trường, nên $q_x = q_y$ ở mọi điểm: mọi độ dịch chuyển đều nằm trên đường chéo $(1, 1)$, kéo theo một hướng duy nhất thay vì xoáy. Dịch mẫu thứ hai đi vài đơn vị (ví dụ `p + vec2(5.2, 1.3)`) để hai kênh đọc hai vùng không liên quan.",
      en: "Both components are the same field, so $q_x = q_y$ everywhere: every displacement lies along the diagonal $(1, 1)$, pulling in one direction instead of swirling. Offset the second sample by a few units (say `p + vec2(5.2, 1.3)`) so the two channels read unrelated regions.",
    },
  },
  {
    id: "warp-strength-scale",
    q: {
      vi: "Vì sao hoa văn FBM gốc vẫn nhận ra được ở `strength` 0.3 nhưng tan thành các dải chảy ở 4?",
      en: "Why does the original FBM pattern stay recognizable at warp `strength` 0.3 but dissolve into flowing bands at 4?",
    },
    a: {
      vi: "Chỉ phần thay đổi của độ dịch chuyển mới làm méo; một độ lệch không đổi chỉ trượt cả hoa văn. Ở 0.3, các điểm gần nhau bị đẩy gần như bằng nhau nên các vệt chỉ uốn nhẹ. Ở 4, các điểm gần nhau bị đẩy lệch nhau cỡ một ô noise trở lên, nên chúng đọc những vùng không liên quan và hình khối bị kéo giãn, gấp lại thành các dải chạy theo trường warp.",
      en: "Only the variation of the displacement distorts; a constant offset just slides the pattern. At 0.3, nearby points are pushed by almost the same amount, so the streaks just bend. At 4, nearby points are pushed apart by a noise cell or more, so neighbors sample unrelated parts of the field and features stretch and fold into bands that follow the warp field.",
    },
  },
];
