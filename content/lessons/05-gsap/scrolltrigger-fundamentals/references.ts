import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "gsap-scrolltrigger-docs",
    type: "article",
    title: "ScrollTrigger | GSAP Docs",
    authors: ["GSAP (Webflow)"],
    url: "https://gsap.com/docs/v3/Plugins/ScrollTrigger/",
    note: {
      vi: "Tài liệu chính thức của ScrollTrigger — nguồn chuẩn cho toàn bộ cú pháp start/end, scrub, pin, toggleActions và snap dùng xuyên suốt bài.",
      en: "The official ScrollTrigger docs — the canonical source for the start/end syntax, scrub, pin, toggleActions and snap used throughout this lesson.",
    },
  },
  {
    id: "gsap-st-mistakes",
    type: "article",
    title: "Common ScrollTrigger Mistakes",
    authors: ["GSAP (Webflow)"],
    url: "https://gsap.com/resources/st-mistakes/",
    note: {
      vi: "Danh sách lỗi thường gặp chính thức từ đội ngũ GSAP — nền cho phần Callout lỗi hay gặp của bài này (thiếu scroller, quên refresh, toggleActions sai độ dài).",
      en: "The official common-mistakes list from the GSAP team — the basis for this lesson's mistake Callout (missing scroller, forgetting refresh, wrong-length toggleActions).",
    },
  },
  {
    id: "chrome-dev-scroll-driven-animations",
    type: "article",
    title: "Scroll-driven animations",
    authors: ["Chrome for Developers"],
    url: "https://developer.chrome.com/docs/css-ui/scroll-driven-animations/",
    note: {
      vi: "Góc nhìn đối chiếu: cách trình duyệt chuẩn hoá scrub/timeline theo scroll bằng CSS thuần (animation-timeline) — cùng bài toán ScrollTrigger giải quyết bằng JS.",
      en: "A useful contrast: how browsers now standardize scroll-driven scrub/timelines in pure CSS (animation-timeline) — the same problem ScrollTrigger solves in JS.",
    },
  },
  {
    id: "mdn-getboundingclientrect",
    type: "article",
    title: "Element: getBoundingClientRect() method",
    url: "https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect",
    note: {
      vi: "Cơ chế nền của phép tính start/end: ScrollTrigger đo vị trí trigger so với scroller bằng đúng API này rồi quy đổi ra mốc pixel cố định.",
      en: "The underlying mechanism behind start/end math: ScrollTrigger measures the trigger's position relative to the scroller with exactly this API, then converts it into fixed pixel markers.",
    },
  },
];
