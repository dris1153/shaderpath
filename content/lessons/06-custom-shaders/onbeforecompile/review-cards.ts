import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "declare-the-injected-uniform",
    q: {
      vi: "Trong `onBeforeCompile`, bạn gán `shader.uniforms.uTwist = { value: 0 }` và chèn code dùng `uTwist`, nhưng không thêm `uniform float uTwist;` vào source. Chuyện gì xảy ra?",
      en: "In `onBeforeCompile` you set `shader.uniforms.uTwist = { value: 0 }` and inject code that uses `uTwist`, but never add `uniform float uTwist;` to the source. What happens?",
    },
    a: {
      vi: "Lỗi biên dịch vì biến chưa được khai báo — gán vào `shader.uniforms` chỉ cấp giá trị, không khai báo gì trong GLSL. Luôn chèn dòng `uniform ...;` cùng lúc với việc gán giá trị.",
      en: "A compile error for an undeclared variable — assigning to `shader.uniforms` only supplies a value; it declares nothing in GLSL. Always inject the `uniform ...;` line along with the value.",
    },
  },
  {
    id: "keep-the-uniform-handle",
    q: {
      vi: "Một `MeshStandardMaterial` được hack bằng `onBeforeCompile` để thêm `uTwist`. Muốn cập nhật nó mỗi frame, bạn giữ tham chiếu tới cái gì, và vì sao không ghi vào `material.uniforms`?",
      en: "A `MeshStandardMaterial` is hacked with `onBeforeCompile` to add `uTwist`. To update it every frame, what do you keep a reference to, and why not write to `material.uniforms`?",
    },
    a: {
      vi: "Tạo object uniform một lần ở ngoài callback, gán nó vào `shader.uniforms` bên trong callback, rồi ghi `.value` của chính object đó mỗi frame — nếu tạo mới trong callback, lần biên dịch lại sau sẽ làm tham chiếu bạn giữ trỏ vào object cũ. Material có sẵn không có `material.uniforms` cho uniform tự thêm; chỉ `shader.uniforms` trong callback mới là thứ renderer đọc.",
      en: "Create the uniform object once outside the callback, assign it to `shader.uniforms` inside the callback, and write that same object's `.value` every frame — create it inside the callback and a later recompile leaves your stored reference pointing at a stale object. A built-in material has no `material.uniforms` for your added uniform; only `shader.uniforms` inside the callback is what the renderer reads.",
    },
  },
];
