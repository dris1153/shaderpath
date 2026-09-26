import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "jpeg-costs-full-vram",
    q: {
      vi: "Một ảnh JPEG 200KB chiếm bao nhiêu VRAM sau khi upload, so với cùng ảnh ở định dạng nén GPU?",
      en: "How much VRAM does a 200KB JPEG take once uploaded, compared with the same image in a GPU compressed format?",
    },
    a: {
      vi: "Đủ như RGBA8 không nén ($W \\times H \\times 4$ byte, nhân $4/3$ nếu có mipmap): `texImage2D` giải mã JPEG/PNG về RGBA thô trước khi đẩy lên GPU, nên nén JPEG chỉ tiết kiệm băng thông tải. Định dạng nén GPU (S3TC, ETC2, ASTC) giữ nguyên dạng khối nén trong VRAM, GPU giải từng khối khi lấy mẫu — nhỏ hơn RGBA8 khoảng 4–8 lần.",
      en: "The full uncompressed RGBA8 footprint ($W \\times H \\times 4$ bytes, times $4/3$ with mipmaps): `texImage2D` decodes JPEG/PNG back to raw RGBA before pushing it to the GPU, so JPEG only saves download bandwidth. GPU compressed formats (S3TC, ETC2, ASTC) stay in compressed block form inside VRAM, decoded block by block while sampling — roughly 4–8× smaller than RGBA8.",
    },
  },
  {
    id: "info-textures-is-a-count",
    q: {
      vi: "Vì sao `renderer.info.memory.textures` không dùng được để ước lượng ngân sách VRAM, và nó hữu ích vào việc gì?",
      en: "Why can't `renderer.info.memory.textures` be used to estimate a VRAM budget, and what is it good for?",
    },
    a: {
      vi: "Nó đếm số texture đang sống, không đếm byte: texture 256×256 và 4096×4096 đều cộng đúng 1. Nó hữu ích để săn rò rỉ (chỉ giảm khi `dispose()` thật sự được gọi); ngân sách vẫn phải tính bằng kích thước × định dạng × mipmap.",
      en: "It counts live texture objects, not bytes: a 256×256 and a 4096×4096 texture each add exactly 1. It's useful for hunting leaks (it only drops when `dispose()` is actually called); a budget still has to be computed from size × format × mipmaps.",
    },
  },
  {
    id: "render-target-tax",
    q: {
      vi: "Cảnh không có texture nào mà vẫn chiếm hơn 100MB VRAM sau khi bật `EffectComposer` trên canvas 1920×1080 ở DPR 2. Chỗ đó đi đâu?",
      en: "A scene with zero textures still takes over 100MB of VRAM after enabling `EffectComposer` on a 1920×1080 canvas at DPR 2. Where does it go?",
    },
    a: {
      vi: "Vào hai render target ping-pong của `EffectComposer`, mặc định `HalfFloatType` (RGBA 8 byte/texel), kích thước theo buffer vẽ thật 3840×2160: mỗi cái $3840 \\times 2160 \\times 8 \\approx 63.3$ MB, cả cặp ≈ 126.6 MB, chỉ riêng phần màu. Pass nặng như bloom còn tự cấp thêm chuỗi render target của nó.",
      en: "Into `EffectComposer`'s two ping-pong render targets, `HalfFloatType` by default (RGBA, 8 bytes/texel), sized to the real 3840×2160 drawing buffer: each costs $3840 \\times 2160 \\times 8 \\approx 63.3$ MB, the pair ≈ 126.6 MB, counting color alone. A heavy pass like bloom allocates its own chain of render targets on top.",
    },
  },
];
