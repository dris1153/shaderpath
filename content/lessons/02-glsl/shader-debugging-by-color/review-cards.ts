import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "signed-values-clip-to-black",
    q: {
      vi: "Xuất `vec3(n.x)` ra màu để xem pháp tuyến, và nửa hình đen kịt. Kết luận “ở đó `n.x` bằng 0” có đúng không, và nên xuất gì?",
      en: "You output `vec3(n.x)` as a color to inspect the normal, and half the shape is solid black. Is “`n.x` is 0 there” the right conclusion, and what should you output?",
    },
    a: {
      vi: "Chưa chắc: màu âm bị clamp về 0, nên nửa âm của `n.x` đã bị cắt mất. Remap trước: `n.x * 0.5 + 0.5` — xám giữa là 0, tối hơn là âm, sáng hơn là dương.",
      en: "Not necessarily: negative colors are clamped to 0, so the negative half of `n.x` is simply cut off. Remap first: `n.x * 0.5 + 0.5` — mid-grey is 0, darker is negative, lighter is positive.",
    },
  },
  {
    id: "probe-the-middle",
    q: {
      vi: "Một shader dài nhiều bước ra màu đen ở cuối. Probe ở đâu trước tiên, và vì sao không dò từ dòng đầu?",
      en: "A long, many-step shader ends up black. Where do you probe first, and why not start from the top?",
    },
    a: {
      vi: "Ở giữa pipeline: xuất giá trị trung gian tại đó ra màu. Nếu nó đã sai, lỗi nằm ở nửa đầu; nếu đúng, ở nửa sau. Mỗi lần probe loại được một nửa số nghi phạm — số bước dò giảm từ $O(n)$ xuống $O(\\log n)$.",
      en: "In the middle of the pipeline: output the intermediate value there as a color. If it is already wrong, the bug is in the first half; if right, in the second. Each probe rules out half the suspects — from $O(n)$ steps down to $O(\\log n)$.",
    },
  },
];
