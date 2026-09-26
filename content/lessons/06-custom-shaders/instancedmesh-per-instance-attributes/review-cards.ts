import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "vertex-colors-blacks-out-instances",
    q: {
      vi: "Bạn tô màu từng bản sao bằng `setColorAt`, rồi bật thêm `material.vertexColors = true` “cho chắc”. Cả trường instance hiện màu đen. Vì sao?",
      en: "You color each instance with `setColorAt`, then also turn on `material.vertexColors = true` “to be safe”. The whole field renders black. Why?",
    },
    a: {
      vi: "Cờ đó khiến shader đọc attribute `color` của geometry, mà geometry không có, nên nhận giá trị mặc định (0, 0, 0, 1). Màu đỉnh bằng 0 nhân với `instanceColor` thành đen. Chỉ `instanceColor` là đủ.",
      en: "That flag makes the shader read the geometry's `color` attribute, which the geometry lacks, so it gets the default (0, 0, 0, 1). A zero vertex color multiplied by `instanceColor` is black. `instanceColor` alone is enough.",
    },
  },
  {
    id: "one-sphere-for-the-field",
    q: {
      vi: "Một `InstancedMesh` rải 3000 viên đá khắp bản đồ. Frustum culling xử lý nó thế nào?",
      en: "An `InstancedMesh` scatters 3000 rocks across the map. How does frustum culling treat it?",
    },
    a: {
      vi: "Cả mesh được kiểm tra bằng một bounding sphere bao mọi instance, nên hoặc vẽ tất cả hoặc không vẽ gì — những viên đá ở sau lưng camera vẫn được vẽ như thường.",
      en: "The whole mesh is tested with one bounding sphere enclosing every instance, so it draws everything or nothing — rocks behind the camera still get drawn as usual.",
    },
  },
];
