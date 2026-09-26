import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "why-tile-based",
    q: {
      vi: "Vì sao GPU di động chọn kiến trúc tile-based thay vì vẽ thẳng vào framebuffer như GPU desktop kiểu immediate-mode?",
      en: "Why do mobile GPUs use a tile-based architecture instead of painting straight into the framebuffer like an immediate-mode desktop GPU?",
    },
    a: {
      vi: "Vì pin: đọc/ghi DRAM ngoài chip tốn năng lượng gấp nhiều lần SRAM trên chip. GPU tile chia màn hình thành ô nhỏ (Mali: 16×16 px), vẽ trọn từng ô trong khi color/depth/stencil của ô nằm hết trong bộ nhớ trên chip, rồi ghi kết quả ra framebuffer ngoài đúng một lần.",
      en: "Battery: reading or writing off-chip DRAM costs many times the energy of on-chip SRAM. A tile GPU splits the screen into small tiles (Mali: 16×16 px), draws each tile completely while its color/depth/stencil stays in on-chip memory, then writes the result out to the external framebuffer exactly once.",
    },
  },
  {
    id: "discard-still-runs-the-shader",
    q: {
      vi: "Dùng `alphaTest`/`discard` để lá cây \"đục\": rẻ hơn alpha blending, nhưng vì sao vẫn đắt hơn geometry đục thật?",
      en: "Using `alphaTest`/`discard` to make foliage \"opaque\" is cheaper than alpha blending — so why is it still more expensive than truly opaque geometry?",
    },
    a: {
      vi: "Fragment sống hay bị bỏ chỉ biết được SAU khi shader của nó chạy, nên mọi pixel quad lá phủ lên đều phải tô, kể cả những pixel rốt cuộc bị `discard`. Bề mặt cũng chưa ghi được depth (hay đưa vào HSR/FPK) trước lúc đó, nên không che bớt được thứ phía sau trước khi tô như geometry đục. `discard` tiết kiệm phần ghi màu/blend, không tiết kiệm thời gian chạy shader.",
      en: "Whether a fragment survives is only known after its shader runs, so every pixel the leaf quad covers gets shaded, including the ones that end up discarded. The surface also can't write depth (or feed HSR/FPK) until then, so it can't hide what lies behind it ahead of shading the way opaque geometry does. `discard` saves the color write/blend, not shader time.",
    },
  },
  {
    id: "overdraw-heatmap",
    q: {
      vi: "Không có API WebGL nào trả về \"hệ số overdraw\". Làm sao nhìn thấy nó bằng mắt?",
      en: "No WebGL API returns an \"overdraw factor\". How can you see it with your own eyes?",
    },
    a: {
      vi: "Vẽ lại cảnh với mọi material đổi thành màu trắng alpha thấp và blending cộng (additive). Mỗi lần một pixel được vẽ thêm lại cộng thêm chút sáng: vẽ một lần ra xám nhạt, năm lần gần trắng — độ sáng chính là bản đồ nhiệt overdraw.",
      en: "Redraw the scene with every material swapped for a fixed low-alpha white and additive blending. Each extra time a pixel is drawn adds a bit more light: drawn once comes out faint gray, five times nearly white — the brightness is the overdraw heatmap.",
    },
  },
];
