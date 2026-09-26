import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "dpr-is-a-load-multiplier",
    q: {
      vi: "Vì sao không nên dùng `devicePixelRatio` để đoán GPU của máy mạnh hay yếu?",
      en: "Why shouldn't `devicePixelRatio` be used to guess whether a device's GPU is strong or weak?",
    },
    a: {
      vi: "DPR không đo năng lực mà là hệ số tải: DPR 3 nghĩa là vẽ gấp 9 lần số pixel của DPR 1 trên cùng kích thước màn hình logic. Dùng nó để nhân vào ước tính tải, không phải để xếp loại GPU.",
      en: "DPR measures no capability — it's a load multiplier: DPR 3 means rendering 9× the pixels of DPR 1 at the same logical screen size. Use it to multiply into a load estimate, not to classify the GPU.",
    },
  },
  {
    id: "unmount-instead-of-hide",
    q: {
      vi: "Tier thấp ẩn các hiệu ứng nặng bằng `visible={false}`. Cách đó tiết kiệm được gì và vẫn tốn gì?",
      en: "A low tier hides heavy effects with `visible={false}`. What does that save, and what does it still cost?",
    },
    a: {
      vi: "Tiết kiệm draw call — `projectObject` dừng ngay ở `visible === false` và bỏ qua cả nhánh. Nhưng vẫn tốn công dựng các object đó, buffer của chúng vẫn nằm trong bộ nhớ JS (và cả trên GPU nếu đã từng được vẽ trước khi bị ẩn), và React vẫn reconcile cây đó. Tier thấp nghĩa là component ấy không có mặt trong cây React, chứ không phải có mặt mà vô hình.",
      en: "It saves the draw calls — `projectObject` returns at `visible === false` and skips the whole subtree. It still pays to build those objects, their buffers stay in JS memory (and on the GPU too if they were drawn before being hidden), and React still reconciles that tree. A low tier means the component isn't in the React tree at all, not present but invisible.",
    },
  },
  {
    id: "manual-choice-stops-watchdog",
    q: {
      vi: "Người dùng tự chọn tier trong phần cài đặt. Từ lúc đó, watchdog tự động phải cư xử thế nào, và vì sao?",
      en: "The user picks a tier manually in settings. From then on, how must the automatic watchdog behave, and why?",
    },
    a: {
      vi: "Ngừng tự đổi tier, dù frame time có tệ đến đâu. Người dùng có thể biết điều máy không đo được — đang cắm sạc và chịu tốn pin để có chất lượng, hay muốn tiết kiệm pin trên máy mạnh. Benchmark và watchdog chỉ được can thiệp khi người dùng chưa chọn.",
      en: "Stop changing the tier on its own, however bad frame time gets. The user may know what the device can't measure — plugged in and willing to trade battery for quality, or wanting to save battery on a strong machine. The benchmark and watchdog only step in when the user hasn't chosen.",
    },
  },
];
