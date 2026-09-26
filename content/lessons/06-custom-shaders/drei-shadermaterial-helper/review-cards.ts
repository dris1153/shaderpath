import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "create-class-at-module-scope",
    q: {
      vi: "Bạn gọi `shaderMaterial()` bên trong thân component, và làm theo gợi ý hot-reload là gắn `key={WaveMaterial.key}` cho `<waveMaterial />`. Mỗi lần component render lại, chuyện gì xảy ra?",
      en: "You call `shaderMaterial()` inside the component body and, following the hot-reload advice, put `key={WaveMaterial.key}` on `<waveMaterial />`. What happens every time the component re-renders?",
    },
    a: {
      vi: "Mỗi lần render tạo ra một class mới với `.key` mới, nên key của phần tử đổi và React unmount rồi mount lại material — mất state và tạo lại material mỗi lần. Gọi `shaderMaterial()` và `extend()` ở module scope để class và key ổn định.",
      en: "Every render creates a new class with a new `.key`, so the element's key changes and React unmounts and remounts the material — losing state and rebuilding it each time. Call `shaderMaterial()` and `extend()` at module scope so the class and key stay stable.",
    },
  },
  {
    id: "declare-module-not-any",
    q: {
      vi: "`<waveMaterial />` làm TypeScript báo lỗi, và bạn ép `as any` cho qua. Bạn mất gì, và cách đúng là gì?",
      en: "`<waveMaterial />` makes TypeScript complain, and you silence it with `as any`. What do you lose, and what is the proper fix?",
    },
    a: {
      vi: "Mất toàn bộ kiểm tra prop — gõ sai tên uniform cũng không còn bị báo. Khai báo phần tử trong `ThreeElements` bằng vài dòng `declare module '@react-three/fiber'` để có đủ type-safety (ở R3F v9, `extend(Class)` còn trả về sẵn một component có type).",
      en: "All prop checking — a misspelled uniform name no longer gets flagged. Declare the element in `ThreeElements` with a few lines of `declare module '@react-three/fiber'` for full type safety (in R3F v9, `extend(Class)` also returns an already-typed component).",
    },
  },
];
