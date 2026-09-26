import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "normal-inside-the-loop",
    q: {
      vi: "Một raymarcher gọi `calcNormal` ở mọi bước của vòng lặp march. Tốn gì, và vì sao toàn bộ là lãng phí?",
      en: "A raymarcher calls `calcNormal` on every step of the march loop. What does that cost, and why is it all wasted?",
    },
    a: {
      vi: "Mỗi lần gọi là 4–6 lần đánh giá `map()`, giờ nhân với mọi bước (thường 50–100). Vòng lặp chỉ cần khoảng cách tới bề mặt để quyết định bước kế; normal chỉ có ý nghĩa tại điểm chạm cuối cùng, nên tính đúng một lần ở đó.",
      en: "Each call is 4–6 `map()` evaluations, now multiplied by every step (often 50–100). The loop only ever needs the distance to the surface to pick the next step; the normal matters only at the final hit point, so compute it once there.",
    },
  },
  {
    id: "normal-epsilon-tradeoff",
    q: {
      vi: "Với $\\varepsilon$ lớn, cạnh sắc của hộp trông bo tròn khi đổ bóng; với $\\varepsilon$ rất nhỏ, mặt cầu mượt hoàn hảo lại lấm tấm. Giải thích cả hai.",
      en: "With a large $\\varepsilon$, a box's sharp edges look rounded in the shading; with a tiny one, a perfectly smooth sphere looks speckled. Explain both.",
    },
    a: {
      vi: "Lớn: các mẫu trải trên vùng rộng $2\\varepsilon$, nên gần cạnh chúng thấy cả hai mặt và lấy trung bình thành một hướng nằm giữa hai normal. Rất nhỏ: `map(p + e) - map(p - e)` trừ hai số float gần bằng nhau, và hiệu thật chìm xuống dưới nhiễu làm tròn của float. Chọn $\\varepsilon$ theo chi tiết nhỏ nhất cần giữ sắc nét.",
      en: "Large: the samples span a region $2\\varepsilon$ wide, so near an edge they see both faces and average them into a direction between the two normals. Tiny: `map(p + e) - map(p - e)` subtracts two nearly equal floats, and the real difference sinks below float rounding noise. Pick $\\varepsilon$ relative to the smallest feature that must stay crisp.",
    },
  },
  {
    id: "tetrahedron-trade",
    q: {
      vi: "Kỹ thuật tetrahedron ước lượng normal từ 4 mẫu thay vì 6 mẫu của central differences. Nó đánh đổi điều gì, và vì sao vẫn là mặc định?",
      en: "The tetrahedron technique estimates the normal from 4 samples instead of central differences' 6. What does it give up, and why is it still the default?",
    },
    a: {
      vi: "Bốn mẫu không đối xứng quanh $p$, nên các số hạng bậc hai mà central differences triệt tiêu vẫn còn: sai số bậc $\\varepsilon$ thay vì $\\varepsilon^2$. Với $\\varepsilon$ nhỏ dùng thực tế thì mắt không thấy, còn bớt một phần ba số lần gọi `map()` thì đáng kể khi `map()` là cả một cây SDF thật.",
      en: "Its four samples are not symmetric about $p$, so the second-order terms that central differences cancel survive: error of order $\\varepsilon$ instead of $\\varepsilon^2$. At the small $\\varepsilon$ actually used that is invisible, while cutting a third of the `map()` calls matters once `map()` is a real SDF tree.",
    },
  },
];
