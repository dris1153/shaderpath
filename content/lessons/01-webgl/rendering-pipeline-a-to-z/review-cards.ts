import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "fragment-cannot-move-geometry",
    q: {
      vi: "Tam giác lệch sang phải 0.1. Sửa trong fragment shader được không, và vì sao?",
      en: "A triangle sits 0.1 too far to the right. Can the fragment shader fix it, and why?",
    },
    a: {
      vi: "Không. Vị trí đã chốt khi vertex shader ghi `gl_Position` và rasterizer sinh fragment; fragment shader chỉ quyết định màu của những fragment đã có, không dịch được hình. Sửa trong vertex shader.",
      en: "No. The position was settled when the vertex shader wrote `gl_Position` and the rasterizer produced fragments; the fragment shader only decides the color of fragments that already exist and cannot move geometry. Fix it in the vertex shader.",
    },
  },
  {
    id: "varying-has-no-hard-edge",
    q: {
      vi: "Varying `vBand` bằng 0 ở đỉnh A và 10 ở đỉnh B. Muốn một ranh giới màu sắc nét tại `vBand = 5`: nội suy có tự tạo ra nó không, và phải làm gì?",
      en: "A varying `vBand` is 0 at vertex A and 10 at vertex B. You want a crisp color boundary at `vBand = 5`: does interpolation create it, and what do you do?",
    },
    a: {
      vi: "Không: nội suy đi qua mọi giá trị trung gian một cách mượt, không có bước nhảy nào. Tự ngưỡng trong fragment shader, ví dụ `step(5.0, vBand)`.",
      en: "No: interpolation passes smoothly through every value in between, with no jump anywhere. Threshold it yourself in the fragment shader, for example `step(5.0, vBand)`.",
    },
  },
  {
    id: "clipped-only-by-one-plane",
    q: {
      vi: "Cả ba đỉnh của một tam giác đều nằm ngoài vùng nhìn. Có chắc tam giác bị loại không, và trường hợp nào thì chắc chắn?",
      en: "All three vertices of a triangle lie outside the view volume. Is it certain to be discarded, and in which case is that certain?",
    },
    a: {
      vi: "Không chắc. Chỉ chắc chắn bị loại khi cả ba cùng nằm ngoài một mặt phẳng clip, ví dụ cả ba có $x > w$. Nếu chúng ở các phía khác nhau, tam giác vẫn có thể cắt qua vùng nhìn — clipping phải tính phần giao thật chứ không chỉ nhìn các đỉnh.",
      en: "Not certain. It is certainly discarded only when all three lie outside the same clip plane, for example all with $x > w$. If they are on different sides, the triangle can still cross the view volume — clipping has to compute the real intersection, not just look at the vertices.",
    },
  },
];
