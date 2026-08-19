import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "webdev-compositor-only-properties",
    type: "article",
    title: "Stick to Compositor-Only Properties and Manage Layer Count",
    authors: ["web.dev"],
    url: "https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count",
    note: {
      vi: "Nguồn gốc của khuyến nghị 'chỉ animate transform/opacity' — giải thích chính xác vì sao hai thuộc tính này bỏ qua layout và paint, kèm cảnh báo về chi phí quản lý quá nhiều layer.",
      en: "The origin of the 'only animate transform/opacity' advice — explains precisely why these two properties skip layout and paint, plus a warning about the cost of managing too many layers.",
    },
  },
  {
    id: "csstriggers",
    type: "article",
    title: "CSS Triggers",
    authors: ["Paul Lewis", "Paul Irish"],
    url: "https://csstriggers.com/",
    note: {
      vi: "Bảng tra cứu thuộc tính CSS nào kích hoạt layout, paint hay chỉ composite — đúng bảng phân loại ba nhóm dùng trong bài này.",
      en: "The lookup table for which CSS properties trigger layout, paint, or composite-only — the exact three-group classification this lesson uses.",
    },
  },
  {
    id: "chrome-devtools-performance",
    type: "article",
    title: "Analyze Runtime Performance — Chrome DevTools",
    authors: ["Chrome DevTools team"],
    url: "https://developer.chrome.com/docs/devtools/performance/",
    note: {
      vi: "Hướng dẫn chính thức đọc tab Performance — track Main, thanh Recalculate Style/Layout, và cách đọc biểu đồ FPS để bắt frame vượt ngân sách.",
      en: "The official guide to reading the Performance tab — the Main track, Recalculate Style/Layout bars, and how to read the FPS chart to catch over-budget frames.",
    },
  },
  {
    id: "mdn-will-change",
    type: "article",
    title: "will-change — CSS: Cascading Style Sheets | MDN",
    authors: ["MDN Web Docs"],
    url: "https://developer.mozilla.org/en-US/docs/Web/CSS/will-change",
    note: {
      vi: "Tài liệu chuẩn cho will-change, bao gồm cảnh báo chính thức của MDN về việc lạm dụng gây tốn bộ nhớ GPU — không nên áp dụng tràn lan cho nhiều phần tử.",
      en: "The canonical will-change reference, including MDN's own warning about overuse costing GPU memory — it should never be applied broadly across many elements.",
    },
  },
  {
    id: "gsap-cssplugin-force3d",
    type: "article",
    title: "CSSPlugin | GSAP Docs — force3D config",
    authors: ["GSAP (Webflow)"],
    url: "https://gsap.com/docs/v3/GSAP/CorePlugins/CSS",
    note: {
      vi: "Tài liệu chính thức của CSSPlugin, mục force3D — giải thích rõ hành vi mặc định 'auto' và khi nào GSAP tự thêm translateZ(0) để ép layer promotion.",
      en: "CSSPlugin's official docs, the force3D section — spells out the default 'auto' behavior and exactly when GSAP adds translateZ(0) on its own to force layer promotion.",
    },
  },
];
