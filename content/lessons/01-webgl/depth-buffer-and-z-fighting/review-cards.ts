import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "painters-algorithm-cycle",
    q: {
      vi: "Vẽ từ xa tới gần (painter's algorithm) thất bại ở trường hợp nào mà không sort nào cứu được, và depth buffer tránh nó thế nào?",
      en: "In what case does drawing far to near (the painter's algorithm) fail in a way no sort can fix, and how does a depth buffer avoid it?",
    },
    a: {
      vi: "Ba tam giác che vòng nhau: A che một phần B, B che C, C che A — không có thứ tự vẽ nào đúng cho cả ba, vì che khuất khác nhau ở từng vùng chồng lấn. Depth buffer quyết định ở cấp pixel: mỗi pixel giữ fragment gần nhất, không phụ thuộc thứ tự vẽ.",
      en: "Three triangles overlapping in a cycle: A covers part of B, B covers C, C covers A — no drawing order is right for all three, because occlusion differs in each overlap. A depth buffer decides per pixel: each pixel keeps the nearest fragment, whatever the drawing order.",
    },
  },
  {
    id: "forgot-depth-clear",
    q: {
      vi: "Mỗi frame, cảnh được vẽ vào một FBO có depth attachment, với `depthFunc` mặc định `LESS`. Frame đầu đúng, từ frame thứ hai vật biến mất. Thiếu cờ gì trong `gl.clear`, và vì sao nó gây ra đúng hiện tượng này?",
      en: "Every frame the scene is drawn into an FBO with a depth attachment, with the default `depthFunc` of `LESS`. The first frame is right; from the second on the object disappears. Which flag is missing from `gl.clear`, and why does it cause exactly this?",
    },
    a: {
      vi: "`gl.DEPTH_BUFFER_BIT`. Depth của frame trước vẫn còn; fragment mới ở cùng chỗ bị so với depth cũ của chính nó; bằng nhau thì không “nhỏ hơn”, nên thua và bị loại — trong khi màu thì đã được xoá. (Canvas thường không lộ lỗi này vì với `preserveDrawingBuffer: false` trình duyệt tự xoá nó sau mỗi lần hiển thị; FBO thì không ai xoá hộ.)",
      en: "`gl.DEPTH_BUFFER_BIT`. The previous frame's depth is still there; each new fragment is compared against its own old depth; equal is not “less”, so it fails and is discarded — while the color has already been cleared. (The canvas rarely shows this, because with `preserveDrawingBuffer: false` the browser clears it after every composite; nobody clears an FBO for you.)",
    },
  },
  {
    id: "polygon-offset-sign",
    q: {
      vi: "Decal dán trên sàn bị z-fighting (depth thông thường, không reverse-Z). `polygonOffset` nên dùng giá trị âm hay dương, và quên tắt `POLYGON_OFFSET_FILL` sau đó thì sao?",
      en: "A decal on the floor z-fights (conventional depth, not reverse-Z). Should `polygonOffset` take a negative or a positive value, and what if you forget to disable `POLYGON_OFFSET_FILL` afterwards?",
    },
    a: {
      vi: "Âm, để kéo depth của decal về phía camera; giá trị dương đẩy nó ra xa và decal chìm xuống dưới sàn. Quên tắt thì offset áp nhầm lên mọi draw call sau đó.",
      en: "Negative, to pull the decal's depth toward the camera; a positive value pushes it away and the decal sinks under the floor. Forget to disable it and the offset applies to every draw call after it.",
    },
  },
];
