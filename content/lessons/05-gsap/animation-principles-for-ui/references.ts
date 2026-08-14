import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "wikipedia-12-principles",
    type: "article",
    title: "Twelve Basic Principles of Animation",
    url: "https://en.wikipedia.org/wiki/Twelve_basic_principles_of_animation",
    note: {
      vi: "Tóm tắt đầy đủ 12 nguyên tắc gốc từ 'The Illusion of Life' của Johnston & Thomas — nguồn cho anticipation, follow-through, secondary motion, squash & stretch, slow-in/slow-out và staging trong bài.",
      en: "A full summary of the 12 original principles from Johnston & Thomas's 'The Illusion of Life' — the source for this lesson's anticipation, follow-through, secondary motion, squash & stretch, slow-in/slow-out and staging.",
    },
  },
  {
    id: "illusion-of-life-book",
    type: "book",
    title: "The Illusion of Life: Disney Animation",
    authors: ["Frank Thomas", "Ollie Johnston"],
    year: 1981,
    note: {
      vi: "Sách gốc định nghĩa 12 nguyên tắc — không có bản online chính thức, liệt kê ở đây như tài liệu tham khảo bổ sung, không phải nguồn kiểm chứng trực tuyến được.",
      en: "The original book that defined the 12 principles — no official online edition, listed here as a supplementary reference rather than a verifiable online source.",
    },
  },
  {
    id: "material-design-motion-tokens",
    type: "article",
    title: "Easing and Duration — Material Design 3",
    authors: ["Google"],
    url: "https://m3.material.io/styles/motion/easing-and-duration/tokens-specs",
    note: {
      vi: "Bộ token easing/duration chính thức của Material Design 3 — một cách diễn giải hiện đại, có tên gọi riêng, của cùng các nguyên tắc slow-in/slow-out và staging trong bài.",
      en: "Material Design 3's official easing/duration token set — a modern, differently-named restatement of this lesson's slow-in/slow-out and staging principles.",
    },
  },
  {
    id: "apple-hig-motion",
    type: "article",
    title: "Motion — Human Interface Guidelines",
    authors: ["Apple"],
    url: "https://developer.apple.com/design/human-interface-guidelines/motion",
    note: {
      vi: "Hướng dẫn chính thức của Apple: 'giữ animation ngắn và chính xác', 'tránh chuyển động thừa cho thao tác lặp lại' — trùng khớp trực tiếp với Lỗi hay gặp #1 của bài.",
      en: "Apple's official guidance: 'keep animations brief and precise,' 'avoid excessive motion for frequent interactions' — directly matching this lesson's mistake #1.",
    },
  },
  {
    id: "nngroup-animation-duration",
    type: "article",
    title: "Executing UX Animations: Duration and Motion Characteristics",
    authors: ["Nielsen Norman Group"],
    url: "https://www.nngroup.com/articles/animation-duration/",
    note: {
      vi: "Nguồn số liệu chính cho phần 'Thang thời gian cho UI' — dải 100-500ms dựa trên nghiên cứu Model Human Processor, bài này chỉ chia lại thành ba nhóm thực dụng và ước lượng riêng mốc hero 700ms.",
      en: "The primary source for the 'Timing Scales for UI' section — the 100-500ms range is grounded in Model Human Processor research; this lesson only regroups it into three practical bands and estimates the 700ms hero ceiling independently.",
    },
  },
  {
    id: "mdn-prefers-reduced-motion",
    type: "article",
    title: "prefers-reduced-motion",
    authors: ["MDN Web Docs"],
    url: "https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion",
    note: {
      vi: "Đặc tả chính thức của media feature này, bao gồm lý do accessibility (vestibular disorder) bài này nhắc tới — đọc kỹ trước khi cho rằng đây chỉ là một tuỳ chọn thẩm mỹ.",
      en: "The official spec for this media feature, including the accessibility rationale (vestibular disorders) this lesson cites — read before assuming it's just an aesthetic toggle.",
    },
  },
  {
    id: "gsap-matchmedia",
    type: "article",
    title: "gsap.matchMedia()",
    authors: ["GreenSock"],
    url: "https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/",
    note: {
      vi: "Tài liệu chính thức của API dùng trong ví dụ code reduced-motion của bài — giải thích cách các animation tạo bên trong tự động revert khi điều kiện media query hết khớp.",
      en: "The official docs for the API used in this lesson's reduced-motion code example — explains how animations created inside auto-revert once the media query stops matching.",
    },
  },
];
