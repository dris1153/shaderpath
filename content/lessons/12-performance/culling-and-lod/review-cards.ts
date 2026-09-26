import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "shader-displaced-mesh-culled-early",
    q: {
      vi: "Lá cờ vẫy bằng vertex shader biến mất đột ngột khi camera lùi xa, dù mắt vẫn còn thấy nó. Vì sao, và sửa thế nào?",
      en: "A flag waved by its vertex shader vanishes abruptly as the camera pulls back, even though it's still visible. Why, and how do you fix it?",
    },
    a: {
      vi: "Frustum culling kiểm tra `geometry.boundingSphere`, tính một lần từ vị trí đỉnh gốc trên CPU — nó không biết vertex shader dời đỉnh đi đâu. Hình cầu gốc rời frustum trong khi phần đã dời vẫn trong khung hình. Nới boundingSphere cho phủ biên độ dịch lớn nhất, hoặc đặt `frustumCulled = false` cho riêng mesh đó.",
      en: "Frustum culling tests `geometry.boundingSphere`, computed once from the original CPU-side vertex positions — it knows nothing about where the vertex shader moves them. The original sphere leaves the frustum while the displaced shape is still in frame. Expand the bounding sphere to cover the largest displacement, or set `frustumCulled = false` on that one mesh.",
    },
  },
  {
    id: "instanced-mesh-one-sphere",
    q: {
      vi: "Một `InstancedMesh` có 10.000 bản sao rải khắp thế giới. Frustum culling giúp được bao nhiêu, và cần lưu ý gì khi di chuyển instance?",
      en: "An `InstancedMesh` has 10,000 copies spread across the world. How much does frustum culling help, and what must you watch when moving instances?",
    },
    a: {
      vi: "Gần như không: cả `InstancedMesh` chỉ có MỘT bounding sphere gộp mọi instance, nên chỉ cần một instance trong frustum là cả 10.000 vào draw call. Instancing đổi culling từng vật lấy số draw call cực thấp. Sphere đó còn được cache: dời instance bằng `setMatrixAt` xong phải gọi lại `computeBoundingSphere()`.",
      en: "Barely at all: the whole `InstancedMesh` has ONE bounding sphere uniting every instance, so if one instance is in the frustum all 10,000 go into the draw call. Instancing trades per-object culling for an extremely low draw-call count. That sphere is also cached: after moving instances with `setMatrixAt`, call `computeBoundingSphere()` again.",
    },
  },
  {
    id: "group-is-never-frustum-tested",
    q: {
      vi: "Một `Group` chứa trọn một căn phòng nằm hẳn sau lưng camera. Renderer xử lý các mesh bên trong thế nào, và làm sao bỏ qua cả nhóm bằng một phép kiểm tra?",
      en: "A `Group` holding an entire room sits fully behind the camera. How does the renderer treat the meshes inside, and how do you skip the whole group with a single check?",
    },
    a: {
      vi: "`Group` không bao giờ tự được frustum test: renderer vẫn đi xuống và test từng mesh lá. Chỉ `group.visible = false` mới cắt cả nhánh bằng một phép kiểm tra — đó là zone culling, và chính bạn phải quyết định khi nào tắt vùng nào (ví dụ theo vùng camera đang đứng).",
      en: "A `Group` is never frustum-tested itself: the renderer still descends and tests every leaf mesh. Only `group.visible = false` cuts the whole subtree with one check — that's zone culling, and you decide when to switch which zone off (say, by which zone the camera is in).",
    },
  },
];
