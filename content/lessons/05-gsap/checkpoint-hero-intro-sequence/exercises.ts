import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-hero-intro-sequence",
    kind: "build",
    prompt: {
      vi: `Dàn dựng một timeline intro cho hero section: 3 hình khối trang trí, headline, sub-line và nút CTA — tất cả nằm trong một \`gsap.timeline\` duy nhất, sắp xếp bằng label, không phải nhiều tween gọi rời rạc.

Thứ tự bắt buộc: 3 hình khối bay vào từ các cạnh màn hình theo stagger; headline trồi lên bằng ease \`back\`; sub-line mờ dần hiện ra ở vị trí \`<0.2\` — tức 0.2 giây sau khi tween headline BẮT ĐẦU chạy, không phải sau khi nó kết thúc; CTA xuất hiện cuối cùng với một cú overshoot nhỏ hơn hoặc mạnh hơn headline tuỳ bạn chọn, miễn là rõ ràng là điểm nhấn cuối chuỗi. Mọi phần tử phải được ẩn bằng \`gsap.set\` trước khi timeline chạy để tránh FOUC, và nút Replay phải khởi động lại đúng timeline đó mà không đụng vào \`timeScale\` người dùng đã chọn.`,
      en: `Choreograph a hero-section intro timeline: 3 decorative shapes, a headline, a sub-line and a CTA button — all inside one single \`gsap.timeline\`, sequenced with labels instead of several separately-called tweens.

Required order: the 3 shapes fly in from the screen edges with a stagger; the headline rises in with a \`back\` ease; the sub-line fades in at the position \`<0.2\` — meaning 0.2 seconds after the headline tween STARTS, not after it finishes; the CTA appears last with a small overshoot, distinctly stronger than the headline's so it reads as the sequence's punchline. Every element must be hidden with \`gsap.set\` before the timeline runs to avoid FOUC, and the Replay button must restart that same timeline without touching whatever \`timeScale\` the user already picked.`,
    },
    starterCode: `import gsap from "gsap";

const heroScope = document.querySelector<HTMLElement>(".hero")!;
const shapes = gsap.utils.toArray<HTMLElement>(".shape", heroScope);
const headline = heroScope.querySelector<HTMLElement>(".hero-headline")!;
const subline = heroScope.querySelector<HTMLElement>(".hero-subline")!;
const cta = heroScope.querySelector<HTMLElement>(".hero-cta")!;
const replayBtn = document.querySelector<HTMLButtonElement>("#replay-btn")!;

let tl!: gsap.core.Timeline;

// gsap.context scopes every tween/set created inside setup() to heroScope so
// teardownHeroIntro() can revert ALL of them (tweens + inline styles) at once.
const ctx = gsap.context(() => {
  tl = gsap.timeline({ paused: true });

  // TODO 1: pre-hide every element with gsap.set BEFORE any .to() call.
  // Shapes start offset toward their entry edge (left/top/right); headline
  // starts lowered; subline and cta start at opacity 0 (cta also scaled down).

  // TODO 2: label "shapes" — stagger the 3 shapes back to rest (opacity 1,
  // xPercent/yPercent 0), each arriving from its own edge

  // TODO 3: label "headline" right after "shapes" — headline rises
  // (y -> 0) with a back ease

  // TODO 4: sub-line fades in using the "<0.2" position parameter — 0.2s
  // after the headline tween STARTS, not after it ends

  // TODO 5: label "cta" — CTA pops in last with a stronger overshoot ease
  // than the headline
}, heroScope);

tl.play();

replayBtn.addEventListener("click", () => {
  // TODO 6: restart tl WITHOUT calling tl.timeScale(...) here — respect
  // whatever playback speed a hypothetical speed control already set
});

// Call this when the hero section leaves the DOM (route change, unmount).
export function teardownHeroIntro() {
  ctx.revert();
}`,
    solutionCode: `import gsap from "gsap";

const heroScope = document.querySelector<HTMLElement>(".hero")!;
const shapes = gsap.utils.toArray<HTMLElement>(".shape", heroScope);
const headline = heroScope.querySelector<HTMLElement>(".hero-headline")!;
const subline = heroScope.querySelector<HTMLElement>(".hero-subline")!;
const cta = heroScope.querySelector<HTMLElement>(".hero-cta")!;
const replayBtn = document.querySelector<HTMLButtonElement>("#replay-btn")!;

let tl!: gsap.core.Timeline;

const ctx = gsap.context(() => {
  tl = gsap.timeline({ paused: true });

  gsap.set(shapes, {
    opacity: 0,
    xPercent: (i) => [-160, 0, 160][i],
    yPercent: (i) => [0, -160, 0][i],
  });
  gsap.set(headline, { opacity: 0, y: 32 });
  gsap.set(subline, { opacity: 0 });
  gsap.set(cta, { opacity: 0, scale: 0.6 });

  tl.addLabel("shapes")
    .to(
      shapes,
      {
        opacity: 1,
        xPercent: 0,
        yPercent: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.12,
      },
      "shapes",
    )
    .addLabel("headline", "shapes+=0.3")
    .to(
      headline,
      { opacity: 1, y: 0, duration: 0.7, ease: "back.out(1.7)" },
      "headline",
    )
    .to(subline, { opacity: 1, duration: 0.5, ease: "power2.out" }, "<0.2")
    .addLabel("cta", ">")
    .to(
      cta,
      { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2.8)" },
      "cta",
    );
}, heroScope);

tl.play();

replayBtn.addEventListener("click", () => {
  // restart(true) rewinds (including any startAt) and plays from 0 — it
  // never touches timeScale, so a user-picked playback speed survives replay
  tl.restart(true);
});

export function teardownHeroIntro() {
  ctx.revert();
}`,
    referenceImage: "/figures/05-gsap/checkpoint-hero-intro-sequence.svg",
    hints: [
      {
        vi: "Position parameter quyết định mọi thứ: \"shapes\" đặt một label tại đầu timeline hiện tại; \"<0.2\" nghĩa là 0.2 giây SAU KHI tween ngay trước nó bắt đầu, không phải sau khi kết thúc; không truyền tham số nào nghĩa là nối tiếp ngay sau tween trước — không cần cộng dồn delay thủ công.",
        en: "The position parameter controls everything: \"shapes\" places a label at the current end of the timeline; \"<0.2\" means 0.2 seconds AFTER the previous tween STARTS, not after it ends; passing no parameter means append right after the previous tween — no manual delay math needed.",
      },
      {
        vi: "Ease kể chuyện: power3.out/power2.out cho hình khối bay vào (dứt khoát, không nảy); back.out(1.7) cho headline (trồi lên hơi quá rồi ổn định — tạo cảm giác trọng lượng); back.out(2.8) mạnh hơn cho CTA vì nó là điểm nhấn cuối chuỗi; sub-line chỉ cần power2.out mờ dần, không dùng ease back vì nó không nên giành sự chú ý.",
        en: "Ease tells a story: power3.out/power2.out for the shapes flying in (decisive, no bounce); back.out(1.7) for the headline (rises slightly past rest then settles — reads as weight); a stronger back.out(2.8) for the CTA since it's the sequence's punchline; the sub-line just needs a plain power2.out fade — no back ease, since it shouldn't compete for attention.",
      },
      {
        vi: "Bọc toàn bộ gsap.set/.to bên trong gsap.context(() => {...}, heroScope) — ctx.revert() sau đó xoá cả tween lẫn style inline mà gsap.set đã ghi, nên gọi lại buildHeroIntro sau khi remount không bao giờ cộng dồn tween cũ chồng lên nhau.",
        en: "Wrap every gsap.set/.to call inside gsap.context(() => {...}, heroScope) — the later ctx.revert() removes both the tweens AND the inline styles gsap.set wrote, so rebuilding after a remount never stacks stale tweens on top of each other.",
      },
    ],
    checklist: [
      {
        vi: "Thứ tự đọc có chủ đích: hình khối → headline → sub-line → CTA, không có gì chạy đồng loạt lộn xộn",
        en: "The order reads intentionally: shapes → headline → sub-line → CTA, nothing fires simultaneously in a jumble",
      },
      {
        vi: "Không có FOUC — mọi phần tử được gsap.set về trạng thái ẩn trước khi tween đầu tiên chạy",
        en: "No FOUC — every element is gsap.set to a hidden state before the first tween runs",
      },
      {
        vi: "Nút Replay khởi động lại đúng timeline hiện có (tl.restart), không tạo lại toàn bộ timeline từ đầu mỗi lần bấm",
        en: "The Replay button restarts the existing timeline (tl.restart), it doesn't rebuild the whole timeline from scratch on every click",
      },
      {
        vi: "Replay tôn trọng timeScale — không có lệnh nào đặt lại tl.timeScale(1) khi bấm Replay",
        en: "Replay respects timeScale — no code path resets tl.timeScale(1) on click",
      },
      {
        vi: "Ease khớp vai trò: entrance dùng power/expo, headline và CTA dùng back với CTA overshoot rõ hơn, sub-line chỉ fade thuần",
        en: "Eases match role: entrance uses power/expo, headline and CTA use back with the CTA's overshoot clearly stronger, the sub-line is a plain fade",
      },
      {
        vi: "Có cleanup: toàn bộ tween được tạo trong gsap.context, và teardownHeroIntro() gọi ctx.revert() khi hero rời khỏi DOM",
        en: "There's cleanup: every tween is created inside gsap.context, and teardownHeroIntro() calls ctx.revert() when the hero leaves the DOM",
      },
    ],
  },
];
