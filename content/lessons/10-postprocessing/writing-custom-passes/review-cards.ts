import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "fullscreen-triangle",
    q: {
      vi: "`FullScreenQuad` của three thật ra vẽ một tam giác lớn duy nhất với các đỉnh $(-1, 3)$, $(-1, -1)$, $(3, -1)$. Vì sao không dùng hai tam giác ghép thành hình vuông?",
      en: "three's `FullScreenQuad` actually draws a single oversized triangle with vertices $(-1, 3)$, $(-1, -1)$, $(3, -1)$. Why not two triangles forming a quad?",
    },
    a: {
      vi: "Hai tam giác của một quad chung một đường chéo, mà GPU tô pixel theo khối 2×2: mọi khối vắt qua đường chéo đó bị tô cho cả hai tam giác, phí công fragment suốt chiều dài đường chéo. Một tam giác lớn duy nhất (phần thừa bị clip) không có cạnh bên trong. Việc bớt đỉnh, 3 thay vì 4, không đáng kể.",
      en: "A quad's two triangles share a diagonal, and the GPU shades pixels in 2×2 blocks: every block straddling that diagonal is shaded for both triangles, wasting fragment work along its whole length. One oversized triangle (the excess is clipped) has no internal edge. The vertex saving, 3 instead of 4, is negligible.",
    },
  },
  {
    id: "when-to-subclass-pass",
    q: {
      vi: "Khi nào đáng viết một lớp con của `Pass` thay vì chỉ `new ShaderPass(shader)`?",
      en: "When is subclassing `Pass` worth it over a plain `new ShaderPass(shader)`?",
    },
    a: {
      vi: "Khi hiệu ứng cần nhiều render target nội bộ (blur tách ngang/dọc), cần những bước render không phải quad toàn màn hình (như `RenderPass` render cả scene), hoặc phải ghi vào chỗ khác `writeBuffer` — như `UnrealBloomPass` blend ngược vào `readBuffer` và đặt `needsSwap = false`. Hiệu ứng một input, một output thì `ShaderPass` là đủ.",
      en: "When the effect needs several internal render targets (a separable horizontal/vertical blur), render steps that aren't a fullscreen quad (as `RenderPass` renders a whole scene), or has to write somewhere other than `writeBuffer` — as `UnrealBloomPass` blends back into `readBuffer` and sets `needsSwap = false`. A single-input, single-output effect is fine as a `ShaderPass`.",
    },
  },
];
