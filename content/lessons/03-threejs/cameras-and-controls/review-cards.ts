import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "damping-needs-every-frame",
    q: {
      vi: "Bật `enableDamping` nhưng chỉ gọi `controls.update()` trong sự kiện chuột. Sau khi thả chuột camera cư xử thế nào, và vì sao?",
      en: "`enableDamping` is on, but `controls.update()` is called only from mouse events. How does the camera behave after you let go, and why?",
    },
    a: {
      vi: "Khi kéo, camera trễ theo chuột; thả tay là dừng ngay, không có chút quán tính nào, và phần chuyển động chưa áp sẽ giật vào ở lần tương tác sau. Damping chỉ áp một phần chuyển động mỗi lần `update()`, nên `update()` phải chạy mỗi frame để phần còn lại được nhả ra dần.",
      en: "While dragging, the camera lags behind the cursor; on release it stops dead with no inertia at all, and the unapplied motion jumps in at the next interaction. Damping applies only part of the motion per `update()`, so `update()` must run every frame to release the rest gradually.",
    },
  },
  {
    id: "resize-needs-update-projection",
    q: {
      vi: "Khi resize, bạn đổi `camera.aspect` và kích thước renderer, nhưng hình bị méo. Thiếu gì, và vì sao?",
      en: "On resize you change `camera.aspect` and the renderer size, yet the image is distorted. What is missing, and why?",
    },
    a: {
      vi: "`camera.updateProjectionMatrix()`. `aspect` chỉ là một property JavaScript; ma trận chiếu dùng để vẽ chỉ được tính lại khi gọi hàm này, nên hình vẫn dùng tỉ lệ cũ.",
      en: "`camera.updateProjectionMatrix()`. `aspect` is just a JavaScript property; the projection matrix used for drawing is recomputed only when this is called, so the image keeps the old ratio.",
    },
  },
  {
    id: "one-writer-per-camera",
    q: {
      vi: "Bạn tween `camera.position` và gọi `camera.lookAt(p)` bằng code, trong khi vòng lặp vẫn gọi `controls.update()` của `OrbitControls` mỗi frame. Hướng nhìn của camera bị gì, vì sao, và sửa thế nào?",
      en: "You tween `camera.position` and call `camera.lookAt(p)` in code, while the loop still calls `OrbitControls`' `controls.update()` every frame. What happens to where the camera looks, why, and how do you fix it?",
    },
    a: {
      vi: "Nó bị kéo về `controls.target`: `update()` dựng lại trạng thái từ vị trí camera hiện tại rồi gọi `lookAt(controls.target)`, cộng thêm quán tính damping còn dư và các giới hạn clamp. Tween luôn cả `controls.target`, hoặc tạm ngừng gọi `update()` — `controls.enabled = false` chỉ chặn input, không chặn `update()`.",
      en: "It gets pulled back to `controls.target`: `update()` rebuilds its state from the camera's current position, then calls `lookAt(controls.target)`, adding any leftover damping and the clamps. Tween `controls.target` as well, or stop calling `update()` meanwhile — `controls.enabled = false` only blocks input, not `update()`.",
    },
  },
];
