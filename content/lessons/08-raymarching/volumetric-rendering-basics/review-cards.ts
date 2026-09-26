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
      vi: "Trong vòng lặp tích luỹ, vì sao cộng phần phát xạ của bước này vào $C$ trước khi nhân $T$ với hệ số suy hao của chính bước đó?",
      en: "In the accumulation loop, why add this step's emission to $C$ before multiplying $T$ by this step's attenuation?",
    },
    a: {
      vi: "Lúc đó $T$ là phần ánh sáng còn sống sót từ camera tới đây qua các bước gần hơn. Trong mô hình này, ánh sáng do chính bước đó phát ra chưa đi qua chính nó, nên không bị làm tối bởi hệ số của nó. Đảo hai dòng thì mỗi lớp tự chặn một phần ánh sáng của chính mình — mây ra tối và phẳng.",
      en: "At that moment $T$ is the light surviving from the camera to here through the nearer steps. In this model the current step's own emission has not passed through itself, so it should not be dimmed by its own factor. Swap the two lines and every layer blocks part of its own light — the cloud comes out dim and flat.",
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
