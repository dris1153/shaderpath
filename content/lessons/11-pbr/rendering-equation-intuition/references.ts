import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "kajiya-1986-rendering-equation",
    type: "paper",
    title: "The Rendering Equation",
    authors: ["James T. Kajiya"],
    year: 1986,
    url: "https://dl.acm.org/doi/10.1145/15886.15902",
    note: {
      vi: "Bài báo gốc dựng ra chính phương trình bài này giảng — SIGGRAPH '86, ACM SIGGRAPH Computer Graphics 20(4). Đọc phần đầu để thấy Kajiya trình bày rendering equation như một khung tổng quát gộp mọi model ánh sáng đã có, không phải một kỹ thuật mới đứng riêng.",
      en: "The original paper that derives the very equation this lesson teaches — SIGGRAPH '86, ACM SIGGRAPH Computer Graphics 20(4). Read the opening sections to see Kajiya frame the rendering equation as a unifying model subsuming every prior lighting technique, not a standalone new trick.",
    },
  },
  {
    id: "pbr-book-light-transport-equation",
    type: "book",
    title: "Physically Based Rendering, 4th ed. — 13.1 The Light Transport Equation",
    authors: ["Matt Pharr", "Wenzel Jakob", "Greg Humphreys"],
    url: "https://pbr-book.org/4ed/Light_Transport_I_Surface_Reflection/The_Light_Transport_Equation",
    note: {
      vi: "Bản trình bày rigorous và miễn phí của cùng phương trình, viết cho người thực sự cài đặt path tracer — đọc để thấy cách sách này xử lý số hạng đệ quy (Li = Lo của bề mặt khác) bằng ký hiệu toán tử tích phân, khớp với phần 'vì sao real-time không giải chính xác' của bài này.",
      en: "A free, rigorous treatment of the same equation written for people actually implementing a path tracer — read it to see how the book formalizes the recursive term (Li = another surface's Lo) using integral-operator notation, matching this lesson's 'why real-time can't solve it exactly' section.",
    },
  },
  {
    id: "learnopengl-pbr-theory",
    type: "article",
    title: "PBR Theory",
    authors: ["Joey de Vries"],
    url: "https://learnopengl.com/PBR/Theory",
    note: {
      vi: "Bài viết thực dụng nối thẳng rendering equation với code GLSL thật — dùng để kiểm chứng cách viết lại phương trình dưới dạng tổng rời rạc qua N đèn điểm mà bài học và demo này dùng.",
      en: "A hands-on article that connects the rendering equation directly to real GLSL code — useful for cross-checking the discrete N-point-light sum rewrite this lesson and its demo rely on.",
    },
  },
  {
    id: "book-real-time-rendering-4th",
    type: "book",
    title: "Real-Time Rendering, 4th Edition — Chapter 9: Physically Based Shading",
    authors: ["Tomas Akenine-Möller", "Eric Haines", "Naty Hoffman", "Angelo Pesce", "Michał Iwanicki", "Sébastien Hillaire"],
    year: 2018,
    note: {
      vi: "Chương 9 mở đầu đúng bằng rendering equation của Kajiya trước khi đi vào BRDF thực tế — sách in, không có bản online miễn phí hợp pháp, liệt kê ở đây như tài liệu bổ sung cho người muốn đào sâu hơn bài học.",
      en: "Chapter 9 opens with exactly Kajiya's rendering equation before moving into practical BRDFs — a print book with no legitimate free online copy, listed here as supplementary reading for anyone wanting to go deeper than this lesson.",
    },
  },
];
