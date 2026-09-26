import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "attribute-needs-update",
    q: {
      vi: "Mỗi frame code ghi lại các giá trị trong `Float32Array` của một attribute, nhưng hình không hề đổi. Thiếu gì, và vì sao?",
      en: "Every frame the code rewrites the values in an attribute's `Float32Array`, but the shape never changes. What is missing, and why?",
    },
    a: {
      vi: "`attribute.needsUpdate = true` sau khi ghi. Mảng JavaScript đã đổi, nhưng buffer trên GPU vẫn giữ dữ liệu cũ cho tới khi Three được báo để copy lại.",
      en: "`attribute.needsUpdate = true` after writing. The JavaScript array changed, but the GPU buffer keeps the old data until Three is told to copy it again.",
    },
  },
  {
    id: "size-by-vertex-count",
    q: {
      vi: "Bạn cấp phát `Float32Array` cho một attribute tuỳ biến của sphere theo số tam giác nhân 3. Sai ở đâu, và nên dựa vào số nào?",
      en: "You size a sphere's custom-attribute `Float32Array` by its triangle count times 3. What is wrong, and which number should you use?",
    },
    a: {
      vi: "Attribute per-vertex có đúng `geometry.attributes.position.count` hàng; geometry có index dùng lại vertex giữa các tam giác, nên số vertex khác hẳn số tam giác nhân 3. Cấp phát `position.count * itemSize`.",
      en: "A per-vertex attribute has exactly `geometry.attributes.position.count` rows; an indexed geometry shares vertices between triangles, so the vertex count is nothing like triangles times 3. Allocate `position.count * itemSize`.",
    },
  },
];
