import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-pinned-scrub-section",
    kind: "build",
    prompt: {
      vi: `Dựng một **section cuộn ghim, scrub theo 3 giai đoạn** bằng GSAP + ScrollTrigger. Assume DOM đã có sẵn: một scroller nội bộ \`#scroller\` (\`overflow-y: auto\`, chiều cao cố định), bên trong có \`.panel\` (phần tử sẽ pin) chứa \`.headline\`, vài \`.shape\`, và vài phần tử \`[data-count]\` hiển thị số liệu thống kê.

Yêu cầu: panel ghim (pin) trong lúc cuộn scrub qua đúng một timeline 3 giai đoạn — headline hiện ra bằng mask reveal (\`yPercent\` + \`autoAlpha\`, không dùng \`clip-path\`/\`width\`), \`.shape\` stagger vào bằng scale/opacity, các \`[data-count]\` đếm lên tới giá trị đích bằng cách tween một object thường \`{ value: 0 }\` rồi ghi số đã làm tròn vào \`textContent\`. Scroll snap phải dừng đúng tại ranh giới mỗi giai đoạn bằng \`snap: { snapTo: "labels" }\`. \`scroller\` của ScrollTrigger phải trỏ về \`#scroller\`, không phải \`window\`. Dùng \`markers: true\` lúc chỉnh sửa, tắt trước khi hoàn thành.`,
      en: `Build a **pinned, scroll-scrubbed section** with GSAP + ScrollTrigger. Assume the DOM already exists: an internal scroller \`#scroller\` (\`overflow-y: auto\`, fixed height) containing \`.panel\` (the element that pins), which itself contains \`.headline\`, a few \`.shape\` elements, and a few \`[data-count]\` elements showing stats.

Requirements: the panel pins while scroll scrubs through exactly one 3-phase timeline — the headline reveals via a mask trick (\`yPercent\` + \`autoAlpha\`, never \`clip-path\`/\`width\`), \`.shape\` elements stagger in via scale/opacity, and \`[data-count]\` elements count up to their target by tweening a plain \`{ value: 0 }\` object and writing the rounded number to \`textContent\`. Scroll snap must land exactly on each phase boundary using \`snap: { snapTo: "labels" }\`. ScrollTrigger's \`scroller\` must point at \`#scroller\`, never \`window\`. Use \`markers: true\` while tuning, then turn it off before calling it done.`,
    },
    starterCode: `import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const scroller = document.querySelector<HTMLElement>("#scroller")!;
const panel = document.querySelector<HTMLElement>(".panel")!;
const headline = panel.querySelector<HTMLElement>(".headline")!;
const shapes = gsap.utils.toArray<HTMLElement>(".shape", panel);
const stats = gsap.utils.toArray<HTMLElement>("[data-count]", panel);
const targets = [10, 240, 60]; // stat target values, same order as "stats"

let ctx: gsap.Context;

export function buildScrollSection() {
  ctx = gsap.context(() => {
    // TODO 1: gsap.set headline offscreen (yPercent + autoAlpha), shapes at
    // scale 0.8 + autoAlpha 0 -- everything hidden BEFORE the timeline runs

    // TODO 2: build a gsap.timeline() with three addLabel() calls
    // ("headline", "shapes", "stats") -- headline reveal (yPercent +
    // autoAlpha), shapes stagger in (scale + autoAlpha), then for each stat
    // tween a plain {value: 0} object toward its target and write the
    // rounded value into the matching [data-count] element in onUpdate

    // TODO 3: ScrollTrigger.create -- trigger: panel, scroller (the
    // #scroller element, NEVER window), pin: true, scrub, snap: { snapTo:
    // "labels" }, animation: the timeline from TODO 2, markers: true while
    // tuning locally (flip to false before shipping)
  }, panel);
}

export function teardownScrollSection() {
  ctx?.revert();
}

buildScrollSection();`,
    solutionCode: `import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const scroller = document.querySelector<HTMLElement>("#scroller")!;
const panel = document.querySelector<HTMLElement>(".panel")!;
const headline = panel.querySelector<HTMLElement>(".headline")!;
const shapes = gsap.utils.toArray<HTMLElement>(".shape", panel);
const stats = gsap.utils.toArray<HTMLElement>("[data-count]", panel);
const targets = [10, 240, 60]; // stat target values, same order as "stats"

let ctx: gsap.Context;

export function buildScrollSection() {
  ctx = gsap.context(() => {
    gsap.set(headline, { yPercent: 110, autoAlpha: 0 });
    gsap.set(shapes, { scale: 0.8, autoAlpha: 0 });

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    tl.addLabel("headline")
      .to(headline, { yPercent: 0, autoAlpha: 1, duration: 1 })
      .addLabel("shapes")
      .to(shapes, { scale: 1, autoAlpha: 1, duration: 0.8, stagger: 0.15 })
      .addLabel("stats");

    stats.forEach((el, i) => {
      const counter = { value: 0 };
      tl.to(
        counter,
        {
          value: targets[i],
          duration: 1,
          ease: "power1.out",
          onUpdate: () => {
            el.textContent = Math.round(counter.value).toString();
          },
        },
        "stats",
      );
    });

    ScrollTrigger.create({
      trigger: panel,
      scroller,
      pin: true,
      start: "top top",
      end: "+=1200",
      scrub: true,
      animation: tl,
      snap: { snapTo: "labels", duration: 0.4, ease: "power1.inOut" },
      markers: false, // flip to true only while tuning start/end locally
    });
  }, panel);
}

export function teardownScrollSection() {
  ctx?.revert();
}

buildScrollSection();`,
    hints: [
      {
        vi: "scroller trong ScrollTrigger.create phải là phần tử #scroller (div cuộn nội bộ) — không phải window, nếu không trigger tính sai vị trí cuộn hoàn toàn.",
        en: "scroller in ScrollTrigger.create must be the #scroller element (the internal scrolling div) — not window, or the trigger computes scroll position entirely wrong.",
      },
      {
        vi: "yPercent + autoAlpha (không phải opacity/visibility riêng lẻ) cho headline: autoAlpha tự set visibility:hidden khi alpha về 0, tránh phần tử ẩn vẫn chặn click.",
        en: "yPercent + autoAlpha (not separate opacity/visibility) for the headline: autoAlpha automatically sets visibility:hidden when alpha hits 0, so the hidden element never still blocks clicks.",
      },
      {
        vi: "snap: { snapTo: 'labels' } chỉ hoạt động khi animation truyền vào ScrollTrigger.create là một timeline có addLabel — snap tới % scroll ứng với từng label, không phải theo pixel cố định.",
        en: "snap: { snapTo: 'labels' } only works when the animation passed to ScrollTrigger.create is a timeline with addLabel calls — it snaps to the scroll % matching each label, not a fixed pixel value.",
      },
    ],
    checklist: [
      {
        vi: "Panel ghim (pin) không gây giật layout khi bắt đầu pin — không có khoảng nhảy đột ngột của nội dung xung quanh",
        en: "The panel pins without a layout jump when pinning starts — no sudden jump in surrounding content",
      },
      {
        vi: "Cuộn cảm giác scrub bám sát ngay theo vị trí cuộn, không có độ trễ rõ rệt",
        en: "Scrubbing feels tightly attached to the scroll position, with no noticeable lag",
      },
      {
        vi: "Snap luôn dừng đúng ở một trong ba label (headline/shapes/stats), không dừng lửng giữa hai phase",
        en: "Snap always lands on one of the three labels (headline/shapes/stats), never stuck halfway between two phases",
      },
      {
        vi: "Mọi phần tử di chuyển/scale/fade chỉ dùng transform và opacity (qua autoAlpha) — không animate width/top/left/clip-path nào; textContent của counter là ngoại lệ duy nhất",
        en: "Every moving/scaling/fading element uses only transform and opacity (via autoAlpha) — no width/top/left/clip-path animated anywhere; the counter's textContent is the sole exception",
      },
      {
        vi: "teardownScrollSection() dọn sạch pin spacer và mọi ScrollTrigger đã tạo — gọi lại buildScrollSection() sau đó không để lại khoảng trắng thừa",
        en: "teardownScrollSection() removes the pin spacer and every ScrollTrigger created — calling buildScrollSection() again afterward leaves no leftover blank space",
      },
      {
        vi: "markers: true chỉ dùng lúc phát triển, đã tắt trước khi coi là hoàn thành",
        en: "markers: true was only used during development, and is turned off before calling this done",
      },
    ],
  },
];
