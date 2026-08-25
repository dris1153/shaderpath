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
        vi: `\`.a\` không có position parameter — mặc định nối vào CUỐI TIMELINE hiện tại (lúc đó là $t=0$). \`"-=0.2"\` trên \`.b\` cũng neo vào cuối timeline (lúc đó là $1.0$, do \`.a\` đặt ra), lùi lại $0.2$s — mốc neo là cuối timeline, không phải "tween ngay trước".`,
        en: `\`.a\` has no position parameter — by default it appends at the CURRENT END OF THE TIMELINE (which is $t=0$ then). \`"-=0.2"\` on \`.b\` also anchors to the timeline's end (then $1.0$, set by \`.a\`), pulled back $0.2$s — the anchor is the timeline's end, not "the previous tween".`,
      },
      {
        vi: `\`"<"\` trên \`.c\` neo vào lúc BẮT ĐẦU của animation vừa thêm gần nhất (\`.b\`) — chỉ \`"<"\`/\`">"\` mới tham chiếu tween trước. \`"+=0.3"\` trên \`.d\` quay lại neo CUỐI TIMELINE: là điểm kết thúc muộn nhất trong các tween đã thêm, không nhất thiết là lúc \`.c\` kết thúc.`,
        en: `\`"<"\` on \`.c\` anchors to the START of the most recently added animation (\`.b\`) — only \`"<"\`/\`">"\` reference the previous tween. \`"+=0.3"\` on \`.d\` anchors to the TIMELINE'S END again: the latest end time among all added tweens, not necessarily when \`.c\` ends.`,
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
        vi: "Tôi tính đúng .d chạy 1.7 → 2.1 (neo vào cuối timeline 1.4 do .b đặt ra, không phải lúc .c kết thúc ở 1.3) và suy ra tổng thời lượng timeline là 2.1 giây",
        en: "I correctly computed .d running 1.7 → 2.1 (anchored to the timeline's end 1.4 set by .b, not .c's end at 1.3) and derived a total timeline duration of 2.1 seconds",
      },
    ],
    solutionNote: {
      vi: `\`.a\`: không có position -> nối vào cuối timeline hiện tại, tức $t=0$ (timeline còn rỗng). duration 1 -> chạy $0 \\to 1$; cuối timeline giờ là $1.0$.

\`.b\`: \`"-=0.2"\` neo vào CUỐI TIMELINE ($1.0$), lùi lại $0.2$s -> bắt đầu ở $t=0.8$. duration 0.6 -> chạy $0.8 \\to 1.4$; cuối timeline giờ là $1.4$. (Con số trùng với "cuối \`.a\`" chỉ vì \`.a\` đang là tween kết thúc muộn nhất.)

\`.c\`: \`"<"\` neo vào lúc BẮT ĐẦU của animation vừa thêm gần nhất (\`.b\`, $t=0.8$) -> \`.c\` cũng bắt đầu ở $t=0.8$. duration 0.5 -> chạy $0.8 \\to 1.3$; cuối timeline vẫn là $1.4$.

\`.d\`: \`"+=0.3"\` neo vào CUỐI TIMELINE — là $1.4$ (do \`.b\`), KHÔNG phải lúc \`.c\` kết thúc ($1.3$) -> bắt đầu ở $t=1.7$. duration 0.4 -> chạy $1.7 \\to 2.1$.

Tổng thời lượng timeline = thời điểm KẾT THÚC MUỘN NHẤT = $\\max(1.0, 1.4, 1.3, 2.1) = 2.1$ giây.

Quy tắc chung: position bỏ trống và \`"+=x"\`/\`"-=x"\` đều neo vào cuối timeline; chỉ \`"<"\`/\`">"\` tham chiếu animation vừa thêm gần nhất.`,
      en: `\`.a\`: no position -> appended at the timeline's current end, i.e. $t=0$ (the timeline is empty). duration 1 -> runs $0 \\to 1$; the timeline's end is now $1.0$.

\`.b\`: \`"-=0.2"\` anchors to the TIMELINE'S END ($1.0$), pulled back $0.2$s -> starts at $t=0.8$. duration 0.6 -> runs $0.8 \\to 1.4$; the timeline's end is now $1.4$. (The number coincides with "\`.a\`'s end" only because \`.a\` is the latest-ending tween so far.)

\`.c\`: \`"<"\` anchors to the START of the most recently added animation (\`.b\`, $t=0.8$) -> \`.c\` also starts at $t=0.8$. duration 0.5 -> runs $0.8 \\to 1.3$; the timeline's end is still $1.4$.

\`.d\`: \`"+=0.3"\` anchors to the TIMELINE'S END — $1.4$ (set by \`.b\`), NOT \`.c\`'s end ($1.3$) -> starts at $t=1.7$. duration 0.4 -> runs $1.7 \\to 2.1$.

Total timeline duration = the LATEST end time = $\\max(1.0, 1.4, 1.3, 2.1) = 2.1$ seconds.

General rule: an omitted position and \`"+=x"\`/\`"-=x"\` all anchor to the timeline's end; only \`"<"\`/\`">"\` reference the most recently added animation.`,
    },
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
  // TODO: create a timeline with defaults { duration: 0.6, ease: "power2.out" }
  const tl = gsap.timeline();

  // TODO: from() on items: opacity 0 -> 1, y: 24 -> 0, object-form stagger
  // fanning out from the middle (from: "center", each: 0.08)

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
