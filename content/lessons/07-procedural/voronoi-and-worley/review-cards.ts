import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "cell-id-from-winner",
    q: {
      vi: "Bạn tô màu các vùng Voronoi bằng `hash(floor(p))` — ô lưới chứa chính pixel. Các vùng bị cắt thành từng ô vuông. Vì sao, và nên hash cái gì?",
      en: "You color Voronoi regions by `hash(floor(p))` — the pixel's own grid cell. The regions come out chopped into squares. Why, and what should be hashed instead?",
    },
    a: {
      vi: "Một vùng Voronoi đi theo điểm hạt giống của nó, không theo lưới: pixel gần biên thường thuộc về điểm của ô hàng xóm. Hash ô của chính pixel là tô theo lưới vuông. Hãy hash toạ độ nguyên của ô đã thắng trong lần quét tìm điểm gần nhất, để mọi pixel của một vùng dùng chung một màu.",
      en: "A Voronoi region follows its feature point, not the grid: pixels near a border often belong to a point from a neighboring cell. Hashing the pixel's own cell colors by the square grid. Hash the integer coordinate of the cell that won the nearest-point scan, so every pixel of a region shares one color.",
    },
  },
  {
    id: "smooth-voronoi-creases",
    q: {
      vi: "Dùng $F_1$ thô làm height map, khi chiếu sáng thì hiện nếp gấp dọc mọi biên ô, dù $F_1$ nhìn dạng ảnh xám thì mượt. Vì sao, và bản log-sum-exp thay đổi gì?",
      en: "Raw $F_1$ used as a height map shows creases along every cell border once it is lit, although $F_1$ looks smooth in grayscale. Why, and what does the log-sum-exp version change?",
    },
    a: {
      vi: "`min()` chuyển đột ngột từ bám điểm hạt giống này sang điểm khác tại biên: giá trị vẫn liên tục nhưng đạo hàm nhảy, mà ánh sáng đọc đạo hàm qua normal. Log-sum-exp thay `min()` bằng âm logarit của một tổng các hàm mũ — tiến về giá trị nhỏ nhất khi $k$ lớn nhưng uốn mượt qua mọi biên ô.",
      en: "At a border, `min()` switches abruptly from tracking one feature point to the next: the value stays continuous but its derivative jumps, and lighting reads the derivative through the normal. Log-sum-exp replaces `min()` with minus the log of a sum of exponentials, which approaches the minimum for large $k$ but bends smoothly through every border.",
    },
  },
  {
    id: "f2-minus-f1-width",
    q: {
      vi: "Viền vẽ bằng `1.0 - smoothstep(0.0, 0.08, f2 - f1)` chỗ dày chỗ mỏng. Vì sao một ngưỡng không cho một độ rộng?",
      en: "Borders drawn with `1.0 - smoothstep(0.0, 0.08, f2 - f1)` come out thick in some places and thin in others. Why doesn't one threshold give one width?",
    },
    a: {
      vi: "$F_2 - F_1$ không phải khoảng cách tới biên. Nó tăng nhanh hay chậm khi bạn bước ra xa biên tuỳ vào vị trí của hai điểm hạt giống so với chỗ đó, nên cùng ngưỡng 0.08 phủ những độ rộng khác nhau ở các biên khác nhau.",
      en: "$F_2 - F_1$ is not a distance to the border. How fast it grows as you step away from a border depends on where the two feature points sit relative to that spot, so the same 0.08 threshold covers different widths along different borders.",
    },
  },
];
