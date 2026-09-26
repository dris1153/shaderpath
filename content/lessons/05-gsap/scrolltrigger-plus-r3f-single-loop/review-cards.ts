import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "invalidate-in-onupdate",
    q: {
      vi: "Canvas dùng `frameloop=\"demand\"`, và ScrollTrigger ghi `progress.value` trong `onUpdate`. Dữ liệu cập nhật đúng nhưng scene đứng im khi cuộn. Thiếu gì?",
      en: "The canvas uses `frameloop=\"demand\"`, and ScrollTrigger writes `progress.value` in `onUpdate`. The data updates correctly, but the scene sits still while scrolling. What is missing?",
    },
    a: {
      vi: "Gọi `invalidate()` trong `onUpdate`. Ở demand mode, R3F chỉ vẽ khi có người yêu cầu; dữ liệu đổi mà không ai gọi `invalidate()` thì không có frame nào được vẽ lại.",
      en: "Call `invalidate()` in `onUpdate`. In demand mode R3F draws only when asked; data that changes without anyone calling `invalidate()` never gets a new frame.",
    },
  },
  {
    id: "scroll-writes-a-proxy",
    q: {
      vi: "Muốn cuộn trang điều khiển dolly camera trong R3F. ScrollTrigger nên ghi thẳng vào `camera.position`, hay ghi vào đâu — và vì sao?",
      en: "You want scrolling to drive a camera dolly in R3F. Should ScrollTrigger write straight into `camera.position`, or somewhere else — and why?",
    },
    a: {
      vi: "Ghi vào một object proxy, như `progress.value`, rồi để `useFrame` — nguồn render duy nhất — đọc proxy và đặt camera. Như vậy camera chỉ có một chủ quyết định mỗi frame: nếu ScrollTrigger ghi thẳng camera trong khi OrbitControls hay `useFrame` cũng đặt nó, hai bên giằng co. Đọc qua proxy còn cho phép làm mượt (lerp) ở cùng một chỗ.",
      en: "Into a proxy object such as `progress.value`, then let `useFrame` — the only render source — read the proxy and place the camera. That way the camera has a single owner deciding it each frame: if ScrollTrigger writes the camera directly while OrbitControls or `useFrame` also sets it, the two fight. Reading through a proxy also lets you smooth (lerp) in one place.",
    },
  },
];
