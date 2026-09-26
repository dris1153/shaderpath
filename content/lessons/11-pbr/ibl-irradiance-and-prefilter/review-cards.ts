import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "irradiance-map-can-be-tiny",
    q: {
      vi: "Vì sao irradiance map cho diffuse IBL có thể nhỏ tới cỡ 32×32 mỗi mặt cube mà vẫn đúng?",
      en: "Why can an irradiance map for diffuse IBL be as small as about 32×32 per cube face and still be right?",
    },
    a: {
      vi: "Irradiance $E(N)$ chỉ phụ thuộc hướng pháp tuyến, không phụ thuộc hướng nhìn, và tích chập cosine là bộ lọc low-pass rất mạnh — xoá gần hết chi tiết tần số cao của HDRI, chỉ còn vài gradient mượt. Tín hiệu mượt như vậy không cần độ phân giải cao.",
      en: "Irradiance $E(N)$ depends only on the normal direction, never on the view direction, and cosine convolution is an extremely aggressive low-pass filter — it wipes out nearly all high-frequency detail of the HDRI, leaving a few smooth gradients. A signal that smooth doesn't need resolution.",
    },
  },
  {
    id: "mip-chosen-from-roughness",
    q: {
      vi: "Khi lấy mẫu prefiltered environment, vì sao shader tự chọn mip theo roughness thay vì để GPU tự chọn mip?",
      en: "When sampling the prefiltered environment, why does the shader pick the mip from roughness instead of letting the GPU choose?",
    },
    a: {
      vi: "GPU chọn mip từ đạo hàm màn hình — toạ độ lấy mẫu đổi nhanh cỡ nào giữa các pixel kề nhau — và một tia phản xạ từ một pixel không có footprint nào cho biết độ nhám. Mỗi mip đã được blur sẵn theo lobe GGX của một roughness, nên mức mờ cần dùng đến từ vật liệu, không từ hình học màn hình.",
      en: "The GPU picks a mip from screen-space derivatives — how fast the lookup coordinate changes between neighboring pixels — and a single reflection ray from one pixel has no footprint that says anything about roughness. Each mip is already blurred with one roughness's GGX lobe, so the blur level has to come from the material, not screen geometry.",
    },
  },
  {
    id: "three-irradiance-from-cubeuv",
    q: {
      vi: "Three.js lấy irradiance cho diffuse IBL từ đâu, khi `PMREMGenerator` chỉ tạo ra một texture?",
      en: "Where does Three.js get irradiance for diffuse IBL, given that `PMREMGenerator` produces only one texture?",
    },
    a: {
      vi: "Từ chính atlas CubeUV nhiều mip đó: `getIBLIrradiance()` gọi `textureCubeUV(envMap, N, 1.0)`, tức lấy mẫu ở mip roughness $= 1$, mức mờ nhất. Blur GGX ở roughness 1 không đồng nhất với tích chập cosine thật, nhưng đủ gần để khỏi phải tạo và lưu một irradiance cubemap thứ hai.",
      en: "From that same multi-mip CubeUV atlas: `getIBLIrradiance()` calls `textureCubeUV(envMap, N, 1.0)`, sampling the roughness $= 1$ mip, the blurriest one. A GGX blur at roughness 1 isn't identical to a true cosine convolution, but it's close enough to skip building and storing a second, irradiance cubemap.",
    },
  },
];
