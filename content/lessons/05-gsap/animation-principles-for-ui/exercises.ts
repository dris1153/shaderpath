import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "diagnose-overused-pulse",
    kind: "concept",
    prompt: {
      vi: `Một nút "Lưu" trong trình soạn thảo phát một animation pulse: scale từ $1$ lên $1.15$ rồi về $1$ trong 400ms, chạy mỗi lần người dùng bấm lưu — trung bình người dùng bấm nút này khoảng 30 lần mỗi phiên làm việc.

Không cần viết code, hãy chỉ ra animation này vi phạm điều gì trong bài (cả về thang thời gian lẫn về biên độ chuyển động), và đề xuất một con số duration cùng biên độ scale hợp lý hơn cho đúng ngữ cảnh "phản hồi lặp lại thường xuyên".`,
      en: `A "Save" button in a text editor plays a pulse animation: scale from $1$ up to $1.15$ then back to $1$ over 400ms, firing every time the user clicks save — users click this button roughly 30 times per session on average.

Without writing code, identify what this animation violates from the lesson (both the timing scale and the motion amplitude), and propose a more sensible duration and scale amplitude for a "frequently-repeated feedback" context.`,
    },
    hints: [
      {
        vi: "So sánh 400ms với ba nhóm thang thời gian trong bài — thao tác 'bấm lưu' thuộc nhóm nào trong ba nhóm đó?",
        en: "Compare 400ms against the lesson's three timing bands — which band does a 'save button click' actually belong to?",
      },
      {
        vi: "Biên độ scale 1.15 hợp lý cho một hero moment chạy đúng một lần, không phải phản hồi lặp lại 30 lần/phiên — nhớ lại Lỗi hay gặp #1.",
        en: "A 1.15 scale amplitude is reasonable for a hero moment that plays exactly once, not a response repeated 30 times a session — recall mistake #1.",
      },
    ],
    checklist: [
      {
        vi: "Tôi xác định đúng 400ms rơi gần dải hero moment, trong khi bấm Lưu thực chất là phản hồi tức thời (100-150ms)",
        en: "I correctly identified that 400ms sits near the hero-moment band, while a Save click is actually instant feedback (100-150ms)",
      },
      {
        vi: "Tôi đề xuất giảm duration xuống khoảng 120-150ms và biên độ scale nhỏ hơn nhiều (ví dụ 1.04-1.06 thay vì 1.15)",
        en: "I proposed dropping the duration to roughly 120-150ms and a much smaller scale amplitude (e.g. 1.04-1.06 instead of 1.15)",
      },
      {
        vi: "Tôi giải thích được vì sao biên độ lớn hợp lý cho hero moment (chạy một lần) nhưng gây khó chịu cho một hành động lặp lại hàng chục lần mỗi phiên",
        en: "I explained why a large amplitude works for a hero moment (plays once) but becomes annoying for an action repeated dozens of times per session",
      },
    ],
    solutionCode: `// Vi pham: ca thang thoi gian lan bien do.
//
// - 400ms gan voi dai "hero moment" (400-700ms, chi nen dung cho thu chay
//   DUNG MOT LAN), trong khi bam "Luu" la phan hoi tuc thoi thuc su --
//   dai dung la 100-150ms.
// - Bien do scale 1.15 la muc gay chu y manh, hop ly cho mot khoanh khac
//   an tuong duy nhat, khong hop ly cho hanh dong lap lai ~30 lan/phien
//   (Loi hay gap #1: bien do lon cho thao tac lap lai gay kho chiu).
//
// De xuat: duration ~120-150ms, scale dinh ~1.04-1.06, ease "power1.out"
// -- van la mot tin hieu phan hoi ro rang, nhung khong con la mot "man
// trinh dien" moi lan nguoi dung lam dung viec ho lam hang chuc lan/ngay.`,
  },
  {
    id: "stagger-is-overlap-fn",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`staggerDelays(count, staggerMs)\` trả về một mảng độ trễ (ms) cho \`count\` phần tử, đúng cơ chế overlapping action: phần tử thứ \`i\` (đánh số từ 0) có độ trễ \`i * staggerMs\` so với phần tử đầu tiên. Sau đó viết \`totalSequenceMs(count, staggerMs, tweenDurationMs)\` trả về tổng thời gian tính từ lúc phần tử đầu tiên bắt đầu đến lúc phần tử CUỐI CÙNG kết thúc animation của chính nó.`,
      en: `Write a function \`staggerDelays(count, staggerMs)\` that returns an array of delays (ms) for \`count\` elements, matching overlapping action exactly: element \`i\` (0-indexed) is delayed \`i * staggerMs\` relative to the first element. Then write \`totalSequenceMs(count, staggerMs, tweenDurationMs)\` returning the total time from when the first element starts to when the LAST element finishes its own animation.`,
    },
    starterCode: `function staggerDelays(count: number, staggerMs: number): number[] {
  // TODO: return [0, staggerMs, 2*staggerMs, ...] for \`count\` elements
  return [];
}

function totalSequenceMs(count: number, staggerMs: number, tweenDurationMs: number): number {
  // TODO: last element's own delay + its own tween duration
  return 0;
}`,
    solutionCode: `function staggerDelays(count: number, staggerMs: number): number[] {
  return Array.from({ length: count }, (_, i) => i * staggerMs);
}

function totalSequenceMs(count: number, staggerMs: number, tweenDurationMs: number): number {
  const lastDelay = (count - 1) * staggerMs;
  return lastDelay + tweenDurationMs;
}`,
    hints: [
      {
        vi: "`Array.from({ length: count }, (_, i) => ...)` là cách gọn để tạo mảng độ trễ tăng dần mà không cần vòng lặp thủ công.",
        en: "`Array.from({ length: count }, (_, i) => ...)` is a compact way to build an increasing-delay array without a manual loop.",
      },
      {
        vi: "Phần tử cuối cùng có index `count - 1` — độ trễ của nó là `(count-1) * staggerMs`, CỘNG THÊM thời lượng tween riêng nó mới ra thời điểm nó THỰC SỰ kết thúc.",
        en: "The last element has index `count - 1` — its delay is `(count-1) * staggerMs`, PLUS its own tween duration gives the moment it ACTUALLY finishes.",
      },
    ],
    checklist: [
      {
        vi: "`staggerDelays(4, 60)` trả về `[0, 60, 120, 180]`",
        en: "`staggerDelays(4, 60)` returns `[0, 60, 120, 180]`",
      },
      {
        vi: "`totalSequenceMs(4, 60, 300)` trả về `480` (180 + 300), không phải `300` hay `180`",
        en: "`totalSequenceMs(4, 60, 300)` returns `480` (180 + 300), not `300` or `180`",
      },
      {
        vi: "Tôi giải thích được vì sao tổng thời gian sequence luôn dài hơn thời lượng một tween đơn lẻ khi có stagger — đúng bản chất overlapping action",
        en: "I explained why the total sequence duration is always longer than a single tween's duration once stagger is applied — the very nature of overlapping action",
      },
    ],
  },
];
