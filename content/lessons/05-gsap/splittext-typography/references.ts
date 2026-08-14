import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "gsap-3-13-release-notes",
    type: "article",
    title: "GSAP 3.13 Release Notes — Free Plugins & SplitText Rewrite",
    authors: ["GSAP (Webflow)"],
    url: "https://gsap.com/blog/3-13/",
    note: {
      vi: "Thông báo chính thức: Webflow mua GreenSock, mọi plugin bonus (SplitText, Flip, MorphSVG...) miễn phí kể cả dùng thương mại, kèm SplitText viết lại hoàn toàn — nguồn cho tuyên bố 'miễn phí từ 3.13' đầu bài.",
      en: "The official announcement: Webflow acquired GreenSock, every bonus plugin (SplitText, Flip, MorphSVG...) became free even for commercial use, alongside a full SplitText rewrite — the source behind this lesson's opening 'free since 3.13' claim.",
    },
  },
  {
    id: "gsap-splittext-docs",
    type: "article",
    title: "GSAP Docs — SplitText Plugin",
    authors: ["GSAP (Webflow)"],
    url: "https://gsap.com/docs/v3/Plugins/SplitText/",
    note: {
      vi: "Tài liệu chính thức của bản 3.15 đang cài trong dự án: đầy đủ config type/mask/aria/autoSplit — tra cứu khi cần một option chưa nhắc tới trong bài.",
      en: "The official docs for the 3.15 release installed in this project: full type/mask/aria/autoSplit config reference — check here for any option this lesson doesn't cover.",
    },
  },
  {
    id: "unicode-tr15-normalization",
    type: "spec",
    title: "Unicode Standard Annex #15 — Unicode Normalization Forms",
    authors: ["Unicode Consortium"],
    url: "https://unicode.org/reports/tr15/",
    note: {
      vi: "Nguồn chuẩn giải thích NFC/precomposed character — cơ sở cho khẳng định dấu tiếng Việt là một code point duy nhất, không bị rơi dấu khi split theo chars.",
      en: "The authoritative source explaining NFC/precomposed characters — the basis for this lesson's claim that Vietnamese diacritics are single code points that survive char-splitting intact.",
    },
  },
];
