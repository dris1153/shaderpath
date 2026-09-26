import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "render-draws-one-frame",
    q: {
      vi: "Gọi `renderer.render(scene, camera)` một lần sau khi setup, rồi tăng `mesh.rotation.y` trong một `setInterval`. Trên canvas có chuyển động không, và vì sao?",
      en: "You call `renderer.render(scene, camera)` once after setup, then increase `mesh.rotation.y` inside a `setInterval`. Does anything move on the canvas, and why?",
    },
    a: {
      vi: "Không. `render()` vẽ đúng một khung hình, bên trong không có `requestAnimationFrame` nào; đổi `rotation` chỉ đổi dữ liệu JavaScript. Mỗi khung hình phải gọi `render()` lại — vòng lặp là việc của bạn, thường bằng `requestAnimationFrame`.",
      en: "No. `render()` draws exactly one frame and has no `requestAnimationFrame` inside; changing `rotation` only changes JavaScript data. Every frame must call `render()` again — the loop is yours to run, usually with `requestAnimationFrame`.",
    },
  },
  {
    id: "clamp-pixel-ratio",
    q: {
      vi: "Vì sao `renderer.setPixelRatio(window.devicePixelRatio)` thường được thay bằng `Math.min(window.devicePixelRatio, 2)` trên điện thoại DPR 3?",
      en: "Why is `renderer.setPixelRatio(window.devicePixelRatio)` usually replaced with `Math.min(window.devicePixelRatio, 2)` on a DPR 3 phone?",
    },
    a: {
      vi: "Số fragment tăng theo bình phương DPR: DPR 3 vẽ 9 lần số pixel của DPR 1, tức 2.25 lần so với DPR 2 — trong khi mắt gần như không phân biệt được độ nét thêm đó.",
      en: "Fragment count grows with the square of the DPR: DPR 3 draws 9 times the pixels of DPR 1, which is 2.25 times DPR 2 — for extra sharpness the eye can barely tell apart.",
    },
  },
];
