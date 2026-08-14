import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "khronos-glsl-es-3.00-spec-precision",
    type: "spec",
    title: "The OpenGL ES Shading Language, Version 3.00 — §4.5 Precision and Precision Qualifiers",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/OpenGL/specs/es/3.0/GLSL_ES_Specification_3.00.pdf",
    note: {
      vi: "Nguồn chuẩn định nghĩa 3 precision qualifier và bảng số sàn tối thiểu (§4.5, Bảng 4.7: range và relative precision cho highp/mediump/lowp) — mọi con số trong bài này bắt nguồn từ đây.",
      en: "The authoritative source defining the 3 precision qualifiers and their minimum-floor table (§4.5, Table 4.7: range and relative precision for highp/mediump/lowp) — every number in this lesson traces back to this document.",
    },
  },
  {
    id: "webgl2fundamentals-precision-issues",
    type: "article",
    title: "WebGL2 Fundamentals — WebGL2 Precision Issues",
    authors: ["Gregg Tavares"],
    url: "https://webgl2fundamentals.org/webgl/lessons/webgl-precision-issues.html",
    note: {
      vi: "Giải thích thực dụng vì sao desktop GPU thường âm thầm nâng mediump/lowp lên full float, khiến bug precision chỉ lộ ra khi test trên thiết bị mobile thật.",
      en: "A practical explanation of why desktop GPUs often silently promote mediump/lowp to full float, so precision bugs only surface when testing on real mobile hardware.",
    },
  },
  {
    id: "arm-benchmarking-float-precision-mobile-gpus",
    type: "article",
    title: "Arm Community — Benchmarking Floating-Point Precision in Mobile GPUs",
    authors: ["Arm"],
    url: "https://developer.arm.com/community/arm-community-blogs/b/mobile-graphics-and-gaming-blog/posts/benchmarking-floating-point-precision-in-mobile-gpus",
    note: {
      vi: "Xác nhận con số mantissa/exponent tối thiểu của highp (≥16-bit mantissa) và mediump (≥10-bit mantissa) từ góc nhìn kỹ sư GPU thật, không chỉ diễn giải lại đặc tả.",
      en: "Confirms the minimum mantissa/exponent bit counts for highp (≥16-bit mantissa) and mediump (≥10-bit mantissa) from a real GPU engineer's perspective, not just a paraphrase of the spec.",
    },
  },
];
