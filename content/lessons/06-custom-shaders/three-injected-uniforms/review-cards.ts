import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "uniforms-prop-is-copied",
    q: {
      vi: "Bạn truyền `uniforms={u}` làm prop cho `<shaderMaterial>` rồi mỗi frame ghi `u.uTime.value = t`. Hiệu ứng đứng im ở giá trị đầu. Vì sao?",
      en: "You pass `uniforms={u}` as a prop to `<shaderMaterial>`, then write `u.uTime.value = t` every frame. The effect freezes at its first value. Why?",
    },
    a: {
      vi: "Lúc mount, R3F chép từng entry vào map `uniforms` riêng của material — object `u` của bạn không bao giờ được gắn vào material, nên ghi `.value` lên nó không tới GPU. Hãy ghi vào `material.uniforms` qua ref, hoặc gắn đúng object uniform đó vào material bằng tham chiếu.",
      en: "At mount, R3F copies each entry into the material's own `uniforms` map — your `u` object is never attached to the material, so writing `.value` on it never reaches the GPU. Write to `material.uniforms` through a ref, or attach that exact uniform object to the material by reference.",
    },
  },
  {
    id: "uniform-write-vs-recompile",
    q: {
      vi: "Một hiệu ứng đổi màu mỗi frame bằng cách dựng lại chuỗi `fragmentShader` với hằng số màu mới (kèm `material.needsUpdate = true`), thay vì ghi một uniform. Vì sao đó là thảm hoạ?",
      en: "An effect changes color every frame by rebuilding the `fragmentShader` string with a new color constant (plus `material.needsUpdate = true`), instead of writing a uniform. Why is that a disaster?",
    },
    a: {
      vi: "Chuỗi shader mới không khớp program cache, nên mỗi frame phải biên dịch hai shader, link program và dò lại location — một trong những lệnh đồng bộ đắt nhất — và mỗi chuỗi khác nhau còn để lại một program cho tới khi material bị dispose. Ghi `.value` của uniform chỉ gửi vài con số.",
      en: "A new shader string misses the program cache, so every frame compiles two shaders, links a program and looks up locations again — among the most expensive synchronous calls — and each distinct string leaves a program behind until the material is disposed. Writing a uniform's `.value` only sends a few numbers.",
    },
  },
];
