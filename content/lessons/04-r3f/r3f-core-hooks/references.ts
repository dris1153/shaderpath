import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "r3f-docs-hooks",
    type: "article",
    title: "React Three Fiber Docs — Hooks",
    authors: ["Poimandres"],
    url: "https://r3f.docs.pmnd.rs/api/hooks",
    note: {
      vi: "Tài liệu chính thức của useFrame/useThree/useLoader — chữ ký hàm, tham số delta, và ghi chú \"never setState in useFrame\" nằm ngay trong trang này.",
      en: "The official reference for useFrame/useThree/useLoader — function signatures, the delta parameter, and the \"never setState in useFrame\" note live right on this page.",
    },
  },
  {
    id: "r3f-docs-pitfalls",
    type: "article",
    title: "React Three Fiber Docs — Performance Pitfalls",
    authors: ["Poimandres"],
    url: "https://r3f.docs.pmnd.rs/advanced/pitfalls",
    note: {
      vi: "Giải thích đúng cơ chế bài này dạy: vì sao setState trong useFrame tạo ra một vòng phản hồi (feedback loop) đẩy 60 lượt cập nhật/giây qua bộ máy reconciliation của React.",
      en: "Explains exactly the mechanism this lesson teaches: why setState inside useFrame creates a feedback loop pumping 60 updates/second through React's reconciliation machinery.",
    },
  },
  {
    id: "r3f-docs-additional-exports",
    type: "article",
    title: "React Three Fiber Docs — Additional Exports",
    authors: ["Poimandres"],
    url: "https://r3f.docs.pmnd.rs/api/additional-exports",
    note: {
      vi: "Liệt kê đầy đủ shape của RootState (camera, gl, scene, clock, pointer, invalidate, ...) mà cả useThree() lẫn tham số state trong useFrame đều trả về.",
      en: "Lists the full RootState shape (camera, gl, scene, clock, pointer, invalidate, ...) returned by both useThree() and the state argument inside useFrame.",
    },
  },
  {
    id: "threejs-docs-clock",
    type: "article",
    title: "Three.js Docs — Clock",
    authors: ["three.js contributors"],
    url: "https://threejs.org/docs/#api/en/core/Clock",
    note: {
      vi: "Định nghĩa chính xác getDelta() và elapsedTime — nền tảng của tham số delta và state.clock mà R3F bọc lại trong useFrame.",
      en: "The precise definition of getDelta() and elapsedTime — the foundation behind the delta parameter and state.clock that R3F wraps inside useFrame.",
    },
  },
];
