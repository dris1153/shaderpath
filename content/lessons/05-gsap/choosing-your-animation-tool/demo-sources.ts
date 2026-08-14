// Bilingual labels + representative source snippets shown beside the live
// card in demo.tsx. Snippets are condensed illustrations of the real
// implementation in demo-card-implementations.tsx, not a literal import.

export interface CardLabels {
  title: string;
  body: string;
  more: string;
  hide: string;
  detail: string;
}

export const CARD_LABELS: Record<"vi" | "en", CardLabels> = {
  vi: {
    title: "Gói Pro",
    body: "Rê chuột, nhấn giữ, hoặc bấm nút bên dưới — cả ba cách đều animate đúng thẻ này, chỉ khác cơ chế.",
    more: "Xem chi tiết",
    hide: "Thu gọn",
    detail: "Không có gì đặc biệt ở đây — panel này chỉ tồn tại để animate chiều cao lúc mở/đóng.",
  },
  en: {
    title: "Pro Plan",
    body: "Hover, press, or click the button below — all three mechanisms animate this exact card, only the machinery differs.",
    more: "Show details",
    hide: "Hide details",
    detail: "Nothing special here — this panel exists only to animate open/close height.",
  },
};

export const SOURCE_CSS = `/* Zero JS. The browser owns the whole interaction. */
.card {
  transition: transform 150ms ease-out, box-shadow 150ms ease-out;
}
.card:hover  { transform: translateY(-4px); box-shadow: 0 8px 20px -6px #0004; }
.card:active { transform: scale(0.95); transition-duration: 75ms; }

/* Toggle reveal via the CSS-only "grid-rows" auto-height trick:
   no JS measurement, no fixed pixel height needed. */
.details        { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 300ms ease-out; }
.details.open   { grid-template-rows: 1fr; }
.details > div  { overflow: hidden; }`;

export const SOURCE_WAAPI = `// Hand-rolled spring physics (what Motion does internally for
// whileHover/whileTap), driven by one rAF loop, mutating the DOM
// directly -- no React re-render per frame.
function stepSpring(s, target, stiffness, damping, dt) {
  const accel = (target - s.x) * stiffness - s.v * damping;
  s.v += accel * dt;
  s.x += s.v * dt;
}
// tick(): stepSpring(lift, hovered ? -6 : 0, 210, 20, dt)
//         stepSpring(scale, pressed ? 0.95 : 1, 300, 24, dt)
//         el.style.transform = \`translateY(\${lift.x}px) scale(\${scale.x})\`

// Toggle reveal: WAAPI can't animate to "auto" -- measure scrollHeight
// first, animate a real pixel value, then commit + cancel on finish.
const anim = details.animate(
  [{ height: from + "px" }, { height: target + "px" }],
  { duration: 260, easing: "cubic-bezier(.34,1.56,.64,1)", fill: "forwards" },
);
anim.onfinish = () => { details.style.height = target + "px"; anim.cancel(); };`;

export const SOURCE_GSAP = `// Imperative, scoped for safe cleanup -- house hook wraps gsap.context().
useGsapContext((ctx) => {
  ctx.add("hoverIn", () => gsap.to(card, { y: -6, duration: .25, ease: "back.out(2)", overwrite: "auto" }));
  ctx.add("hoverOut", () => gsap.to(card, { y: 0, duration: .3, ease: "power2.out", overwrite: "auto" }));
  ctx.add("press",   () => gsap.to(card, { scale: .95, duration: .12, ease: "power2.out", overwrite: "auto" }));
  ctx.add("release", () => gsap.to(card, { scale: 1, duration: .3, ease: "elastic.out(1,.5)", overwrite: "auto" }));
  // GSAP CAN tween straight to "auto" height -- no manual scrollHeight math.
  ctx.add("setOpen", (open) => gsap.to(details, { height: open ? "auto" : 0, duration: .3, ease: "power2.out" }));
}, []);
// on unmount: ctx.revert() kills every in-flight tween automatically`;
