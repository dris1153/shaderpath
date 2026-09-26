import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "volumes-do-not-stop",
    q: {
      vi: "Một vòng march mây dừng ở mẫu đầu tiên có mật độ lớn hơn 0 và xuất ra những gì đã tích luỹ tới đó, như sphere tracing dừng khi chạm bề mặt. Đám mây trông thế nào?",
      en: "A cloud march stops at the first sample with density above 0 and outputs what it has accumulated so far, the way sphere tracing stops at a hit. What does the cloud look like?",
    },
    a: {
      vi: "Một lớp vỏ mỏng, nhạt ở phía gần camera — chỉ có đóng góp của lát đầu tiên. Thể tích không có bề mặt để dừng: vòng march phải đi hết vùng bao theo bước cố định và tích luỹ, nếu không phần ruột dày dần bên trong không bao giờ lên được ảnh.",
      en: "A faint, thin shell on the side facing the camera — only the first slab's contribution. A volume has no surface to stop at: the march has to cross the whole bounding region in fixed steps and accumulate, or the thickening interior never reaches the image.",
    },
  },
  {
    id: "emit-before-attenuating",
    q: {
      vi: "Trong vòng lặp tích luỹ, nếu cộng phần phát xạ của bước này vào $C$ SAU khi đã nhân $T$ với hệ số suy hao của chính bước đó, thay vì trước, thì điều gì thay đổi?",
      en: "In the accumulation loop, what changes if you add this step's emission to $C$ after multiplying $T$ by this step's attenuation, instead of before?",
    },
    a: {
      vi: "Phát xạ của mỗi bước bị chính lớp của nó làm tối: trọng số thành $\\rho\\,\\Delta s\\,e^{-\\rho\\Delta s}$ thay vì $\\rho\\,\\Delta s$, nên các bước dày ra tối hơn. Không thứ tự nào chính xác — cộng trước thì thừa, cộng sau thì thiếu; trọng số chính xác $1 - e^{-\\rho\\Delta s}$ nằm giữa, và cả ba khớp nhau khi bước mỏng.",
      en: "Each step's emission gets dimmed by its own slab: the weight becomes $\\rho\\,\\Delta s\\,e^{-\\rho\\Delta s}$ instead of $\\rho\\,\\Delta s$, so thick steps come out darker. Neither order is exact — emit-first overshoots, emit-after undershoots; the exact slab weight $1 - e^{-\\rho\\Delta s}$ sits between, and all three agree for thin steps.",
    },
  },
  {
    id: "jitter-hides-banding",
    q: {
      vi: "Đám mây hiện các dải xếp chồng. Bạn dịch điểm bắt đầu của mỗi tia một phần ngẫu nhiên của một bước; số mẫu không đổi. Vì sao các dải biến mất?",
      en: "A cloud shows stacked bands. You offset each ray's start by a random fraction of one step; the sample count stays the same. Why do the bands go away?",
    },
    a: {
      vi: "Dải xuất hiện vì các pixel cạnh nhau đặt mẫu ở cùng độ sâu, nên ranh giới các bước của chúng thẳng hàng thành cạnh sắc. Offset ngẫu nhiên theo từng pixel phá sự thẳng hàng đó, biến cạnh thành hạt mịn — và mắt dễ bỏ qua nhiễu hơn nhiều so với một đường sắc.",
      en: "The bands appear because neighboring pixels place their samples at the same depths, so their step boundaries line up into sharp edges. A per-pixel random offset breaks that alignment and turns the edges into fine grain — and the eye forgives noise far more readily than a sharp line.",
    },
  },
];
