import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "pcf-filters-the-comparison",
    q: {
      vi: "PCF làm mềm mép bóng bằng cách lọc cái gì — bản đồ độ sâu hay kết quả so sánh — và vì sao không làm ngược lại?",
      en: "What does PCF filter to soften shadow edges — the depth map or the comparison results — and why not the other way round?",
    },
    a: {
      vi: "Lọc kết quả so sánh: làm phép so sánh độ sâu ở vài toạ độ lân cận (mỗi mẫu ra trong bóng hoặc ngoài bóng), rồi lấy trung bình thành một tỉ lệ phần trăm. Blur shadow map trước khi so sánh sẽ trộn độ sâu của vật gần với vật xa ngay mép silhouette, cho ra một độ sâu không thuộc bề mặt nào, và phép so sánh sai.",
      en: "The comparison results: run the depth comparison at several nearby coordinates (each sample is in or out of shadow), then average them into a percentage. Blurring the shadow map before comparing mixes the depths of a near object and a far one right at silhouette edges, producing a depth that belongs to no surface and a wrong comparison.",
    },
  },
  {
    id: "pcfsoft-is-pcf-now",
    q: {
      vi: "Trong three 0.185, đổi `renderer.shadowMap.type` từ `PCFShadowMap` sang `PCFSoftShadowMap` mà bóng không mềm hơn chút nào. Vì sao, và muốn mềm hơn thì chỉnh gì?",
      en: "In three 0.185, switching `renderer.shadowMap.type` from `PCFShadowMap` to `PCFSoftShadowMap` doesn't soften shadows at all. Why, and what do you tune instead?",
    },
    a: {
      vi: "`PCFSoftShadowMap` đã bị deprecate: `WebGLShadowMap` in cảnh báo rồi tự gán lại `type = PCFShadowMap`, nên hai lựa chọn cho kết quả y hệt. Muốn mềm hơn thì tăng `shadow.radius` — bán kính đĩa Vogel mà PCF lấy mẫu — biết rằng radius quá lớn làm nhoè cả hình dạng thật của bóng.",
      en: "`PCFSoftShadowMap` is deprecated: `WebGLShadowMap` logs a warning and reassigns `type = PCFShadowMap`, so both produce identical output. For softer edges raise `shadow.radius` — the Vogel-disk radius PCF samples over — knowing that too large a radius blurs the shadow's true shape.",
    },
  },
  {
    id: "csm-splits-camera-frustum",
    q: {
      vi: "Cascaded Shadow Maps chia cái gì thành nhiều lát, và vì sao điều đó chữa được răng cưa mà một shadow map duy nhất không chữa nổi?",
      en: "What do Cascaded Shadow Maps split into slices, and why does that fix aliasing a single shadow map can't?",
    },
    a: {
      vi: "Chia frustum của CAMERA (không phải của đèn) theo chiều sâu, mỗi lát một shadow map riêng. Một texel phủ khoảng $\\text{frustumWidth}/\\text{mapSize}$ đơn vị thế giới: lát gần camera nhỏ nên texel dày, chi tiết cao; lát xa lớn nên texel thưa, nhưng xa mắt thì khó thấy răng cưa. Một shadow map duy nhất buộc cả cảnh dùng chung một mật độ texel.",
      en: "The CAMERA's frustum (not the light's), along depth, with one shadow map per slice. A texel covers about $\\text{frustumWidth}/\\text{mapSize}$ world units: the slice near the camera is small, so texels are dense and detailed; far slices are large with sparse texels, but aliasing is hard to notice far from the eye. A single shadow map forces one texel density on the whole scene.",
    },
  },
];
