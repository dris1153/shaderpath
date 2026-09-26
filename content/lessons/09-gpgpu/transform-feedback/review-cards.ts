import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "varyings-before-link",
    q: {
      vi: "Vì sao `gl.transformFeedbackVaryings(...)` phải chạy TRƯỚC `gl.linkProgram`, và gọi sau thì sao?",
      en: "Why must `gl.transformFeedbackVaryings(...)` run BEFORE `gl.linkProgram`, and what happens if it runs after?",
    },
    a: {
      vi: "Linker cần biết trước varying nào được capture, theo thứ tự nào, để cấp slot output — giống cách nó cấp location cho attribute. Gọi sau khi link thì layout đã chốt: lời gọi chỉ có hiệu lực ở lần link kế tiếp, còn chương trình hiện tại không ghi output nào, nên `beginTransformFeedback` báo `INVALID_OPERATION`.",
      en: "The linker needs to know which varyings are captured, in what order, to allocate output slots — the way it allocates attribute locations. Called after linking, the layout is already frozen: the call only takes effect at the next link, and the current program records no outputs, so `beginTransformFeedback` fails with `INVALID_OPERATION`.",
    },
  },
  {
    id: "rasterizer-discard-is-global",
    q: {
      vi: "Update pass bật `RASTERIZER_DISCARD`. Nó bỏ qua bước nào, và quên `gl.disable` sau đó thì sao?",
      en: "The update pass enables `RASTERIZER_DISCARD`. What does it skip, and what happens if you forget `gl.disable` afterward?",
    },
    a: {
      vi: "Nó bỏ hẳn rasterize và fragment: vertex shader chạy, ghi output vào buffer, không pixel nào được vẽ. Đó là state toàn cục — quên tắt thì mọi draw call sau đó, kể cả lượt vẽ particle ra màn hình, im lặng không vẽ gì.",
      en: "It drops rasterization and the fragment stage: the vertex shader runs and writes its outputs into buffers, and no pixel is drawn. It is global state — forget to disable it and every later draw call, the on-screen particle draw included, silently draws nothing.",
    },
  },
  {
    id: "no-neighbor-reads",
    q: {
      vi: "Vì sao một attractor nghịch bình phương hợp với transform feedback, còn boids thì cần texture state?",
      en: "Why does an inverse-square attractor suit transform feedback, while boids need texture state?",
    },
    a: {
      vi: "Vertex shader của transform feedback chỉ thấy attribute của đúng particle nó đang xử lý. Attractor chỉ cần vị trí của chính particle; boids cần đọc state của hàng xóm, mà với texture thì một fragment shader chỉ cần lấy mẫu một texel khác là đọc được.",
      en: "A transform feedback vertex shader only sees the attributes of the one particle it is processing. The attractor needs only that particle's own position; boids need their neighbors' state, which a fragment shader gets by simply sampling another texel of the state texture.",
    },
  },
];
