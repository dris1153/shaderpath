import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "separation-must-win-up-close",
    q: {
      vi: "Cả ba luật đều chạy, nhưng đàn boid co lại thành một cục chồng lên nhau thay vì bay có khoảng cách. Cân bằng nào đang sai?",
      en: "All three rules are running, yet the flock collapses into an overlapping clump instead of flying with spacing. What is out of balance?",
    },
    a: {
      vi: "Separation quá yếu ở cự ly gần so với cohesion: cohesion luôn kéo boid về tâm khối, và chỉ separation đẩy ra (alignment chỉ làm các boid cùng hướng, không kéo lại gần hay đẩy ra xa). Trong bán kính nhỏ nhất, lực đẩy separation phải thắng rõ lực kéo cohesion — tăng trọng số của nó.",
      en: "Separation is too weak at close range relative to cohesion: cohesion keeps pulling every boid toward the local center, and only separation pushes back (alignment matches headings; it doesn't pull boids together or push them apart). Inside the smallest radius, separation's push must clearly beat cohesion's pull — raise its weight.",
    },
  },
  {
    id: "clamp-the-speed",
    q: {
      vi: "Vì sao sau khi cộng ba lực, vận tốc boid phải được kẹp vào khoảng $[v_{min}, v_{max}]$?",
      en: "Why is a boid's speed clamped into $[v_{min}, v_{max}]$ after the three forces are summed?",
    },
    a: {
      vi: "Mỗi frame các lực được cộng vào vận tốc mà không có gì làm hao bớt: những cú đẩy độ lớn cố định của cohesion, separation và soft-turn cứ chồng lên, nên tốc độ tăng dần không dừng. Còn alignment lấy trung bình vận tốc hàng xóm, mà trung bình của các hướng lệch nhau là vector ngắn hơn, nên boid giữa một đám bay lộn xộn có thể chậm gần như đứng yên. Cả hai đều phá cảm giác đang bay.",
      en: "Forces are added to velocity every frame with nothing draining it: the fixed-size pushes of cohesion, separation and the soft-turn keep piling on, so speed creeps up without end. Meanwhile alignment averages neighbors' velocities, and the average of headings that disagree is a shorter vector, so a boid in a mixed crowd can slow almost to a stop. Either one breaks the sense of flight.",
    },
  },
  {
    id: "wrap-or-soft-turn",
    q: {
      vi: "Boid bay ra khỏi biên: wrap sang phía đối diện bằng `mod()`, hay soft-turn bằng một lực steer nhẹ về tâm — mỗi cách phải trả giá gì?",
      en: "A boid leaves the bounds: wrap it to the opposite side with `mod()`, or soft-turn it with a gentle steering force back toward the center — what does each cost you?",
    },
    a: {
      vi: "Wrap rẻ và đơn giản nhưng lộ cú \"dịch chuyển tức thời\" nếu camera ở gần biên. Soft-turn mượt hơn, không nhảy vị trí, nhưng phải chỉnh độ mạnh lực, không thì boid dao động qua lại ở biên.",
      en: "Wrapping is cheap and simple but shows a visible teleport if the camera sits near the edge. Soft-turn is smoother, with no position jump, but its force needs tuning or boids oscillate back and forth at the boundary.",
    },
  },
];
