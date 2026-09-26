import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "threshold-not-strength",
    q: {
      vi: "Bloom làm cả cảnh mù sương; hạ `strength` chỉ làm lớp sương mờ đi đều khắp nơi. Vì sao không giải quyết được, và cách đúng là gì?",
      en: "Bloom turns the whole scene hazy; lowering `strength` only dims the haze evenly everywhere. Why doesn't that fix it, and what does?",
    },
    a: {
      vi: "`strength` nhân đều quầng sáng của MỌI thứ đã qua ngưỡng; gốc vấn đề là threshold quá thấp nên tường trắng, highlight cũng bị coi là nguồn sáng. Với buffer HDR, đặt threshold trên 1.0: dưới ánh sáng thông thường, vật bình thường nằm dưới 1, còn vật phát sáng thật (đèn, neon) mang giá trị 2, 3 hoặc cao hơn.",
      en: "`strength` scales the glow of EVERYTHING that passed the threshold; the root cause is a threshold so low that white walls and highlights count as light sources. With an HDR buffer, put the threshold above 1.0: under typical lighting ordinary surfaces stay below 1, while genuine emitters (lamps, neon) carry 2, 3 or more.",
    },
  },
  {
    id: "radius-reweights-mips",
    q: {
      vi: "`radius` của `UnrealBloomPass` thay đổi gì — và không thay đổi gì?",
      en: "What does `UnrealBloomPass`'s `radius` change — and what doesn't it change?",
    },
    a: {
      vi: "Nó chỉ đổi trọng số khi cộng năm mip đã blur: nội suy mỗi hệ số giữa `bloomFactors[i]` và `1.2 - bloomFactors[i]`, dời ưu tiên từ mip sắc sang các mip rộng. Kích thước kernel cố định từ lúc tạo pass, và `radius` không liên quan gì tới việc vật nào được coi là nguồn sáng.",
      en: "It only reweights how the five blurred mips are summed: each factor is interpolated between `bloomFactors[i]` and `1.2 - bloomFactors[i]`, shifting weight from the sharp mip toward the wide ones. Kernel sizes are fixed at construction, and `radius` has no say in which objects count as light sources.",
    },
  },
  {
    id: "mip-chain-for-wide-glow",
    q: {
      vi: "Vì sao `UnrealBloomPass` blur một chuỗi năm mip, mỗi mip bằng nửa độ phân giải mip trước, thay vì một lần blur rất rộng ở độ phân giải đầy đủ?",
      en: "Why does `UnrealBloomPass` blur a chain of five mips, each at half the resolution of the one before, instead of one very wide blur at full resolution?",
    },
    a: {
      vi: "Ở mip thấp, mỗi texel phủ nhiều pixel màn hình hơn, nên một kernel vừa phải (11 đến 43 tap mỗi chiều, với tới 5 đến 21 texel mỗi bên) đã tạo được quầng sáng lan rất rộng. Một kernel đủ rộng như vậy ở độ phân giải đầy đủ sẽ cần quá nhiều lần đọc cho mỗi pixel.",
      en: "At a low mip each texel covers many screen pixels, so a modest kernel (11 to 43 taps per direction, reaching 5 to 21 texels each side) already produces a very wide glow. A kernel that wide at full resolution would need far too many reads per pixel.",
    },
  },
];
