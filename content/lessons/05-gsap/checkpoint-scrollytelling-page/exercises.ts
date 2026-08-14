import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-scrollytelling-page",
    kind: "build",
    prompt: {
      vi: `Dựng một **trang scrollytelling hoàn chỉnh** tổng hợp toàn bộ track GSAP. Assume DOM đã có sẵn: \`#scroller\` (\`overflow-y: auto\`, chiều cao cố định) chứa \`.hero\` (\`.hero-title\`, \`.hero-sub\`, \`.hero-cta\`), \`.chapter-a\` (chứa \`.shape\`), \`.chapter-b\` (chứa \`.headline\` với textContent thô, chưa tách ký tự), \`.chapter-c\` (chứa \`.card-grid\` với vài \`.card\`), cộng \`#nav-up\`/\`#nav-down\` bên ngoài scroller.

Yêu cầu: (1) hero timeline tự chạy khi tải trang, không cần cuộn; (2) chapter A ghim và scrub theo cuộn (transform-only); (3) chapter B tách \`.headline\` thành từng ký tự thủ công (không dùng SplitText plugin) rồi stagger vào bằng \`toggleActions: "play reverse play reverse"\`, không scrub; (4) chapter C dùng Flip đổi layout \`.card-grid\` khi cuộn tới một điểm cố định — \`Flip.getState\` phải chạy TRƯỚC khi đổi class; (5) \`#nav-up\`/\`#nav-down\` và một Observer (wheel/touch) cùng gọi một hàm \`goToChapter\` chung, không \`preventDefault\` để không chặn cuộn tự nhiên của chapter A; (6) \`gsap.matchMedia()\` tách nhánh \`prefers-reduced-motion: reduce\` (set thẳng trạng thái cuối) khỏi nhánh đầy đủ.`,
      en: `Build a **complete scrollytelling page** synthesizing the whole GSAP track. Assume the DOM already exists: \`#scroller\` (\`overflow-y: auto\`, fixed height) containing \`.hero\` (\`.hero-title\`, \`.hero-sub\`, \`.hero-cta\`), \`.chapter-a\` (containing \`.shape\`), \`.chapter-b\` (containing \`.headline\` with raw textContent, not yet split), \`.chapter-c\` (containing \`.card-grid\` with a few \`.card\` elements), plus \`#nav-up\`/\`#nav-down\` outside the scroller.

Requirements: (1) the hero timeline plays on page load, no scroll needed; (2) chapter A pins and scrubs with scroll (transform-only); (3) chapter B manually splits \`.headline\` into individual characters (no SplitText plugin) then staggers them in via \`toggleActions: "play reverse play reverse"\`, not scrubbed; (4) chapter C uses Flip to change \`.card-grid\`'s layout once scroll reaches a fixed point — \`Flip.getState\` must run BEFORE the class change; (5) \`#nav-up\`/\`#nav-down\` and an Observer (wheel/touch) both call one shared \`goToChapter\` function, without \`preventDefault\` so chapter A's native scrubbing scroll keeps working; (6) \`gsap.matchMedia()\` separates the \`prefers-reduced-motion: reduce\` branch (sets the final state directly) from the full animation branch.`,
    },
    starterCode: `import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Observer } from "gsap/Observer";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(ScrollTrigger, Observer, Flip);

// Assumed DOM (already in the page): #scroller > .hero (.hero-title,
// .hero-sub, .hero-cta), .chapter-a > .shape, .chapter-b > .headline,
// .chapter-c > .card-grid (a few .card children), plus #nav-up/#nav-down
// buttons outside the scroller.
const scroller = document.querySelector<HTMLElement>("#scroller")!;
const heroTitle = document.querySelector<HTMLElement>(".hero-title")!;
const heroSub = document.querySelector<HTMLElement>(".hero-sub")!;
const heroCta = document.querySelector<HTMLElement>(".hero-cta")!;
const chapterA = document.querySelector<HTMLElement>(".chapter-a")!;
const shape = chapterA.querySelector<HTMLElement>(".shape")!;
const chapterB = document.querySelector<HTMLElement>(".chapter-b")!;
const headline = chapterB.querySelector<HTMLElement>(".headline")!;
const chapterC = document.querySelector<HTMLElement>(".chapter-c")!;
const cardGrid = chapterC.querySelector<HTMLElement>(".card-grid")!;
const navUp = document.querySelector<HTMLButtonElement>("#nav-up")!;
const navDown = document.querySelector<HTMLButtonElement>("#nav-down")!;

// TODO 1: manual split (no SplitText) -- wrap every character of
// headline.textContent in its own <span class="char">, write back via
// innerHTML, then collect them with
// gsap.utils.toArray<HTMLElement>(".char", headline)
const chars: HTMLElement[] = [];

let animCtx: gsap.Context;

function setFlipLayout(stacked: boolean) {
  // TODO 2: Flip.getState MUST run before the class toggle below, or Flip
  // captures the layout AFTER it already changed and has nothing to invert
  cardGrid.classList.toggle("stacked", stacked);
}

export function buildScrollytellingPage() {
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: reduce)", () => {
    // TODO 3: gsap.set every animated element straight to its final state
    // (hero, chars, shape) -- no tweens, no ScrollTrigger, no Flip here
  });

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    animCtx = gsap.context(() => {
      // TODO 4: hero timeline -- plays once on load, NOT scroll-driven

      // TODO 5: chapter A -- pin: true + scrub: true ScrollTrigger on
      // \`shape\`, transform-only (x/scale), scroller must be the internal
      // #scroller, never window

      // TODO 6: chapter B -- gsap.set \`chars\` hidden, then stagger them in
      // via a ScrollTrigger with toggleActions: "play reverse play reverse"
      // (not scrubbed)

      // TODO 7: chapter C -- ScrollTrigger.create with onEnter/onLeaveBack
      // calling setFlipLayout(true/false) at a fixed scroll point
    }, scroller);
  });
}

function chapterOffsets(): number[] {
  return [0, chapterA.offsetTop, chapterB.offsetTop, chapterC.offsetTop];
}

function goToChapter(delta: number) {
  // TODO 8: find the chapter closest to the current scrollTop, clamp
  // currentIndex + delta to a valid chapter, then gsap.to(scroller,
  // {scrollTop: ...}) there (duration 0 if prefers-reduced-motion: reduce)
}

navUp.addEventListener("click", () => goToChapter(-1));
navDown.addEventListener("click", () => goToChapter(1));

// TODO 9: Observer.create on \`scroller\`, type "wheel,touch" -- onDown goes
// to the next chapter, onUp to the previous one. Do NOT preventDefault:
// chapter A's pin+scrub still needs native scroll deltas to work.

export function teardownScrollytellingPage() {
  // TODO 10: revert animCtx and kill the Observer created in TODO 9
}

buildScrollytellingPage();`,
    solutionCode: `import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Observer } from "gsap/Observer";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(ScrollTrigger, Observer, Flip);

const scroller = document.querySelector<HTMLElement>("#scroller")!;
const heroTitle = document.querySelector<HTMLElement>(".hero-title")!;
const heroSub = document.querySelector<HTMLElement>(".hero-sub")!;
const heroCta = document.querySelector<HTMLElement>(".hero-cta")!;
const chapterA = document.querySelector<HTMLElement>(".chapter-a")!;
const shape = chapterA.querySelector<HTMLElement>(".shape")!;
const chapterB = document.querySelector<HTMLElement>(".chapter-b")!;
const headline = chapterB.querySelector<HTMLElement>(".headline")!;
const chapterC = document.querySelector<HTMLElement>(".chapter-c")!;
const cardGrid = chapterC.querySelector<HTMLElement>(".card-grid")!;
const navUp = document.querySelector<HTMLButtonElement>("#nav-up")!;
const navDown = document.querySelector<HTMLButtonElement>("#nav-down")!;

// Manual split (no SplitText): wrap each character in its own span so GSAP
// can stagger them individually.
headline.innerHTML = headline.textContent!
  .split("")
  .map((ch) => \`<span class="char">\${ch === " " ? "&nbsp;" : ch}</span>\`)
  .join("");
const chars = gsap.utils.toArray<HTMLElement>(".char", headline);

let animCtx: gsap.Context;

function setFlipLayout(stacked: boolean) {
  const state = Flip.getState(cardGrid.children);
  cardGrid.classList.toggle("stacked", stacked);
  Flip.from(state, { duration: 0.6, ease: "power2.inOut", stagger: 0.04 });
}

export function buildScrollytellingPage() {
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set([heroTitle, heroSub, heroCta], { autoAlpha: 1, y: 0 });
    gsap.set(chars, { autoAlpha: 1, y: 0 });
    gsap.set(shape, { x: 0, scale: 1 });
  });

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    animCtx = gsap.context(() => {
      // Hero: plays once on load, no ScrollTrigger involved.
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(heroTitle, { autoAlpha: 0, y: 24, duration: 0.7 })
        .from(heroSub, { autoAlpha: 0, y: 16, duration: 0.6 }, "-=0.35")
        .from(heroCta, { autoAlpha: 0, y: 12, duration: 0.5 }, "-=0.3");

      // Chapter A: pinned + scrubbed, transform-only.
      gsap.set(shape, { x: 0, scale: 1 });
      gsap.to(shape, {
        x: 220,
        scale: 1.6,
        ease: "none",
        scrollTrigger: {
          trigger: chapterA,
          scroller,
          pin: true,
          start: "top top",
          end: "+=600",
          scrub: true,
        },
      });

      // Chapter B: toggleActions reveal, staggered per-character headline.
      gsap.set(chars, { autoAlpha: 0, y: 20 });
      gsap.to(chars, {
        autoAlpha: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.02,
        ease: "power2.out",
        scrollTrigger: {
          trigger: chapterB,
          scroller,
          start: "top 70%",
          toggleActions: "play reverse play reverse",
        },
      });

      // Chapter C: Flip layout change fired once scroll reaches a fixed
      // point (this journey's "label" -- a threshold, not a timeline label).
      ScrollTrigger.create({
        trigger: chapterC,
        scroller,
        start: "top 60%",
        onEnter: () => setFlipLayout(true),
        onLeaveBack: () => setFlipLayout(false),
      });
    }, scroller);
  });
}

function chapterOffsets(): number[] {
  return [0, chapterA.offsetTop, chapterB.offsetTop, chapterC.offsetTop];
}

function goToChapter(delta: number) {
  const offsets = chapterOffsets();
  const current = scroller.scrollTop;
  const currentIndex = offsets.reduce(
    (closest, y, i) =>
      Math.abs(y - current) < Math.abs(offsets[closest] - current) ? i : closest,
    0,
  );
  const nextIndex = Math.min(Math.max(currentIndex + delta, 0), offsets.length - 1);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.to(scroller, {
    scrollTop: offsets[nextIndex],
    duration: reduced ? 0 : 0.6,
    ease: "power2.inOut",
  });
}

navUp.addEventListener("click", () => goToChapter(-1));
navDown.addEventListener("click", () => goToChapter(1));

// Observer must NOT preventDefault: chapter A's pin+scrub needs native
// scroll deltas to keep working -- Observer only adds a discrete jump on
// top of normal scrolling, it doesn't replace it.
const navObserver = Observer.create({
  target: scroller,
  type: "wheel,touch",
  tolerance: 12,
  onDown: () => goToChapter(1),
  onUp: () => goToChapter(-1),
});

export function teardownScrollytellingPage() {
  animCtx?.revert();
  navObserver.kill();
}

buildScrollytellingPage();`,
    hints: [
      {
        vi: "gsap.matchMedia() nhận hai media query riêng — nhánh 'no-preference' chứa toàn bộ timeline/scrub/stagger/flip, nhánh 'reduce' chỉ gsap.set thẳng về trạng thái cuối, không tween gì cả.",
        en: "gsap.matchMedia() takes two separate media queries — the 'no-preference' branch holds all the timeline/scrub/stagger/flip logic, the 'reduce' branch just gsap.set()s straight to the final state, no tweening at all.",
      },
      {
        vi: "Flip.getState phải gọi TRƯỚC khi đổi class layout; đổi class trước rồi mới getState sẽ chụp nhầm trạng thái ĐÃ đổi, Flip không còn gì để nội suy ngược.",
        en: "Flip.getState must be called BEFORE the layout class changes; calling it after captures the state that's ALREADY changed, leaving Flip nothing to invert and interpolate from.",
      },
      {
        vi: "Observer và scroll tự nhiên của trình duyệt chạy song song có chủ đích ở đây: đừng preventDefault trong Observer.create, nếu không chapter A (pin+scrub) mất khả năng cuộn liên tục để scrub timeline.",
        en: "Observer and the browser's native scroll run in parallel on purpose here: don't preventDefault in Observer.create, or chapter A (pin+scrub) loses the continuous scroll it needs to scrub its timeline.",
      },
    ],
    checklist: [
      {
        vi: "Hero timeline tự chạy khi trang tải xong, không cần cuộn để kích hoạt",
        en: "The hero timeline plays automatically once the page loads, no scrolling needed to trigger it",
      },
      {
        vi: "Chapter A ghim đúng lúc và scrub mượt theo vị trí cuộn, không giật layout khi bắt đầu pin",
        en: "Chapter A pins at the right moment and scrubs smoothly with scroll position, no layout jump when pinning starts",
      },
      {
        vi: "Chapter B: từng ký tự headline stagger vào đúng thứ tự khi cuộn tới, và animate ngược lại khi cuộn ngược ra khỏi (toggleActions)",
        en: "Chapter B: each headline character staggers in, in order, when scrolled into view, and reverses when scrolled back out (toggleActions)",
      },
      {
        vi: "Chapter C: cuộn/bấm tới điểm trigger đổi .card-grid từ layout thường sang stacked (và ngược lại) bằng Flip, các card trượt mượt sang vị trí mới thay vì nhảy cóc",
        en: "Chapter C: scrolling/reaching the trigger point switches .card-grid from its normal layout to stacked (and back) via Flip, cards sliding smoothly to their new positions instead of jumping",
      },
      {
        vi: "Mũi tên #nav-up/#nav-down và cử chỉ Observer (wheel/touch) đều nhảy đúng một chapter mỗi lần, không nhảy quá hoặc thiếu",
        en: "The #nav-up/#nav-down arrows and Observer gestures (wheel/touch) both jump exactly one chapter at a time, never overshooting or falling short",
      },
      {
        vi: "Bật 'prefers-reduced-motion: reduce' (DevTools rendering tab) tắt hoàn toàn pin/scrub/stagger/flip, nội dung hiện thẳng ở trạng thái cuối",
        en: "Enabling 'prefers-reduced-motion: reduce' (DevTools rendering tab) fully disables pin/scrub/stagger/flip, content appears directly in its final state",
      },
      {
        vi: "Mọi animation chỉ dùng transform/opacity qua autoAlpha — không có width/top/left nào bị animate ở bất kỳ chapter nào",
        en: "Every animation uses only transform/opacity via autoAlpha — no width/top/left is animated in any chapter",
      },
      {
        vi: "teardownScrollytellingPage() dọn sạch toàn bộ ScrollTrigger/pin spacer (animCtx.revert()) và huỷ Observer (navObserver.kill()) — không còn nghe sự kiện thừa",
        en: "teardownScrollytellingPage() cleans up every ScrollTrigger/pin spacer (animCtx.revert()) and kills the Observer (navObserver.kill()) — no leftover event listeners",
      },
    ],
  },
];
