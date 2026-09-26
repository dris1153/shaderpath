import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "sine-hash-at-world-scale",
    q: {
      vi: "Hash `fract(sin(dot(p, k)) * 43758.5453)` trông sạch trên demo toạ độ 0–50. Mang sang terrain rộng hàng chục nghìn đơn vị, nó hiện vệt chéo mờ. Vì sao chỉ lộ ở toạ độ lớn?",
      en: "A `fract(sin(dot(p, k)) * 43758.5453)` hash looks clean on a demo with coordinates 0–50. On a terrain spanning tens of thousands of units it shows faint diagonal stripes. Why only at large coordinates?",
    },
    a: {
      vi: "Sai số làm tròn trong `dot()` và trong bước range reduction bên trong `sin()` lớn dần theo độ lớn của input. Quá một ngưỡng, các toạ độ cạnh nhau cho ra giá trị hash tương quan thay vì độc lập, và sự tương quan đó hiện thành cấu trúc. Hash không dùng sin (chỉ nhân, cộng, `fract`) tránh được range reduction — và dù dùng hash nào, hãy test ở đúng tỉ lệ sẽ ship.",
      en: "Rounding error in `dot()` and in the range reduction inside `sin()` grows with the size of the input. Past some magnitude, neighboring coordinates hash to correlated values instead of independent ones, and that correlation shows as structure. A sine-free hash (multiply, add, `fract`) avoids the range reduction — and whichever hash you use, test it at the scale you ship.",
    },
  },
  {
    id: "time-into-a-static-hash",
    q: {
      vi: "Bạn cộng `uTime` vào input của `hash21` trong một shader vốn cho vân tĩnh, và vân nhấp nháy từng frame. Hash vẫn xác định — vậy nhấp nháy từ đâu ra?",
      en: "You add `uTime` to the input of `hash21` in a shader meant for a still texture, and the texture flickers every frame. The hash is deterministic — so where does the flicker come from?",
    },
    a: {
      vi: "Xác định nghĩa là cùng input cho cùng output; giờ input đổi mỗi frame nên output đổi theo. Và vì các input gần nhau cho giá trị hash không liên quan, mỗi ô nhảy sang một giá trị ngẫu nhiên mới thay vì trôi mượt — nhìn thành nhấp nháy, không phải chuyển động.",
      en: "Deterministic means the same input gives the same output; the input now changes every frame, so the output does too. And since nearby inputs hash to unrelated values, each cell jumps to a new random value instead of drifting smoothly — it reads as flicker, not motion.",
    },
  },
];
