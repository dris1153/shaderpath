import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "renderer-shadow-switch",
    q: {
      vi: "Light có `castShadow`, mesh có `castShadow`, sàn có `receiveShadow`, mà vẫn không có bóng nào. Thiếu cờ nào, và vì sao không có lỗi?",
      en: "The light has `castShadow`, the mesh has `castShadow`, the floor has `receiveShadow`, and still there are no shadows. Which flag is missing, and why is there no error?",
    },
    a: {
      vi: "`renderer.shadowMap.enabled = true`. Pipeline shadow bị tắt ở cấp renderer, nên các cờ trên từng object thành vô nghĩa — đó là cấu hình hợp lệ, không phải lỗi, nên không có gì để báo.",
      en: "`renderer.shadowMap.enabled = true`. The shadow pipeline is off at the renderer level, so the per-object flags mean nothing — a valid configuration, not an error, so there is nothing to report.",
    },
  },
  {
    id: "shadow-camera-box",
    q: {
      vi: "Bóng của một `DirectionalLight` bị cắt thẳng tắp khi vật đi ra gần mép sàn, dù vật vẫn hiện rõ trong camera chính. Vì sao, và chỉnh gì?",
      en: "A `DirectionalLight` shadow gets cut off along a straight line as the object nears the floor's edge, though the object is plainly visible to the main camera. Why, and what do you adjust?",
    },
    a: {
      vi: "Vật đã ra khỏi hộp của shadow camera — một `OrthographicCamera` riêng của light; chỉ những gì trong hộp đó mới vào shadow map. Mở rộng `light.shadow.camera.left/right/top/bottom` cho vừa scene, rồi gọi `updateProjectionMatrix()` trên chính shadow camera.",
      en: "The object has left the shadow camera's box — the light's own `OrthographicCamera`; only what lies inside that box gets into the shadow map. Widen `light.shadow.camera.left/right/top/bottom` to fit the scene, then call `updateProjectionMatrix()` on the shadow camera itself.",
    },
  },
  {
    id: "shadow-map-size-cost",
    q: {
      vi: "Tăng `light.shadow.mapSize` từ 1024 lên 4096 cho bóng sắc hơn. Bộ nhớ của shadow map tăng bao nhiêu lần, và vì sao?",
      en: "You raise `light.shadow.mapSize` from 1024 to 4096 for sharper shadows. By what factor does the shadow map's memory grow, and why?",
    },
    a: {
      vi: "16 lần: số texel tăng theo bình phương cạnh — gấp 4 mỗi chiều, 4 × 4 = 16. Thường nên thu hẹp shadow camera cho khít scene trước, vì cách đó làm bóng sắc hơn mà không tốn thêm bộ nhớ.",
      en: "16 times: texel count grows with the square of the side — 4 times per dimension, 4 × 4 = 16. Tightening the shadow camera around the scene first is usually better, since it sharpens shadows at no memory cost.",
    },
  },
];
