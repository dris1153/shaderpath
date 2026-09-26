import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "manual-add-is-invisible-to-react",
    q: {
      vi: "Trong một component R3F, bạn gọi `scene.add(mesh)` bên trong `useEffect` mà không có cleanup. Khi component re-mount hoặc unmount, chuyện gì xảy ra?",
      en: "Inside an R3F component you call `scene.add(mesh)` in a `useEffect` with no cleanup. What happens when the component remounts or unmounts?",
    },
    a: {
      vi: "Reconciler không biết object đó tồn tại: nó không được diff, không được gỡ hay dispose khi unmount, và mỗi lần effect chạy lại có thể thêm một bản nữa. Khai báo nó bằng JSX, hoặc tự `remove` và `dispose` trong cleanup.",
      en: "The reconciler does not know the object exists: it is never diffed, never removed or disposed on unmount, and every re-run of the effect may add another copy. Declare it in JSX, or `remove` and `dispose` it yourself in the cleanup.",
    },
  },
  {
    id: "conditional-jsx-unmounts",
    q: {
      vi: "Scene có `{showHelper && <axesHelper />}`. Khi `showHelper` chuyển thành `false`, object Three.js của helper đi đâu, và bật lại thì sao?",
      en: "The scene contains `{showHelper && <axesHelper />}`. When `showHelper` turns `false`, where does the helper's Three.js object go, and what happens when it turns back on?",
    },
    a: {
      vi: "Reconciler unmount node đó: gỡ object khỏi cha trong scene graph và gọi `dispose()` của chính helper. Bật lại thì một object mới được tạo — scene luôn là hàm của state, không cần `add`/`remove` bằng tay.",
      en: "The reconciler unmounts that node: it removes the object from its parent in the scene graph and calls the helper's own `dispose()`. Turning it back on creates a fresh object — the scene is a function of state, with no manual `add`/`remove`.",
    },
  },
];
