import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "shared-material-keeps-call-count",
    q: {
      vi: "500 mesh đã dùng chung một material mà `render.calls` không giảm. Vì sao, và chia sẻ material vẫn đáng làm ở điểm nào?",
      en: "500 meshes already share one material, yet `render.calls` doesn't drop. Why, and why is sharing still worth doing?",
    },
    a: {
      vi: "Mỗi mesh vẫn là một node transform riêng nên vẫn cần lệnh vẽ riêng — số draw call bằng số mesh. Dùng chung material gần như miễn phí và là điều kiện cho hai bậc tiếp theo: gộp geometry và `InstancedMesh` đều đòi hỏi cùng một material.",
      en: "Each mesh is still its own transform node, so it still needs its own draw command — draw calls equal mesh count. Sharing is nearly free and it's the prerequisite for the next two rungs: merging geometry and `InstancedMesh` both require one shared material.",
    },
  },
  {
    id: "when-merging-is-wrong",
    q: {
      vi: "Khi nào `mergeGeometries` là lựa chọn sai, dù nó gộp mọi thứ về một draw call?",
      en: "When is `mergeGeometries` the wrong choice, even though it collapses everything into one draw call?",
    },
    a: {
      vi: "Khi cần di chuyển, ẩn hay đổi màu từng vật riêng. Merge nướng cứng transform của từng bản vào vị trí đỉnh: kết quả là một geometry, một mesh, một transform — và frustum culling chỉ còn cull cả khối bằng một bounding sphere. Vật cần chuyển động độc lập thì dùng `InstancedMesh` ngay từ đầu.",
      en: "When pieces need to move, hide, or recolor independently. Merging bakes each copy's transform into its vertex positions: the result is one geometry, one mesh, one transform — and frustum culling can only cull the whole blob by one bounding sphere. For independently moving objects, use `InstancedMesh` from the start.",
    },
  },
  {
    id: "batched-mesh-niche",
    q: {
      vi: "`BatchedMesh` giải quyết trường hợp nào mà cả `InstancedMesh` lẫn `mergeGeometries` đều không đáp ứng?",
      en: "Which case does `BatchedMesh` handle that neither `InstancedMesh` nor `mergeGeometries` can?",
    },
    a: {
      vi: "Nhiều geometry KHÁC nhau (hộp, cầu, nón) dùng chung một material, mà mỗi instance vẫn bật/tắt được bằng `setVisibleAt`. `InstancedMesh` chỉ chứa một geometry; merge thì mất khả năng bật/tắt từng vật. Có extension `WEBGL_multi_draw` thì cả lô đi trong một lệnh vẽ; thiếu nó, three quay về một lệnh vẽ cho mỗi instance.",
      en: "Several DIFFERENT geometries (a box, a sphere, a cone) sharing one material, with every instance still toggleable via `setVisibleAt`. `InstancedMesh` holds one geometry only; merging loses per-object toggling. With the `WEBGL_multi_draw` extension the batch goes out in one draw call; without it, three falls back to one draw call per instance.",
    },
  },
];
