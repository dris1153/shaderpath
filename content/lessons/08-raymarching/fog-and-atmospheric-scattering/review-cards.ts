import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "fog-is-a-percentage",
    q: {
      vi: "Vì sao `fogAmount = density * t` là mô hình sai cho fog, kể cả khi đã clamp về 1?",
      en: "Why is `fogAmount = density * t` the wrong model for fog, even clamped to 1?",
    },
    a: {
      vi: "Môi trường chặn một TỈ LỆ cố định của phần ánh sáng còn lại qua mỗi lớp mỏng, không phải một LƯỢNG cố định. Cộng dồn lại thành $T = e^{-\\rho t}$: mất nhanh lúc đầu rồi chậm dần, không bao giờ chạm hẳn 0. Bản tuyến tính trừ cùng một LƯỢNG mỗi mét, nên phủ kín fog ở một khoảng cách hữu hạn.",
      en: "A medium blocks a fixed fraction of the light still left in each thin slab, not a fixed amount. That compounds into $T = e^{-\\rho t}$: fast loss at first, then slower, never quite reaching zero. The linear version removes the same amount every meter, so it hits full fog at a finite distance.",
    },
  },
  {
    id: "fog-needs-marched-t",
    q: {
      vi: "Công thức fog được cấp `d` ở bước cuối của vòng lặp thay vì `t` đã tích luỹ. Bạn thấy gì, dù cảnh sâu tới đâu?",
      en: "The fog formula is fed the loop's final `d` instead of the accumulated `t`. What do you see, however deep the scene?",
    },
    a: {
      vi: "Gần như không có fog ở đâu cả. `d` là khoảng cách tới bề mặt ở bước cuối, gần 0 tại mọi điểm chạm, nên $T \\approx 1$ với mọi pixel. Fog cần `t`, tổng quãng đường tia đã march.",
      en: "Almost no fog anywhere. `d` is the distance to the surface at the last step, near zero at every hit, so $T \\approx 1$ for every pixel. Fog needs `t`, the total distance the ray has marched.",
    },
  },
  {
    id: "height-fog-integral",
    q: {
      vi: "Khi mật độ loãng dần theo độ cao, vì sao không thể dùng $e^{-\\rho t}$ với mật độ tại điểm chạm?",
      en: "With density that thins with altitude, why can't you use $e^{-\\rho t}$ with the density at the hit point?",
    },
    a: {
      vi: "Dọc tia, mật độ đổi ở mọi điểm — một tia từ đáy thung lũng lên đỉnh núi đi qua lớp fog dày rồi loãng — nên transmittance phụ thuộc vào mật độ tích phân dọc cả quãng đường, không phải một mẫu. Với height fog dạng mũ, tích phân đó có dạng đóng, nên không cần march thêm vòng thứ hai.",
      en: "Along the ray the density changes at every point — a ray from a valley floor up to a peak crosses thick fog, then thin — so transmittance depends on the density integrated along the whole path, not on one sample. For exponential height fog that integral has a closed form, so no second march is needed.",
    },
  },
];
