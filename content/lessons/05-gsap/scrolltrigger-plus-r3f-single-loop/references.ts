import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "gsap-ticker-docs",
    type: "article",
    title: "GSAP Docs — gsap.ticker",
    authors: ["GreenSock"],
    url: "https://gsap.com/docs/v3/GSAP/gsap.ticker/",
    note: {
      vi: "Tài liệu chính thức về gsap.ticker — bộ lập lịch trung tâm đứng sau mọi tween/timeline/ScrollTrigger, và là nơi anti-pattern của bài này đăng ký nhầm một render loop thứ hai.",
      en: "The official docs for gsap.ticker — the central scheduler behind every tween/timeline/ScrollTrigger, and exactly where this lesson's anti-pattern mistakenly registers a second render loop.",
    },
  },
  {
    id: "gsap-scrolltrigger-docs",
    type: "article",
    title: "GSAP Docs — ScrollTrigger",
    authors: ["GreenSock"],
    url: "https://gsap.com/docs/v3/Plugins/ScrollTrigger/",
    note: {
      vi: "Tài liệu API đầy đủ của ScrollTrigger, bao gồm scrub, onUpdate và scrollerProxy — tra cứu khi cần cấu hình vượt ngoài phạm vi demo của bài này.",
      en: "The full ScrollTrigger API reference, including scrub, onUpdate and scrollerProxy — the place to look when configuration needs go beyond this lesson's demo.",
    },
  },
  {
    id: "gsap-scrolltrigger-mistakes",
    type: "article",
    title: "GSAP — ScrollTrigger Mistakes to Avoid",
    authors: ["GreenSock"],
    url: "https://gsap.com/resources/st-mistakes/",
    note: {
      vi: "Danh sách lỗi ScrollTrigger phổ biến nhất do chính đội GreenSock tổng hợp — bổ sung góc nhìn thực chiến cho quy tắc single-render-loop của bài này.",
      en: "GreenSock's own roundup of the most common ScrollTrigger mistakes — a real-world complement to this lesson's single-render-loop rule.",
    },
  },
  {
    id: "r3f-scaling-performance",
    type: "article",
    title: "React Three Fiber Docs — Scaling Performance (on-demand rendering)",
    authors: ["Poimandres"],
    url: "https://r3f.docs.pmnd.rs/advanced/scaling-performance",
    note: {
      vi: "Giải thích frameloop=\"demand\" và invalidate() từ chính tài liệu R3F — cơ chế mà callback onUpdate của ScrollTrigger trong bài này dựa vào.",
      en: "Explains frameloop=\"demand\" and invalidate() straight from the R3F docs — the exact mechanism this lesson's ScrollTrigger onUpdate callback relies on.",
    },
  },
];
