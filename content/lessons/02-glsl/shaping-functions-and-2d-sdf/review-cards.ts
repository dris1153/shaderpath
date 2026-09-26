import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "hard-threshold-aliases",
    q: {
      vi: "Vẽ hình tròn SDF bằng `d < 0.0 ? inside : outside`. Biên trông thế nào, và vì sao smoothstep sửa được?",
      en: "A circle SDF is drawn with `d < 0.0 ? inside : outside`. What does the edge look like, and why does smoothstep fix it?",
    },
    a: {
      vi: "Răng cưa: mỗi pixel chọn hẳn một màu, không có khái niệm “phủ một phần”. smoothstep trên $d$ tạo một dải chuyển tiếp quanh $d = 0$, giả lập độ phủ của pixel nằm vắt ngang biên.",
      en: "Jagged: each pixel commits fully to one color, with no notion of “partly covered”. smoothstep on $d$ makes a transition band around $d = 0$, standing in for the coverage of pixels that straddle the edge.",
    },
  },
  {
    id: "edge-width-in-pixels",
    q: {
      vi: "Dải smoothstep ±0.02 trông vừa vặn ở cảnh này, nhưng zoom vào thì viền nhoè, zoom ra thì răng cưa quay lại. Vì sao, và dùng gì thay?",
      en: "A smoothstep band of ±0.02 looks right in this scene, but zooming in blurs the edge and zooming out brings the jaggies back. Why, and what replaces it?",
    },
    a: {
      vi: "0.02 đo bằng đơn vị toạ độ, không phải pixel, mà một pixel chiếm bao nhiêu đơn vị thì đổi theo zoom và độ phân giải. `fwidth(d)` cho biết $d$ đổi bao nhiêu trên một pixel — dùng nó làm bề rộng dải.",
      en: "0.02 is in coordinate units, not pixels, and how many units a pixel spans changes with zoom and resolution. `fwidth(d)` gives how much $d$ changes across one pixel — use that as the band width.",
    },
  },
  {
    id: "sdf-union-intersection",
    q: {
      vi: "Hai hình có SDF $d_1$ và $d_2$. `min(d1, d2)` cho hình gì, `max(d1, d2)` cho hình gì — suy ra từ dấu của khoảng cách?",
      en: "Two shapes have SDFs $d_1$ and $d_2$. What shape does `min(d1, d2)` give, and `max(d1, d2)` — reasoning from the sign of the distance?",
    },
    a: {
      vi: "Âm là bên trong. `min` âm khi chỉ cần một trong hai âm — hợp (union). `max` chỉ âm khi cả hai cùng âm — giao (intersection).",
      en: "Negative means inside. `min` is negative when either one is — the union. `max` is negative only when both are — the intersection.",
    },
  },
];
