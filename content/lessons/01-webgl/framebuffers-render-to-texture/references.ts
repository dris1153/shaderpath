import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "mdn-checkframebufferstatus",
    type: "article",
    title: "WebGLRenderingContext: checkFramebufferStatus() method",
    authors: ["MDN Contributors"],
    url: "https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/checkFramebufferStatus",
    note: {
      vi: "Liệt kê đầy đủ các mã trạng thái completeness và ý nghĩa từng mã — tra khi checkFramebufferStatus trả về giá trị không phải FRAMEBUFFER_COMPLETE.",
      en: "Lists every completeness status code and what each means — check here whenever checkFramebufferStatus returns anything other than FRAMEBUFFER_COMPLETE.",
    },
  },
  {
    id: "mdn-framebuffertexture2d",
    type: "article",
    title: "WebGLRenderingContext: framebufferTexture2D() method",
    authors: ["MDN Contributors"],
    url: "https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/framebufferTexture2D",
    note: {
      vi: "Tài liệu tham chiếu chính xác các tham số attachment (COLOR_ATTACHMENT0, textarget, level) dùng trong bài.",
      en: "The precise reference for the attachment parameters (COLOR_ATTACHMENT0, textarget, level) used in this lesson.",
    },
  },
  {
    id: "webgl2fundamentals-render-to-texture",
    type: "article",
    title: "WebGL2 Fundamentals — Render to Texture",
    authors: ["Gregg Tavares"],
    url: "https://webgl2fundamentals.org/webgl/lessons/webgl-render-to-texture.html",
    note: {
      vi: "Ví dụ 2-pass đầy đủ kèm giải thích vì sao viewport phải đổi theo từng pass — cùng chủ đề chính xác với bài này.",
      en: "A full 2-pass example with an explanation of why the viewport must change per pass — the exact same topic as this lesson.",
    },
  },
  {
    id: "khronos-webgl2-spec-fbo",
    type: "spec",
    title: "WebGL 2.0 Specification — Framebuffer Objects",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/webgl/specs/latest/2.0/",
    note: {
      vi: "Nguồn chuẩn định nghĩa chính xác các quy tắc completeness và hành vi của framebufferTexture2D/checkFramebufferStatus.",
      en: "The authoritative source defining the exact completeness rules and the behavior of framebufferTexture2D/checkFramebufferStatus.",
    },
  },
];
