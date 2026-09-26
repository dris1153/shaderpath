import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "no-overhead-means-per-frame",
    q: {
      vi: "Tài liệu R3F nói component “không có overhead” vì render nằm ngoài React. Vậy mount/unmount hàng nghìn node JSX mỗi giây có rẻ ngang Three.js thuần không?",
      en: "The R3F docs say components have “no overhead” because rendering happens outside React. So is mounting and unmounting thousands of JSX nodes per second as cheap as vanilla Three.js?",
    },
    a: {
      vi: "Không. “Không overhead” đúng cho vòng render từng frame, vì Three.js vẽ trực tiếp. Còn mỗi khi cấu trúc JSX đổi, React phải diff cây fiber và giữ sổ sách của nó, cộng thêm vào việc tạo/huỷ object — một chi phí khác hẳn chi phí render.",
      en: "No. “No overhead” holds for the per-frame render loop, where Three.js draws directly. Whenever the JSX structure changes, though, React diffs the fiber tree and keeps its bookkeeping, on top of creating/destroying objects — a different cost from rendering.",
    },
  },
  {
    id: "one-animation-loop",
    q: {
      vi: "Canvas `frameloop=\"demand\"` được tự `invalidate()` liên tục khi đang hiển thị, và `useFrame` đã tăng `rotation.y` mỗi frame. Một component thêm `requestAnimationFrame` tự viết cũng tăng đúng `rotation.y` đó “cho chắc”. Animation bị gì, và sửa thế nào?",
      en: "A `frameloop=\"demand\"` canvas is invalidated continuously while visible, and `useFrame` already advances `rotation.y` every frame. A component adds its own `requestAnimationFrame` that advances the same `rotation.y` “to be safe”. What happens to the animation, and what is the fix?",
    },
    a: {
      vi: "Hai vòng lặp độc lập cùng cộng vào một giá trị, nên vật quay nhanh gần gấp đôi và nhịp không đều vì hai vòng không đồng bộ. Giữ một nguồn duy nhất: cập nhật trong `useFrame`, gọi `invalidate()` khi cần vẽ lại.",
      en: "Two independent loops add to the same value, so it spins at nearly double speed, unevenly, since the loops are not in step. Keep a single source: update in `useFrame`, and call `invalidate()` when a redraw is needed.",
    },
  },
];
