import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "no-setstate-in-useframe",
    q: {
      vi: "Bạn lưu góc xoay bằng `setAngle((a) => a + delta)` trong `useFrame`. Có gì sai, và nên làm thế nào?",
      en: "You store a rotation angle with `setAngle((a) => a + delta)` inside `useFrame`. What is wrong, and what should you do?",
    },
    a: {
      vi: "Mỗi `setState` bắt component đó (và cây con) re-render qua React, 60 lần mỗi giây hoặc hơn. Mutate thẳng object Three.js qua ref — `ref.current.rotation.y += delta` — không đi qua React chút nào.",
      en: "Every `setState` makes that component (and its subtree) re-render through React, 60 or more times a second. Mutate the Three.js object directly through a ref — `ref.current.rotation.y += delta` — which never goes through React.",
    },
  },
  {
    id: "usethree-selector",
    q: {
      vi: "Một component nằm sâu chỉ cần `camera` nhưng gọi `useThree()` không có selector. Khi cửa sổ resize, chuyện gì xảy ra với nó?",
      en: "A deeply nested component only needs `camera` but calls `useThree()` without a selector. What happens to it when the window resizes?",
    },
    a: {
      vi: "Nó re-render theo mọi thay đổi của state canvas — size, DPR… — dù chỉ cần camera. Dùng selector `useThree((s) => s.camera)` để chỉ subscribe đúng phần cần.",
      en: "It re-renders on every change to the canvas state — size, DPR… — though it only needs the camera. Use a selector, `useThree((s) => s.camera)`, to subscribe to just that piece.",
    },
  },
  {
    id: "useloader-caches-by-url",
    q: {
      vi: "Hai component khác nhau cùng gọi `useLoader(TextureLoader, '/wood.jpg')`. Ảnh được tải mấy lần, và hai component nhận được gì?",
      en: "Two different components both call `useLoader(TextureLoader, '/wood.jpg')`. How many times is the image loaded, and what do the two components get?",
    },
    a: {
      vi: "Một lần: `useLoader` cache theo cặp loader và URL, nên cả hai nhận đúng cùng một texture instance — đổi `repeat` hay `wrapS` ở chỗ này là chỗ kia đổi theo.",
      en: "Once: `useLoader` caches by the loader-and-URL pair, so both receive the very same texture instance — change `repeat` or `wrapS` in one place and the other changes too.",
    },
  },
];
