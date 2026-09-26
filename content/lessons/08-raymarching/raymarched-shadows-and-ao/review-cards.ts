import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "shadow-ray-offset",
    q: {
      vi: "Shadow ray bắt đầu march đúng tại điểm chạm $p$. Hỏng ở đâu, và sửa thế nào?",
      en: "A shadow ray starts marching exactly at the hit point $p$. What goes wrong, and what is the fix?",
    },
    a: {
      vi: "$p$ nằm ngay trên mặt $f = 0$, nên mẫu đầu tiên đọc được khoảng cách gần 0 và bị tính là vật cản: bề mặt được chiếu sáng tự che chính nó (shadow acne). Bắt đầu từ $p + \\hat n \\varepsilon$, nhích ra khỏi bề mặt theo normal.",
      en: "$p$ sits on the $f = 0$ surface, so the first sample reads a distance near zero and counts it as an occluder: lit surfaces shadow themselves (shadow acne). Start from $p + \\hat n \\varepsilon$, just off the surface along its normal.",
    },
  },
  {
    id: "ao-floor-vs-corner",
    q: {
      vi: "`calcAO` so `map(p + n * h)` với `h` ở vài khoảng cách dọc normal. Vì sao sàn phẳng thoáng không bị che, còn góc lõm thì có?",
      en: "`calcAO` compares `map(p + n * h)` with `h` at a few distances along the normal. Why does an open flat floor get no occlusion while a concave corner does?",
    },
    a: {
      vi: "Không có gì ở gần thì bước $h$ ra khỏi sàn, bề mặt gần nhất vẫn là chính cái sàn, cách đúng $h$, nên `h - d` bằng 0. Ở góc lõm, một bề mặt khác ở gần hơn $h$, nên `d < h` và hiệu dương cộng dồn thành độ che.",
      en: "With nothing nearby, stepping $h$ off the floor leaves the floor itself as the nearest surface, exactly $h$ away, so `h - d` is 0. In a corner, another surface is closer than $h$, so `d < h` and the positive difference accumulates as occlusion.",
    },
  },
  {
    id: "ao-on-ambient-only",
    q: {
      vi: "Vì sao AO chỉ nhân vào thành phần ambient, không nhân vào cả diffuse?",
      en: "Why does AO multiply only the ambient term, not the diffuse one too?",
    },
    a: {
      vi: "AO đo độ bị bao kín của cả bán cầu quanh điểm — thứ chặn ánh sáng gián tiếp đến từ mọi hướng. Ánh sáng trực tiếp đến từ một hướng, và shadow ray đã kiểm tra đúng hướng đó. Nhân AO vào diffuse thì một khe hướng thẳng về nguồn sáng không bị chặn vẫn tối đi, nên chỗ tiếp xúc trông đục.",
      en: "AO measures how enclosed the whole hemisphere around the point is, which is what blocks indirect light arriving from every direction. Direct light arrives from one direction, and the shadow ray already tests exactly that direction. Multiply AO into diffuse and a crease facing an unblocked light still goes dark, so contact areas look muddy.",
    },
  },
];
