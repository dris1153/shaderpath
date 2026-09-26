import type { ReviewCard } from "../../../types";

export const reviewCards: ReviewCard[] = [
  {
    id: "revert-before-resplit",
    q: {
      vi: "Một effect split một đoạn text và tạo tween, không có cleanup; dưới React Strict Mode nó chạy hai lần. Lần split thứ hai có làm `div` lồng nhau không, và điều gì thật sự hỏng?",
      en: "An effect splits some text and creates a tween, with no cleanup; under React Strict Mode it runs twice. Does the second split nest the `div`s, and what actually breaks?",
    },
    a: {
      vi: "Không lồng: mặc định SplitText khôi phục HTML gốc trước khi split lại. Cái hỏng là instance đầu vẫn sống — tween của nó chạy trên các node đã bị gỡ khỏi DOM, và nếu bật `autoSplit`, nó còn tự split lại khi resize, ghi đè split của instance sau. Gọi `split.revert()` và kill tween trong cleanup.",
      en: "No nesting: by default SplitText restores the original HTML before splitting again. What breaks is that the first instance lives on — its tween runs on nodes already removed from the DOM, and with `autoSplit` it even re-splits on resize, overwriting the second instance's split. Call `split.revert()` and kill the tween in the cleanup.",
    },
  },
  {
    id: "autosplit-stale-targets",
    q: {
      vi: "Bạn split theo dòng với `autoSplit: true` và tạo tween một lần từ `split.chars`. Sau khi resize, animation không còn tác dụng. Vì sao, và nên tạo tween ở đâu?",
      en: "You split by lines with `autoSplit: true` and create a tween once from `split.chars`. After a resize the animation does nothing. Why, and where should the tween be created?",
    },
    a: {
      vi: "`autoSplit` tách lại text khi resize và tạo element mới, còn tween đã chụp danh sách target cũ lúc được tạo — những node không còn trong DOM. Tạo tween bên trong `onSplit` và return nó, để SplitText tự revert tween đó ở lần split sau.",
      en: "`autoSplit` re-splits on resize and creates new elements, while the tween captured the old targets when it was created — nodes no longer in the DOM. Create the tween inside `onSplit` and return it, so SplitText reverts it on the next split.",
    },
  },
];
