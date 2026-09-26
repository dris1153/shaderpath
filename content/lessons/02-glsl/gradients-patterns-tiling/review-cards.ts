import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "checker-needs-floor",
    q: {
      vi: "Làm caro bằng `mod(uv.x * N + uv.y * N, 2.0)`. Thay vì các ô sắc cạnh, bạn thấy gì, và vì sao?",
      en: "A checkerboard is made with `mod(uv.x * N + uv.y * N, 2.0)`. Instead of crisp squares, what do you see, and why?",
    },
    a: {
      vi: "Các dải chéo răng cưa: giá trị tăng dần rồi rơi về 0 cứ mỗi 2 đơn vị theo đường chéo, không có ô nào — `mod` trên số thực liên tục không có bước nhảy tại biên ô. Phải `floor` trước để đổi vị trí thành chỉ số ô nguyên, rồi mới lấy `mod` của tổng hai chỉ số.",
      en: "Diagonal sawtooth bands: the value ramps up and drops back to 0 every 2 units along the diagonal, with no cells at all — `mod` on continuous values has no jump at cell borders. `floor` first to turn the position into integer cell indices, then take `mod` of their sum.",
    },
  },
  {
    id: "brick-offset-in-grid-space",
    q: {
      vi: "Muốn lệch mỗi hàng nửa ô như gạch xây. Cộng vào `grid = uv * N` thì cộng bao nhiêu, còn cộng vào `uv` gốc thì bao nhiêu?",
      en: "You want every other row shifted by half a cell, like brickwork. How much do you add to `grid = uv * N`, and how much to the original `uv`?",
    },
    a: {
      vi: "Vào `grid` thì cộng đúng 0.5, vì ở không gian grid mỗi ô rộng 1. Vào `uv` thì phải là $0.5/N$. Cộng $0.5/N$ vào `grid` là lỗi thường gặp — độ lệch co còn một phần nhỏ của ô, gần như vô hình, và càng tệ khi $N$ tăng.",
      en: "To `grid`, exactly 0.5, because in grid space each cell is 1 wide. To `uv`, it has to be $0.5/N$. Adding $0.5/N$ to `grid` is the classic slip — the shift shrinks to a sliver of a cell, nearly invisible, and worse as $N$ grows.",
    },
  },
];
