import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "why-the-step-is-safe",
    q: {
      vi: "$f(p)$ không biết gì về hướng của tia. Vì sao bước `t += f(p)` vẫn không bao giờ xuyên qua bề mặt?",
      en: "$f(p)$ knows nothing about the direction of the ray. Why can the step `t += f(p)` still never tunnel through a surface?",
    },
    a: {
      vi: "$|f(p)|$ là khoảng cách tới bề mặt gần nhất theo mọi hướng, nên hình cầu bán kính đó quanh $p$ không chứa bề mặt nào. Đi $f(p)$ theo hướng bất kỳ — kể cả hướng của tia — vẫn nằm trong hình cầu đó; tệ nhất là chạm bề mặt. (Điều này cần `rd` đã chuẩn hoá để $t$ là khoảng cách thật, và $f$ không bao giờ ước lượng thừa.)",
      en: "$|f(p)|$ is the distance to the nearest surface in any direction, so the ball of that radius around $p$ contains no surface. Moving $f(p)$ in any direction — the ray's included — stays inside that ball; at worst it touches the surface. (This needs `rd` normalized, so $t$ measures real distance, and an $f$ that never overestimates.)",
    },
  },
  {
    id: "missing-max-dist",
    q: {
      vi: "Một raymarcher có `maxSteps` nhưng không kiểm tra `t > maxDist`. Cảnh là một vật nhỏ trên nền trời trống. Phần lớn chi phí của frame rơi vào đâu?",
      en: "A raymarcher has `maxSteps` but no `t > maxDist` check. The scene is one small object against open sky. Where does most of the frame's cost go?",
    },
    a: {
      vi: "Vào bầu trời. Tia không chạm gì thì không bao giờ thoả `d < epsilon`, nên thiếu ngưỡng khoảng cách nó chạy đủ `maxSteps` mới dừng — mà bầu trời thường chiếm nhiều pixel hơn hẳn vật thể.",
      en: "To the sky. A ray that hits nothing never meets `d < epsilon`, so without a distance cutoff it runs all `maxSteps` before stopping — and sky usually covers far more pixels than the object.",
    },
  },
];
