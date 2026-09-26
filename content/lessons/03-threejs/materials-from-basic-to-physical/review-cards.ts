import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "shared-material-changes-everyone",
    q: {
      vi: "50 mesh dùng chung một `MeshStandardMaterial`. Bạn đổi `roughness` để làm bóng đúng mesh đang được hover. Chuyện gì xảy ra, và sửa thế nào?",
      en: "50 meshes share one `MeshStandardMaterial`. You change `roughness` to make only the hovered mesh glossy. What happens, and how do you fix it?",
    },
    a: {
      vi: "Cả 50 mesh cùng bóng lên, vì chúng tham chiếu đúng một object material. Cần ngoại hình riêng thì `clone()` material cho mesh đó (hoặc dùng attribute theo từng instance).",
      en: "All 50 turn glossy, because they reference one and the same material object. For an independent look, `clone()` the material for that mesh (or use a per-instance attribute).",
    },
  },
  {
    id: "basic-casts-but-cannot-receive",
    q: {
      vi: "Một mesh dùng `MeshBasicMaterial` bật cả `castShadow` lẫn `receiveShadow`. Cờ nào có tác dụng, và vì sao?",
      en: "A mesh with `MeshBasicMaterial` has both `castShadow` and `receiveShadow` on. Which flag works, and why?",
    },
    a: {
      vi: "Chỉ `castShadow`. Pass đổ bóng vẽ mọi vật bằng depth material nội bộ của renderer, bỏ qua material riêng, nên mesh Basic vẫn đổ bóng lên vật khác. Nhưng shader của Basic không đọc shadow map, nên nó không bao giờ nhận bóng.",
      en: "Only `castShadow`. The shadow pass draws every object with the renderer's internal depth material, ignoring its own material, so a Basic mesh still casts shadows onto others. But Basic's shader never reads the shadow map, so it never receives any.",
    },
  },
];
