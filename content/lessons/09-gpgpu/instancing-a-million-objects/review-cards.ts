import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "keep-instance-matrix-identity",
    q: {
      vi: "Đường instancing GPGPU giữ `instanceMatrix` là identity và cộng vị trí lấy từ state texture vào `transformed` trong vertex shader. Vì sao không ghi vị trí vào `instanceMatrix` mỗi frame như Track 6?",
      en: "The GPGPU instancing path keeps `instanceMatrix` at identity and adds the position sampled from the state texture to `transformed` in the vertex shader. Why not write positions into `instanceMatrix` every frame, as Track 6 did?",
    },
    a: {
      vi: "Vị trí giờ chỉ sống trên GPU. Ghi `instanceMatrix` nghĩa là CPU phải có chúng trong tay rồi upload lại cả buffer mỗi frame — đúng phần việc CPU mỗi frame mà GPGPU sinh ra để bỏ. Đọc texture ngay trong vertex shader giữ trọn đường compute → render trên GPU.",
      en: "The positions now live only on the GPU. Writing `instanceMatrix` means the CPU must hold them and re-upload the whole buffer every frame — exactly the per-frame CPU work GPGPU exists to remove. Sampling the texture in the vertex shader keeps compute → render entirely on the GPU.",
    },
  },
  {
    id: "rotate-the-normal-too",
    q: {
      vi: "Instance được xoay theo hướng vận tốc trông đúng vị trí, đúng hướng, nhưng ánh sáng không khớp với các mặt của chúng. Thiếu gì?",
      en: "Instances rotated to face their velocity sit in the right place, facing the right way, yet the lighting doesn't match their faces. What is missing?",
    },
    a: {
      vi: "Chỉ `transformed` (vị trí) được nhân với ma trận basis, còn pháp tuyến vẫn là pháp tuyến cũ chưa xoay — ánh sáng tính theo hướng mặt cũ. Nhân cùng basis đó vào pháp tuyến (ở `beginnormal_vertex`).",
      en: "Only `transformed` (the position) was multiplied by the basis matrix; the normal is still the old, unrotated one, so lighting uses the old face directions. Multiply the same basis into the normal (at `beginnormal_vertex`).",
    },
  },
  {
    id: "basis-from-velocity-degenerates",
    q: {
      vi: "Để dựng basis theo hướng bay, bạn lấy vận tốc đã chuẩn hoá làm trục `up` rồi cross với trục X của thế giới. Khi nào cách này hỏng, và hỏng ra sao?",
      en: "To build an orientation basis you take the normalized velocity as `up` and cross it with world X. When does this break, and how?",
    },
    a: {
      vi: "Khi vận tốc song song (hoặc gần song song) với trục X: tích có hướng bằng 0, `normalize` của vector không ra NaN hoặc một trục vô nghĩa, và instance nhấp nháy hay biến mất. Trục tham chiếu phải không song song với vận tốc — ví dụ đổi sang trục Y khi vận tốc gần trùng X.",
      en: "When the velocity is parallel (or nearly parallel) to X: the cross product is zero, `normalize` of it yields NaN or a meaningless axis, and the instance flickers or vanishes. The reference axis must not be parallel to the velocity — say, switch to Y when the velocity is close to X.",
    },
  },
];
