import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "steer-dont-accumulate",
    q: {
      vi: "Vì sao `vel += field * dt` rốt cuộc làm particle văng khỏi màn hình, còn trộn vận tốc về phía `normalize(field) * strength` thì không?",
      en: "Why does `vel += field * dt` eventually fling particles off screen, while mixing velocity toward `normalize(field) * strength` does not?",
    },
    a: {
      vi: "Cộng dồn thì field bơm thêm năng lượng mỗi frame và không có gì chặn tốc độ nếu thiếu damping. Trộn $\\vec v + \\alpha(\\vec v_{desired} - \\vec v)$ với $\\alpha \\in [0, 1]$ là trung bình có trọng số giữa vận tốc cũ và một mục tiêu dài đúng `strength`, nên tốc độ không bao giờ vượt `strength` (nếu lúc đầu chưa vượt).",
      en: "Accumulating lets the field pump energy in every frame, with nothing capping speed unless damping does. Mixing, $\\vec v + \\alpha(\\vec v_{desired} - \\vec v)$ with $\\alpha \\in [0, 1]$, is a weighted average of the old velocity and a target exactly `strength` long, so speed never exceeds `strength` (if it didn't start above it).",
    },
  },
  {
    id: "normalize-the-field",
    q: {
      vi: "Bỏ `normalize()` trên vector curl: cùng một `strength`, có particle bò chậm, có particle lao vút. Vì sao?",
      en: "You skip `normalize()` on the curl vector: with the same `strength`, some particles crawl while others race. Why?",
    },
    a: {
      vi: "Độ lớn thô của vector curl không đều khắp không gian — vùng noise phẳng cho vector gần 0, vùng dốc cho vector lớn hơn nhiều. `strength` chỉ điều khiển tốc độ nhất quán khi nó nhân với một hướng đơn vị.",
      en: "The raw curl magnitude varies across space — flat noise regions give near-zero vectors, steep regions much larger ones. `strength` only sets speed consistently when it multiplies a unit direction.",
    },
  },
  {
    id: "steering-alpha",
    q: {
      vi: "Trong $\\vec v_{n+1} = \\vec v_n + \\alpha(\\vec v_{desired} - \\vec v_n)$, $\\alpha$ gần 1 và $\\alpha$ nhỏ trông khác nhau thế nào?",
      en: "In $\\vec v_{n+1} = \\vec v_n + \\alpha(\\vec v_{desired} - \\vec v_n)$, how does $\\alpha$ near 1 look different from a small $\\alpha$?",
    },
    a: {
      vi: "Gần 1: vận tốc gần như bám ngay theo field — particle ôm sát đường chảy và bẻ hướng dứt khoát ở biên xoáy. Nhỏ: giữ lại nhiều quán tính cũ — lướt qua chỗ đổi hướng mượt hơn nhưng trễ so với field thật. Đây là làm mượt hàm mũ rời rạc.",
      en: "Near 1: velocity obeys the field almost instantly — particles hug the flow and snap decisively at vortex boundaries. Small: more of the old inertia survives — smoother through direction changes, but lagging behind the true field. It is discrete exponential smoothing.",
    },
  },
];
