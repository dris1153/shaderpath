import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "subtraction-sign",
    q: {
      vi: "Bạn viết `max(dA, dB)` với ý *khoét B khỏi A*. Nó compile và vẽ ra một hình. Hình gì, và thiếu gì?",
      en: "You write `max(dA, dB)` meaning *carve B out of A*. It compiles and renders a shape. Which shape, and what is missing?",
    },
    a: {
      vi: "Intersection — chỉ phần nằm trong cả hai. Subtraction cần đảo dấu B: `max(dA, -dB)`. Đảo dấu biến B thành một cái khuôn lộn trong ra ngoài, và giao A với khuôn đó giữ lại phần của A nằm ngoài B.",
      en: "The intersection — only where both are inside. Subtraction needs B's sign flipped: `max(dA, -dB)`. Negating turns B inside-out into a mold, and intersecting A with that mold keeps the part of A outside B.",
    },
  },
  {
    id: "max-is-only-a-bound",
    q: {
      vi: "Sphere tracing chạy ổn trên một intersection dựng bằng `max` của hai SDF chính xác. Vì sao không nên dùng lại giá trị đó như một khoảng cách thật gần đường nối — chẳng hạn cho AO?",
      en: "Sphere tracing handles an intersection built with `max` of two exact SDFs just fine. Why shouldn't you reuse that value as a real distance near the seam — say, for AO?",
    },
    a: {
      vi: "Gần đường nối, `max` trả về ít hơn khoảng cách Euclid thật — chỉ là một bound. Sphere tracing chịu được điều đó (chỉ bước ngắn hơn), nhưng thứ gì đọc giá trị như khoảng cách thật, như AO so `d` với `h`, sẽ thấy một bề mặt gần hơn thực tế và có thể tối đi ở đó.",
      en: "Near the seam `max` returns less than the true Euclidean distance — only a bound. Sphere tracing tolerates that (it just takes shorter steps), but anything that reads the value as a real distance, like AO comparing `d` with `h`, sees a surface closer than it is and can darken there.",
    },
  },
  {
    id: "blend-material-with-h",
    q: {
      vi: "Hai khối được hàn bằng `smin`, nhưng màu lại chọn bằng `dA < dB ? colA : colB`. Trông thế nào, và sửa ra sao?",
      en: "Two shapes are welded with `smin`, but the color is picked with `dA < dB ? colA : colB`. What does it look like, and what is the fix?",
    },
    a: {
      vi: "Một bề mặt mượt bị một đường màu sắc cạnh cắt ngang, nên trông như hai mảnh dán vào nhau. Dùng lại trọng số $h$ mà `smin` đã tính: `mix(colB, colA, h)` — màu trộn đúng ở chỗ hình học trộn.",
      en: "A smooth surface with a hard color line across it, so it reads as two parts glued together. Reuse the weight $h$ that `smin` already computed: `mix(colB, colA, h)` — the color blends exactly where the geometry does.",
    },
  },
  {
    id: "weld-before-carving",
    q: {
      vi: "Cây nấm: mũ và thân hàn bằng `smin`, khe mang khoét bằng một torus trừ đi. Vì sao khoét sau khi hàn chứ không phải trước?",
      en: "A mushroom: cap and stem welded with `smin`, gills carved with a subtracted torus. Why carve after welding rather than before?",
    },
    a: {
      vi: "Số hạng bù của `smin` hạ thấp khoảng cách ở mọi chỗ hai khoảng cách đầu vào chênh nhau chưa tới $k$, và nó không biết gì về khe đã khoét vào một trong hai — hàn sau khi khoét thì phần lõm đó có thể lấp lại một phần khe. Hàn các khối chính trước, khoét chi tiết nhỏ sau cùng.",
      en: "`smin`'s extra term dips the distance wherever its two input distances are within $k$ of each other, and it knows nothing about a groove already cut into one of them — weld after carving and that dip can partly fill the groove back in. Weld the main masses first, carve fine detail last.",
    },
  },
];
