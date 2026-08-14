import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "gsap-docs-easing",
    type: "article",
    title: "Easing",
    authors: ["GreenSock"],
    url: "https://gsap.com/resources/getting-started/Easing/",
    note: {
      vi: "Nguồn chính thức cho các họ ease dựng sẵn (power/sine/expo/back/elastic/bounce) và ba biến thể in/out/inOut mà bảng tra nhanh trong bài này tóm tắt lại.",
      en: "The official source for the built-in ease families (power/sine/expo/back/elastic/bounce) and the in/out/inOut variants this lesson's guideline table summarizes.",
    },
  },
  {
    id: "gsap-docs-customease",
    type: "article",
    title: "CustomEase",
    authors: ["GreenSock"],
    url: "https://gsap.com/docs/v3/Eases/CustomEase/",
    note: {
      vi: "Tài liệu cho plugin CustomEase — cú pháp path SVG/cubic-bezier dùng trong CustomEase.create(), bao gồm cách chuyển một cubic-bezier() CSS bốn số sang path.",
      en: "The CustomEase plugin reference — the SVG path/cubic-bezier syntax used in CustomEase.create(), including how to convert a four-number CSS cubic-bezier() into a path.",
    },
  },
  {
    id: "gsap-ease-visualizer",
    type: "article",
    title: "Ease Visualizer",
    authors: ["GreenSock"],
    url: "https://gsap.com/community/ease-visualizer/",
    note: {
      vi: "Công cụ chính thức để vẽ và thử mọi ease dựng sẵn lẫn CustomEase trực quan — cách nhanh nhất để \"nghe\" một đường cong trước khi gõ tên ease vào code.",
      en: "The official tool for drawing and previewing every built-in ease and CustomEase visually — the fastest way to \"hear\" a curve before typing its name into code.",
    },
  },
  {
    id: "easings-net-back",
    type: "article",
    title: "easings.net — easeOutBack reference curve",
    url: "https://easings.net/#easeOutBack",
    note: {
      vi: "Nguồn cho cặp control point cubic-bezier (0.34, 1.56, 0.64, 1) của easeOutBack dùng làm ví dụ CustomEase trong bài — tra cứu nhanh hình dạng/độ vọt của các ease chuẩn không thuộc GSAP.",
      en: "The source for easeOutBack's cubic-bezier control points (0.34, 1.56, 0.64, 1), used as this lesson's CustomEase example — a quick reference for the shape/overshoot of standard eases outside GSAP's own set.",
    },
  },
];
