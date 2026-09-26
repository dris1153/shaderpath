import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "state-textures-use-nearest",
    q: {
      vi: "Vì sao một state texture phải dùng `NearestFilter`, không phải `LinearFilter`?",
      en: "Why must a state texture use `NearestFilter` rather than `LinearFilter`?",
    },
    a: {
      vi: "Texel ở đây là DỮ LIỆU, không phải màu: các texel cạnh nhau thường là những particle chẳng liên quan. Với `LinearFilter`, mọi lần lấy mẫu không rơi đúng tâm texel sẽ trộn vị trí của tối đa bốn particle kề nhau thành một giá trị vô nghĩa, và không có lỗi nào báo. `NearestFilter` bảo đảm mỗi lần đọc trả về đúng một texel.",
      en: "A texel here is DATA, not color: neighboring texels are usually unrelated particles. With `LinearFilter`, any lookup that isn't exactly on a texel center blends the positions of up to four neighboring particles into a meaningless value, with no error. `NearestFilter` guarantees every read returns exactly one texel.",
    },
  },
  {
    id: "half-float-far-from-origin",
    q: {
      vi: "Vị trí particle lưu bằng half float. Particle quanh $x \\approx 1$ chạy mượt, còn particle quanh $x \\approx 1500$ nhảy từng nấc. Vì sao, và sửa thế nào?",
      en: "Particle positions are stored as half float. Particles near $x \\approx 1$ move smoothly, while those near $x \\approx 1500$ jump in steps. Why, and what is the fix?",
    },
    a: {
      vi: "Khoảng cách giữa hai số half float lớn dần theo độ lớn: quanh 1 là khoảng 0.001, còn từ 1024 trở lên là 1 đơn vị — vị trí bị làm tròn về số nguyên, và particle chậm thậm chí đứng im vì bước mỗi frame nhỏ hơn 0.5 bị làm tròn mất. Trừ một gốc toạ độ cục bộ trước khi ghi vào texture để giá trị lưu trữ nhỏ lại (hoặc dùng `FloatType` nếu thiết bị hỗ trợ).",
      en: "The gap between representable half floats grows with magnitude: about 0.001 near 1, but a whole unit from 1024 up — positions snap to integers, and slow particles can even freeze, since a per-frame step under 0.5 rounds away. Subtract a local origin before writing into the texture so the stored values stay small (or use `FloatType` where the device supports it).",
    },
  },
  {
    id: "clamp-the-delta",
    q: {
      vi: "Mở lại một tab bị ẩn một lúc, particle xuyên qua biên va chạm và vận tốc bùng nổ. Vì sao, và chặn bằng gì?",
      en: "After you return to a tab that was hidden for a while, particles tunnel through their bounds and velocities explode. Why, and what prevents it?",
    },
    a: {
      vi: "Trình duyệt dừng vòng frame khi tab bị ẩn, và R3F không giới hạn `delta`, nên delta đầu tiên sau đó bằng cả khoảng thời gian bị ẩn — vài giây hoặc hơn. Một bước dài như vậy đưa particle vượt thẳng qua biên (tunnelling), còn lực cứng như lò xo thì vọt lố và lớn dần qua từng bước. Clamp `uDelta` về một giá trị tối đa hợp lý (demo dùng 1/30 giây) trước khi đưa vào compute pass.",
      en: "The browser pauses the frame loop while the tab is hidden, and R3F does not cap `delta`, so the first delta afterward is the whole hidden time — seconds or more. One step that long carries a particle straight past a boundary (tunnelling), and stiff forces like springs overshoot and grow every step. Clamp `uDelta` to a sane maximum (the demo uses 1/30 s) before it reaches the compute pass.",
    },
  },
];
