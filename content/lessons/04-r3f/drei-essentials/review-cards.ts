import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "text-size-costs-no-vertices",
    q: {
      vi: "Tăng `fontSize` của `<Text>` (drei) lên gấp đôi. Số vertex tăng bao nhiêu, và vì sao?",
      en: "You double the `fontSize` of drei's `<Text>`. How much does the vertex count grow, and why?",
    },
    a: {
      vi: "Không tăng. Mỗi glyph vẫn là một quad instanced 4 đỉnh đọc atlas SDF; đổi cỡ chữ chỉ layout lại vị trí và kích thước từng quad, không thêm đỉnh nào. Chi phí hình học đi theo số ký tự, không theo cỡ chữ.",
      en: "It does not grow. Each glyph stays a four-vertex instanced quad reading an SDF atlas; a new font size only re-lays out each quad's position and size, adding no vertices. Geometry cost follows the character count, not the size.",
    },
  },
  {
    id: "shadermaterial-needs-extend",
    q: {
      vi: "Bạn tạo `MyMaterial` bằng `shaderMaterial()` của drei rồi dùng `<myMaterial />`, nhưng R3F báo không biết element này. Thiếu gì, và vì sao?",
      en: "You build `MyMaterial` with drei's `shaderMaterial()` and use `<myMaterial />`, but R3F says it does not know the element. What is missing, and why?",
    },
    a: {
      vi: "`extend({ MyMaterial })`. `shaderMaterial()` chỉ trả về một class kế thừa `THREE.ShaderMaterial`; catalog JSX của R3F chỉ biết sẵn các class của Three.js, còn class ngoài phải được đăng ký thì mới thành tag viết thường.",
      en: "`extend({ MyMaterial })`. `shaderMaterial()` only returns a class extending `THREE.ShaderMaterial`; R3F's JSX catalog knows Three.js's own classes, and anything else must be registered before it becomes a lowercase tag.",
    },
  },
];
