import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "circle-loop-closes",
    q: {
      vi: "Một GIF phải lặp đúng sau mỗi $T$ giây. Vì sao lấy mẫu `noise4(p.x, p.y, R * cos(w * t), R * sin(w * t))` với `w = 2π / T` khép kín vòng lặp, còn chế độ slice `noise3(p, t)` thì không?",
      en: "A GIF must loop exactly every $T$ seconds. Why does sampling `noise4(p.x, p.y, R * cos(w * t), R * sin(w * t))` with `w = 2π / T` close the loop, when slice mode `noise3(p, t)` cannot?",
    },
    a: {
      vi: "Slice tại $t = T$ đọc một lát khác của khối noise so với $t = 0$ — không có gì đưa toạ độ quay về. Trên vòng tròn, hai toạ độ thêm vào trở về đúng $(R, 0)$ khi $t = T$, nên cả bốn tham số khớp và frame tại $t = T$ chính là frame tại $t = 0$: render $t$ trong $[0, T)$ thì GIF nối vòng không có đường nối.",
      en: "Slice at $t = T$ reads a different slab of the noise volume than at $t = 0$ — nothing brings the coordinate back. On the circle, the two extra coordinates return to exactly $(R, 0)$ at $t = T$, so all four arguments match and the frame at $t = T$ is the frame at $t = 0$: render $t$ in $[0, T)$ and the GIF wraps with no seam.",
    },
  },
  {
    id: "loop-radius",
    q: {
      vi: "Trong loop 4D trên vòng tròn, bán kính $R$ quá nhỏ trông thế nào, quá lớn trông thế nào — và vì sao?",
      en: "In the 4D circle loop, what does a radius $R$ that is too small look like, and one that is too large — and why?",
    },
    a: {
      vi: "Quá nhỏ: vòng tròn chỉ phủ một góc bé của không gian noise, nên hoa văn chỉ lắc lư tại chỗ. Quá lớn: điểm lấy mẫu đi $2\\pi R$ đơn vị noise mỗi vòng, nên hoa văn sôi sục nhanh, và khi bước của một frame, $2\\pi R / (T \\cdot \\text{fps})$, tiến gần một ô noise thì các frame liên tiếp hết tương quan — chuyển động thành nhấp nháy. Nên chọn $R$ theo tốc độ biến đổi bạn muốn với $T$ đã có.",
      en: "Too small: the circle covers a tiny patch of noise space, so the pattern only wobbles in place. Too large: the sample travels $2\\pi R$ noise units per loop, so the pattern boils fast, and once one frame's step, $2\\pi R / (T \\cdot \\text{fps})$, nears a noise cell, consecutive frames stop correlating and the motion turns to flicker. So pick $R$ from the evolution speed you want for your $T$.",
    },
  },
  {
    id: "unbounded-time-precision",
    q: {
      vi: "Một màn hình kiosk chạy noise ở chế độ loop với `t` = số giây kể từ lúc bật máy. Sau khoảng một ngày, chuyển động bắt đầu giật. Vì sao, và nên bọc `t` ở đâu?",
      en: "A kiosk runs noise in loop mode with `t` = seconds since boot. After about a day the motion starts to stutter. Why, and where should `t` be wrapped?",
    },
    a: {
      vi: "Float 32-bit chỉ có khoảng 7 chữ số có nghĩa: quanh `t` ≈ 100000, khoảng cách giữa hai giá trị biểu diễn được là khoảng 0.008 giây, cỡ nửa frame ở 60 fps, nên các frame liên tiếp nhận bước thời gian không đều. Bọc trên CPU trước khi gửi lên, `uTime = elapsed % T` bằng số 64-bit của JavaScript — chuyển động vốn tuần hoàn theo $T$ nên màn hình không đổi. `mod(t, T)` trong shader là quá muộn: giá trị đã bị làm tròn lúc thành uniform 32-bit.",
      en: "A 32-bit float carries about 7 significant digits: around `t` ≈ 100,000 the gap between representable values is about 0.008 s, roughly half a frame at 60 fps, so consecutive frames get uneven time steps. Wrap on the CPU before uploading, `uTime = elapsed % T` in JavaScript's 64-bit numbers — the motion is periodic in $T$, so nothing on screen changes. A `mod(t, T)` inside the shader is too late: the value was already rounded when it became a 32-bit uniform.",
    },
  },
];
