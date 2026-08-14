import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "r3f-docs-how-it-works",
    type: "article",
    title: "React Three Fiber Docs — How It Works",
    authors: ["Poimandres"],
    url: "https://r3f.docs.pmnd.rs/tutorials/how-it-works",
    note: {
      vi: "Nguồn chính thức khẳng định R3F là một renderer/reconciler nhắm vào scene graph Three.js, không phải lớp bọc hàm gọi hộ — đúng luận điểm mở đầu bài này.",
      en: "The official source stating R3F is a renderer/reconciler targeting the Three.js scene graph, not a function-calling wrapper — exactly this lesson's opening claim.",
    },
  },
  {
    id: "r3f-docs-objects-disposal",
    type: "article",
    title: "React Three Fiber Docs — Objects, Properties & Args",
    authors: ["Poimandres"],
    url: "https://r3f.docs.pmnd.rs/api/objects",
    note: {
      vi: "Mục \"Disposal\" trên trang này xác nhận R3F tự gọi .dispose() cho object JSX tạo ra khi unmount — nguồn cho phần \"Bằng chứng\" của bài.",
      en: "The \"Disposal\" section on this page confirms R3F calls .dispose() on JSX-created objects on unmount — the source behind this lesson's \"Proof\" section.",
    },
  },
  {
    id: "react-dev-preserving-resetting-state",
    type: "article",
    title: "React Docs — Preserving and Resetting State",
    authors: ["React Team"],
    url: "https://react.dev/learn/preserving-and-resetting-state",
    note: {
      vi: "Giải thích key quyết định identity của một node trong cây React thế nào — cơ chế y hệt bài này áp dụng cho danh sách mesh, chỉ đổi target từ DOM sang Three.js.",
      en: "Explains exactly how a key decides a node's identity in the React tree — the identical mechanism this lesson applies to mesh lists, just with Three.js instead of the DOM as the target.",
    },
  },
  {
    id: "overreacted-react-as-ui-runtime",
    type: "article",
    title: "React as a UI Runtime",
    authors: ["Dan Abramov"],
    url: "https://overreacted.io/react-as-a-ui-runtime/",
    note: {
      vi: "Bài viết giải thích tách bạch reconciler và renderer trong kiến trúc React nói chung — nền tảng khái niệm cho việc react-dom và @react-three/fiber chỉ là hai renderer khác nhau trên cùng một reconciler.",
      en: "Explains the reconciler/renderer split in React's architecture generally — the conceptual foundation for why react-dom and @react-three/fiber are just two different renderers on the same reconciler.",
    },
  },
];
