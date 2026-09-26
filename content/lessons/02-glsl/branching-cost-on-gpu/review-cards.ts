import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "uniform-branch-is-cheap",
    q: {
      vi: "`if (uMode == 1) { ... } else { ... }` với `uMode` là uniform. Nhánh này tốn bao nhiêu, và có nên viết lại bằng `mix`/`step` không?",
      en: "`if (uMode == 1) { ... } else { ... }` where `uMode` is a uniform. How much does this branch cost, and should it be rewritten with `mix`/`step`?",
    },
    a: {
      vi: "Gần như không tốn gì: mọi lane trong warp có cùng giá trị uniform nên cả warp đi cùng một nhánh, không phân kỳ. Viết branchless ở đây không nhanh hơn, chỉ khó đọc hơn.",
      en: "Almost nothing: every lane in a warp sees the same uniform value, so the whole warp takes the same branch, with no divergence. Going branchless here is no faster, just harder to read.",
    },
  },
  {
    id: "divergence-is-about-mixing",
    q: {
      vi: "90% pixel đi nhánh A, 10% đi nhánh B, và hai nhóm xen kẽ lẫn nhau khắp màn hình. Như vậy có rẻ hơn chia 50/50 không, và vì sao?",
      en: "90% of pixels take branch A and 10% take branch B, with the two groups interleaved all over the screen. Is that cheaper than a 50/50 split, and why?",
    },
    a: {
      vi: "Không. Warp nào chứa cả hai loại lane đều phải chạy cả hai nhánh, dù chỉ một lane đi nhánh B — điều quyết định là có trộn lẫn trong warp hay không, không phải tỉ lệ. Chia màn hình thành nửa trái/nửa phải thì gần như miễn phí, vì hầu hết warp nằm gọn trong một nửa.",
      en: "No. Any warp holding both kinds of lane must run both branches, even if only one lane takes B — what matters is mixing within a warp, not the ratio. Splitting the screen into left and right halves is nearly free, because most warps sit entirely in one half.",
    },
  },
];
