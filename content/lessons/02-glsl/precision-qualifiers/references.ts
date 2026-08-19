import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "khronos-glsl-es-3.00-spec-precision",
    type: "spec",
    title: "The OpenGL ES Shading Language, Version 3.00 — §4.5 Precision and Precision Qualifiers",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/OpenGL/specs/es/3.0/GLSL_ES_Specification_3.00.pdf",
    note: {
      vi: "Nguồn chuẩn định nghĩa 3 precision qualifier và bảng số sàn tối thiểu (§4.5, §4.5.1: range và relative precision cho highp/mediump/lowp) — mọi con số trong bài này bắt nguồn từ đây.",
      en: "The authoritative source defining the 3 precision qualifiers and their minimum-floor table (§4.5, §4.5.1: range and relative precision for highp/mediump/lowp) — every number in this lesson traces back to this document.",
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
      vi: "Đo sàn precision thời ES 2.0/ESSL 1.00 (highp ≥16-bit, mediump ≥10-bit mantissa) từ góc nhìn kỹ sư GPU thật — hữu ích cho câu chuyện mediump/FP16; sàn highp của ES 3.00 đã là binary32.",
      en: "Benchmarks the ES 2.0/ESSL 1.00-era precision floors (highp ≥16-bit, mediump ≥10-bit mantissa) from a real GPU engineer's perspective — useful for the mediump/FP16 story; ES 3.00's highp floor is already binary32.",
    },
  },
];
