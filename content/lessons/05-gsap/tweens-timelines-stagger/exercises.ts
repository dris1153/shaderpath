import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "timeline-position-arithmetic",
    kind: "concept",
    prompt: {
      vi: `Cho timeline sau:

\`\`\`js
const tl = gsap.timeline();
tl.to(".a", { x: 100, duration: 1 })
  .to(".b", { y: 40, duration: 0.6 }, "-=0.2")
  .to(".c", { opacity: 1, duration: 0.5 }, "<")
  .to(".d", { scale: 1, duration: 0.4 }, "+=0.3");
\`\`\`

Không chạy code, hãy tính thời điểm bắt đầu (tính bằng giây, kể từ lúc timeline bắt đầu) của từng tween \`.a\`, \`.b\`, \`.c\`, \`.d\`, rồi suy ra tổng thời lượng của cả timeline.`,
      en: `Given this timeline:

\`\`\`js
const tl = gsap.timeline();
tl.to(".a", { x: 100, duration: 1 })
  .to(".b", { y: 40, duration: 0.6 }, "-=0.2")
  .to(".c", { opacity: 1, duration: 0.5 }, "<")
  .to(".d", { scale: 1, duration: 0.4 }, "+=0.3");
\`\`\`

Without running the code, compute the start time (in seconds, from the timeline's own start) of each of \`.a\`, \`.b\`, \`.c\`, \`.d\`, then derive the total duration of the whole timeline.`,
    },
    hints: [
      {
        vi: `\`.a\` không có position parameter nên bắt đầu tại $t=0$. \`"-=0.2"\` trên \`.b\` neo vào thời điểm KẾT THÚC của tween ngay trước nó (\`.a\` kết thúc ở $t=1$), lùi lại $0.2$s — không neo vào lúc bắt đầu.`,
        en: `\`.a\` has no position parameter, so it starts at $t=0$. \`"-=0.2"\` on \`.b\` anchors to the END of the tween right before it (\`.a\` ends at $t=1$), pulled back $0.2$s — not to its start.`,
      },
      {
        vi: `\`"<"\` trên \`.c\` neo vào thời điểm BẮT ĐẦU của tween ngay trước nó (\`.b\`), không phải lúc \`.b\` kết thúc. \`"+=0.3"\` trên \`.d\` neo vào lúc KẾT THÚC của tween ngay trước nó (\`.c\`).`,
        en: `\`"<"\` on \`.c\` anchors to the START of the tween right before it (\`.b\`), not to when \`.b\` ends. \`"+=0.3"\` on \`.d\` anchors to the END of the tween right before it (\`.c\`).`,
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng .a chạy 0 → 1 và .b chạy 0.8 → 1.4",
        en: "I correctly computed .a running 0 → 1 and .b running 0.8 → 1.4",
      },
      {
        vi: "Tôi tính đúng .c chạy 0.8 → 1.3 (neo theo lúc .b BẮT ĐẦU, không phải kết thúc)",
        en: "I correctly computed .c running 0.8 → 1.3 (anchored to when .b STARTS, not ends)",
      },
      {
        vi: "Tôi tính đúng .d chạy 1.6 → 2.0 và suy ra tổng thời lượng timeline là 2.0 giây",
        en: "I correctly computed .d running 1.6 → 2.0 and derived a total timeline duration of 2.0 seconds",
      },
    ],
    solutionCode: `// .a: không có position -> mặc định bắt đầu tại t=0 (tween đầu tiên).
//     duration 1 -> chạy 0 -> 1.
//
// .b: "-=0.2" neo vào lúc KẾT THÚC của .a (t=1), lùi lại 0.2s -> bắt đầu
//     ở t=0.8. duration 0.6 -> chạy 0.8 -> 1.4.
//
// .c: "<" neo vào lúc BẮT ĐẦU của .b (t=0.8), không phải lúc .b kết thúc
//     -> .c cũng bắt đầu ở t=0.8. duration 0.5 -> chạy 0.8 -> 1.3.
//
// .d: "+=0.3" neo vào lúc KẾT THÚC của .c (t=1.3), cộng thêm 0.3s
//     -> bắt đầu ở t=1.6. duration 0.4 -> chạy 1.6 -> 2.0.
//
// Tổng thời lượng timeline = thời điểm KẾT THÚC MUỘN NHẤT trong 4 tween
// = max(1.0, 1.4, 1.3, 2.0) = 2.0 giây.`,
  },
  {
    id: "build-staggered-entrance",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`buildEntrance(items)\` nhận vào một mảng phần tử DOM, trả về một GSAP timeline: các phần tử fade-in và trượt lên từ \`y: 24\`, dùng \`stagger\` dạng object để toả từ phần tử giữa ra hai bên (\`from: "center"\`, \`each: 0.08\`), và dùng \`defaults\` của timeline để khai báo \`duration\`/\`ease\` đúng một lần thay vì lặp lại trên tween bên trong.`,
      en: `Write a \`buildEntrance(items)\` function taking an array of DOM elements, returning a GSAP timeline: the elements fade in and slide up from \`y: 24\`, using the object form of \`stagger\` to fan out from the middle element (\`from: "center"\`, \`each: 0.08\`), and using the timeline's \`defaults\` to declare \`duration\`/\`ease\` exactly once instead of repeating it on the inner tween.`,
    },
    starterCode: `import gsap from "gsap";

function buildEntrance(items: HTMLElement[]): gsap.core.Timeline {
  // TODO: tạo timeline với defaults { duration: 0.6, ease: "power2.out" }
  const tl = gsap.timeline();

  // TODO: from() trên items: opacity 0 -> 1, y: 24 -> 0, stagger dạng
  // object toả từ giữa (from: "center", each: 0.08)

  return tl;
}`,
    solutionCode: `import gsap from "gsap";

function buildEntrance(items: HTMLElement[]): gsap.core.Timeline {
  const tl = gsap.timeline({
    defaults: { duration: 0.6, ease: "power2.out" },
  });

  tl.from(items, {
    opacity: 0,
    y: 24,
    stagger: { each: 0.08, from: "center" },
  });

  return tl;
}`,
    hints: [
      {
        vi: `\`defaults\` nằm trong vars object truyền vào \`gsap.timeline({...})\`, không phải truyền riêng cho từng \`.to()\`/\`.from()\` bên trong.`,
        en: `\`defaults\` lives inside the vars object passed to \`gsap.timeline({...})\`, not passed separately to each inner \`.to()\`/\`.from()\`.`,
      },
      {
        vi: `\`from: "center"\` là một khoá bên trong object \`stagger\`, không phải một tham số riêng của \`.from()\`.`,
        en: `\`from: "center"\` is a key inside the \`stagger\` object, not a separate parameter of \`.from()\`.`,
      },
    ],
    checklist: [
      {
        vi: "Timeline được tạo với defaults chứa duration và ease, không lặp lại trên tween bên trong",
        en: "The timeline is created with defaults holding duration and ease, not repeated on the inner tween",
      },
      {
        vi: "items fade từ opacity 0 lên 1 và trượt từ y: 24 về y: 0",
        en: "Items fade from opacity 0 to 1 and slide from y: 24 to y: 0",
      },
      {
        vi: `stagger dùng dạng object với from: "center", không phải một số đơn giản`,
        en: `stagger uses the object form with from: "center", not a plain number`,
      },
    ],
  },
];
