import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "simplex-radial-kernel",
    q: {
      vi: "Perlin trộn cả bốn góc của ô vuông bằng trọng số fade. Simplex 2D chỉ dùng ba đỉnh và không có `mix` song tuyến nào. Nó kết hợp các đỉnh thế nào, và nhờ vậy bỏ được thiên lệch gì?",
      en: "Perlin blends all four corners of a square cell with fade weights. 2D Simplex uses only three vertices and no bilinear `mix` at all. How does it combine them, and what bias does that remove?",
    },
    a: {
      vi: "Mỗi đỉnh ở gần đóng góp dot product gradient của nó, như Perlin, nhân với một kernel suy giảm dạng bán kính — giảm theo bình phương khoảng cách tới điểm lấy mẫu và bị cắt về 0 quá một bán kính cố định; các đóng góp chỉ đơn giản được cộng lại. Kernel giống nhau theo mọi hướng, nên không còn thiên lệch dọc hai trục lưới như kiểu trộn theo từng trục của lưới vuông.",
      en: "Each nearby vertex contributes its gradient dot product, as in Perlin, weighted by a radial falloff kernel that decays with the squared distance to the sample point and is cut to zero past a fixed radius; the contributions are simply summed. The kernel is the same in every direction, so there is no bias along the two grid axes that a square grid's per-axis blend carries.",
    },
  },
  {
    id: "unit-length-gradients",
    q: {
      vi: "Để thêm biến thể, bạn cho `perlinGradient` trả về một hướng nhân thêm một độ dài ngẫu nhiên thứ hai. Noise vẫn trông như noise. Thứ gì hỏng mà không báo?",
      en: "To add variety, you make `perlinGradient` return a direction multiplied by a second random length. The noise still looks like noise. What quietly breaks?",
    },
    a: {
      vi: "Biên độ đều. Biên $\\pm 0.7$ và phép map `value * 0.5 + 0.5` dựa trên gradient đơn vị; độ dài ngẫu nhiên nhân vào đóng góp của từng góc, nên độ tương phản đổi theo từng vùng — gradient ngắn để lại mảng nhạt gần xám giữa, còn độ dài lớn hơn 1 vượt $\\pm 0.7$ nên phép map ra ngoài $[0, 1]$.",
      en: "The even amplitude. The $\\pm 0.7$ bound and the `value * 0.5 + 0.5` remap assume unit gradients; a random length scales each corner's contribution, so contrast changes from region to region — short gradients leave washed-out patches near mid-gray, and lengths above 1 overshoot $\\pm 0.7$, so the remap leaves $[0, 1]$.",
    },
  },
  {
    id: "permutation-table-period",
    q: {
      vi: "Bản port nguyên xi code Perlin 1985 giữ bảng permutation 256 phần tử. Trên terrain rộng hàng nghìn ô, thứ gì lặp lại — và bản GPU làm gì thay thế?",
      en: "A straight port of Perlin's 1985 code keeps its 256-entry permutation table. On a terrain thousands of cells wide, what repeats — and what do GPU versions do instead?",
    },
    a: {
      vi: "Bảng có chu kỳ 256, nên mẫu gradient lặp lại sau mỗi 256 ô theo mỗi trục. Nhiều bản GLSL tính gradient thẳng từ toạ độ nguyên của góc bằng phép toán (demo bài này hash nó thành một góc quay): không phải đọc bảng từ bộ nhớ, không bị quấn vòng sau 256 ô — dù `mod289` của webgl-noise vẫn lặp sau mỗi 289 ô.",
      en: "The table has a period of 256, so the gradient pattern repeats every 256 cells along each axis. Many GLSL versions compute the gradient from the corner's integer coordinate with arithmetic instead (this lesson's demo hashes it into an angle): no table fetch and no 256-cell wrap — though webgl-noise's `mod289` permute still repeats every 289 cells.",
    },
  },
];
