import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "orm-channel-packing",
    q: {
      vi: "Một texture ORM được gán cho cả `aoMap`, `roughnessMap` và `metalnessMap` của `MeshStandardMaterial`. Mỗi thuộc tính đọc kênh nào, và vì sao đóng gói như vậy đáng làm?",
      en: "One ORM texture is assigned to `aoMap`, `roughnessMap` and `metalnessMap` of a `MeshStandardMaterial`. Which channel does each property read, and why is the packing worth it?",
    },
    a: {
      vi: "`aoMap` đọc R, `roughnessMap` đọc G, `metalnessMap` đọc B — mỗi chunk lấy mẫu slot của nó và giữ một kênh. Cái lợi: một ảnh để tải, giải mã và upload, một texture RGBA8 trong VRAM thay vì ba (three upload cả JPEG/PNG xám thành RGBA, 4 byte/texel). Không bớt được lần bind: mỗi slot là một sampler riêng, nên cùng texture đó vẫn bị bind vào ba texture unit.",
      en: "`aoMap` reads R, `roughnessMap` reads G, `metalnessMap` reads B — each chunk samples its own slot and keeps one channel. The win: one image to download, decode and upload, and one RGBA8 texture in VRAM instead of three (three uploads even a grayscale JPEG/PNG as RGBA, 4 bytes/texel). It doesn't save binds: each slot is its own sampler, so the same texture is still bound to three texture units.",
    },
  },
  {
    id: "albedo-without-srgb",
    q: {
      vi: "Quên đặt `colorSpace = SRGBColorSpace` cho texture albedo thì ảnh tối đi hay bạc đi, vì sao?",
      en: "Forget `colorSpace = SRGBColorSpace` on an albedo texture — does the image come out darker or washed out, and why?",
    },
    a: {
      vi: "Bạc và sáng quá. GPU không giải mã gamma khi lấy mẫu, nên một giá trị sRGB như $0.5$ (thực chỉ ≈21% năng lượng) đi vào phép chiếu sáng như thể đã tuyến tính — cao hơn thực. Đến đầu ra nó lại bị mã hoá sRGB thêm một lần, đẩy lên cao hơn nữa.",
      en: "Washed out and too bright. The GPU never decodes gamma at sample time, so an sRGB value like $0.5$ (really ≈21% of the light energy) enters lighting as if it were already linear — too high. At output it gets sRGB-encoded once more, pushing it higher still.",
    },
  },
  {
    id: "ao-needs-indirect-light",
    q: {
      vi: "Đã gán `aoMap` mà các khe vẫn không tối đi. Cảnh nhiều khả năng đang thiếu gì?",
      en: "An `aoMap` is assigned, yet the crevices don't darken. What is the scene most likely missing?",
    },
    a: {
      vi: "Ánh sáng gián tiếp. Trong three, `aoMap` chỉ nhân vào phần gián tiếp (indirect diffuse, và indirect specular khi có envMap), không bao giờ nhân vào đèn trực tiếp. Cảnh chỉ có đèn trực tiếp thì AO không có gì để làm tối.",
      en: "Indirect light. In three, `aoMap` only multiplies the indirect terms (indirect diffuse, plus indirect specular when an envMap is present), never direct lights. A scene lit only by direct lights gives AO nothing to darken.",
    },
  },
];
