import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "rgbe-shared-exponent",
    q: {
      vi: "Định dạng RGBE (`.hdr`) nhét một pixel HDR vào 4 byte bằng cách nào, và đổi lại mất gì?",
      en: "How does the RGBE (`.hdr`) format fit an HDR pixel into 4 bytes, and what does it give up?",
    },
    a: {
      vi: "Ba byte mantissa cho R, G, B cộng MỘT byte số mũ dùng chung: $c = \\text{mantissa} \\times 2^{(e-128)}/255$. Trên đĩa chỉ 4 byte mỗi pixel như RGBA8, nhưng ba kênh chịu chung một số mũ nên độ chính xác màu khá thô. Phần tiết kiệm dừng ở file: `HDRLoader` của three bung nó ra RGBA half-float (8 byte/texel, mặc định) hoặc float (16 byte). OpenEXR lưu từng kênh riêng, thường là half-float: chính xác hơn, file nặng hơn.",
      en: "Three mantissa bytes for R, G, B plus ONE shared exponent byte: $c = \\text{mantissa} \\times 2^{(e-128)}/255$. On disk that's 4 bytes a pixel, like RGBA8, but all three channels share one exponent, so color precision is fairly coarse. The saving stops at the file: three's `HDRLoader` expands it to half-float RGBA (8 bytes/texel, the default) or float (16). OpenEXR stores each channel separately, usually as half-float: more precise, larger files.",
    },
  },
  {
    id: "hdr-texture-is-linear",
    q: {
      vi: "Vì sao texture từ `HDRLoader` mang `LinearSRGBColorSpace` chứ không phải `SRGBColorSpace` như ảnh màu thường?",
      en: "Why does a texture from `HDRLoader` carry `LinearSRGBColorSpace` rather than `SRGBColorSpace` like an ordinary color image?",
    },
    a: {
      vi: "Dữ liệu HDR đã là radiance tuyến tính — năng lượng ánh sáng thật — không phải màu hiển thị đã mã hoá gamma, nên không có gì để giải mã. Gắn nhãn sRGB là khai sai, và trong three 0.185 nó cũng không có tác dụng: chỉ texture RGBA 8-bit mới được phần cứng giải mã sRGB, nên texture half-float gắn nhãn sRGB vẫn được lấy mẫu nguyên giá trị, kèm một cảnh báo từ `WebGLTextures`.",
      en: "HDR data is already linear radiance — actual light energy — not gamma-encoded display color, so there's nothing to decode. An sRGB tag would be wrong metadata, and in three 0.185 it can't even take effect: only 8-bit RGBA textures get the hardware sRGB decode, so a half-float texture tagged sRGB is sampled unchanged, with a warning from `WebGLTextures`.",
    },
  },
  {
    id: "exposure-vs-light-intensity",
    q: {
      vi: "Tăng `toneMappingExposure` và tăng `intensity` của một đèn đều làm cảnh sáng hơn. Khác nhau ở đâu?",
      en: "Raising `toneMappingExposure` and raising one light's `intensity` both brighten the scene. How do they differ?",
    },
    a: {
      vi: "Exposure là một phép nhân đều cho cả cảnh, trước tone mapping — tỉ lệ giữa các nguồn sáng giữ nguyên. Tăng `intensity` một đèn làm đèn đó sáng hơn TƯƠNG ĐỐI so với các nguồn khác, nên đổi cả tương phản lẫn cách đổ bóng.",
      en: "Exposure is one multiplier applied evenly to the whole scene before tone mapping — the ratios between light sources stay fixed. Raising one light's `intensity` makes that light brighter RELATIVE to the others, so it changes contrast and shadow behavior too.",
    },
  },
];
