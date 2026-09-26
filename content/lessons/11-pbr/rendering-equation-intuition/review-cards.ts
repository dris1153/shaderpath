import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "li-is-someone-elses-lo",
    q: {
      vi: "Vì sao phương trình render không giải chính xác được trong thời gian thực, dù về hình thức chỉ là một tích phân?",
      en: "Why can't the rendering equation be solved exactly in real time, even though on paper it's just one integral?",
    },
    a: {
      vi: "Vì $L_i$ tại $x$ theo một hướng chính là $L_o$ của bề mặt nằm ở hướng đó. Muốn có $L_o$ ở một điểm phải biết $L_o$ ở mọi điểm nó nhìn thấy, rồi mọi điểm những điểm đó nhìn thấy — đệ quy không dừng (global illumination), không có nghiệm dạng đóng cho cảnh thật. Mỗi renderer chỉ chọn chỗ cắt đệ quy và xấp xỉ phần còn lại.",
      en: "Because $L_i$ at $x$ from a direction is, by definition, the $L_o$ of whatever surface sits in that direction. Getting $L_o$ at one point needs $L_o$ at every point it sees, then at every point those see — recursion without end (global illumination), with no closed-form solution for a real scene. Every renderer only picks where to cut the recursion and approximates the rest.",
    },
  },
  {
    id: "abs-instead-of-max-cosine",
    q: {
      vi: "Thay `max(0.0, dot(n, l))` bằng `abs(dot(n, l))` trong shader thì sai ở đâu?",
      en: "What goes wrong when `max(0.0, dot(n, l))` is replaced with `abs(dot(n, l))` in a shader?",
    },
    a: {
      vi: "`abs` biến giá trị âm — ánh sáng đến từ phía sau bề mặt — thành dương, nên mặt quay lưng với nguồn sáng cũng được chiếu, như thể ánh sáng xuyên qua vật. `max(0, …)` mới đúng: từ $\\theta = 90°$ trở đi không còn diện tích chiếu nào hứng sáng.",
      en: "`abs` turns negative values — light arriving from behind the surface — positive, so the side facing away from the source gets lit too, as if light leaked through the object. `max(0, …)` is right: from $\\theta = 90°$ on there's no projected area left to receive light.",
    },
  },
  {
    id: "ambient-term-confession",
    q: {
      vi: "Thành phần ambient cổ điển thực chất đang xấp xỉ phần nào của phương trình render, và kỹ thuật nào sau này thay nó?",
      en: "Which part of the rendering equation is the classic ambient term really approximating, and what later replaced it?",
    },
    a: {
      vi: "Toàn bộ tích phân bán cầu: một màu phẳng thay cho câu \"ánh sáng gián tiếp chắc cỡ này\", vì phần cứng thập niên 90 không thể tính tích phân đó cho từng pixel. IBL thay màu đoán ấy bằng một xấp xỉ tính sẵn của chính tích phân đó, lấy mẫu từ environment map thật.",
      en: "The entire hemisphere integral: one flat color standing in for \"indirect light is probably about this much\", because 1990s hardware couldn't evaluate that integral per pixel. IBL replaced the guessed color with a precomputed approximation of that same integral, sampled from a real environment map.",
    },
  },
];
