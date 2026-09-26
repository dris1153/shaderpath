import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "culled-by-original-bounds",
    q: {
      vi: "Cỏ là một `Mesh` thường (không phải `InstancedMesh`), đung đưa bằng vertex shader, và đôi khi biến mất ở mép màn hình dù lẽ ra vẫn nhìn thấy. Vì sao, và sửa thế nào?",
      en: "Grass is a plain `Mesh` (not an `InstancedMesh`) swayed by a vertex shader, and it sometimes vanishes at the screen edge although it should still be visible. Why, and how do you fix it?",
    },
    a: {
      vi: "Frustum culling dùng `geometry.boundingSphere` tính từ vị trí đỉnh gốc trên CPU, trước khi vertex shader chạy; shader đẩy đỉnh ra ngoài sphere đó nên object bị loại nhầm. Phóng to `boundingSphere.radius`, hoặc đặt `frustumCulled = false`.",
      en: "Frustum culling uses `geometry.boundingSphere`, computed on the CPU from the original vertex positions, before the vertex shader runs; the shader pushes vertices outside that sphere, so the object is wrongly culled. Enlarge `boundingSphere.radius`, or set `frustumCulled = false`.",
    },
  },
  {
    id: "opaque-front-to-back",
    q: {
      vi: "Một cảnh có 200 vật đục chồng lên nhau. Trong cùng một material, nếu renderer vẽ chúng từ xa tới gần thay vì gần tới xa, hình có sai không, và mất gì?",
      en: "A scene has 200 overlapping opaque objects. Within one material, if the renderer drew them far to near instead of near to far, would the image be wrong, and what would it cost?",
    },
    a: {
      vi: "Hình vẫn đúng nhờ depth test, nhưng mỗi pixel bị tô đi tô lại: fragment shader chạy cho cả những thứ sau đó bị che. Vẽ gần trước thì depth test loại sớm các fragment bị che, đỡ công shading.",
      en: "The image would still be right thanks to the depth test, but each pixel would be shaded again and again: the fragment shader runs for things that are later covered. Drawing near first lets the depth test reject hidden fragments early, saving shading work.",
    },
  },
];
