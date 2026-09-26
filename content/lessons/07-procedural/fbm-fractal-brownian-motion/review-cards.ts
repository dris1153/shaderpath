import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "ridged-vs-turbulence",
    q: {
      vi: "Bạn muốn sống núi sắc từ FBM. Lấy `abs(noise)` ở mỗi octave cho ra các nếp gấp sắc — nhưng đó là đỉnh hay đáy, và một thay đổi nào lật chúng lại?",
      en: "You want sharp mountain ridges from FBM. Taking `abs(noise)` per octave gives sharp creases — but are they peaks or valleys, and what one change flips them?",
    },
    a: {
      vi: "Là đáy: `abs()` lật nửa âm lên, nên các điểm đổi dấu thành điểm thấp nhất, có hình chữ V sắc ở đó. `1.0 - abs(noise)` biến chính các điểm đổi dấu đó thành điểm cao nhất — sống núi sắc.",
      en: "Valleys: `abs()` folds the negative half up, so the zero-crossings become the lowest points, with a sharp V there. `1.0 - abs(noise)` turns those same zero-crossings into the highest points — sharp ridges.",
    },
  },
  {
    id: "gain-toward-one",
    q: {
      vi: "Bạn tăng gain của FBM từ 0.5 lên 0.9 và kết quả thành lổn nhổn hạt, không còn hình khối lớn rõ ràng. Vì sao?",
      en: "You raise FBM's gain from 0.5 to 0.9 and the result turns grainy, with no clear large shapes. Why?",
    },
    a: {
      vi: "Gain là hệ số nhân vào biên độ của mỗi octave kế tiếp. Ở 0.9, các octave mịn tần số cao vẫn đóng góp gần bằng các octave thô, nên hạt nhỏ lấn át hình khối lớn mà các octave đầu dựng nên.",
      en: "Gain is the factor each next octave's amplitude is multiplied by. At 0.9 the fine, high-frequency octaves still contribute nearly as much as the coarse ones, so the small-scale grain drowns out the large shapes the first octaves set up.",
    },
  },
];
