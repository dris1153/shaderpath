import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "kernel-radius-is-scene-units",
    q: {
      vi: "Một cảnh chỉ rộng 1–2 đơn vị, để `kernelRadius` mặc định là 8: AO phủ gần như cả khung hình như một lớp sương. Vì sao?",
      en: "A scene only 1–2 units across keeps the default `kernelRadius` of 8: AO spreads over nearly the whole frame like a haze. Why?",
    },
    a: {
      vi: "`kernelRadius` tính bằng đơn vị view-space — chính đơn vị thế giới của cảnh — chứ không phải pixel. Bán kính 8 rải mẫu khắp cả cảnh, nên gần như điểm nào cũng tìm thấy một bề mặt nằm trước các mẫu của nó và bị tối đi — AO không còn khu trú ở các góc tiếp xúc. Chỉnh bán kính theo kích thước của những góc cần tối.",
      en: "`kernelRadius` is in view-space units — the scene's own world units — not pixels. A radius of 8 scatters samples across the whole scene, so almost every point finds some surface in front of its samples and darkens — AO stops being local to contact corners. Size the radius to the corners that should darken.",
    },
  },
  {
    id: "rotate-kernel-then-blur",
    q: {
      vi: "Vì sao `SSAOPass` đổi hướng kernel theo từng pixel bằng một noise texture 4×4 lặp lại, rồi lại blur kết quả?",
      en: "Why does `SSAOPass` vary its kernel's orientation per pixel with a tiled 4×4 noise texture, and then blur the result?",
    },
    a: {
      vi: "Kernel cố định, cùng hướng ở mọi pixel, để lại vệt banding theo đúng hình kernel — mắt rất nhạy với mẫu lặp. Thay đổi theo từng pixel biến banding thành nhiễu tần số cao, và box blur 5×5 ngay sau đó làm mịn nhiễu này.",
      en: "A fixed kernel, oriented the same way at every pixel, leaves banding in the kernel's shape — the eye is very sensitive to repeating patterns. Per-pixel variation turns that banding into high-frequency noise, and the 5×5 box blur right after smooths it out.",
    },
  },
  {
    id: "ao-at-half-resolution",
    q: {
      vi: "Vì sao SSAO có thể chạy ở nửa độ phân giải mà gần như không thấy khác biệt?",
      en: "Why can SSAO run at half resolution with almost no visible difference?",
    },
    a: {
      vi: "AO là tín hiệu tần số thấp — bóng tiếp xúc mờ dần, không có chi tiết sắc. Nửa chiều rộng và nửa chiều cao chỉ còn 1/4 số pixel phải chạy kernel, và kết quả phóng lên vẫn mượt khi ghép vào buffer chính — trừ dọc đường viền vật, nơi AO phóng lên có thể lem qua chỗ độ sâu đổi đột ngột.",
      en: "AO is a low-frequency signal — soft contact shadows with no sharp detail. Half the width and half the height leaves a quarter of the pixels to run the kernel, and the result still upsamples smoothly onto the main buffer — except along silhouettes, where the upsampled AO can bleed across depth edges.",
    },
  },
];
