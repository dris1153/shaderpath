"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf, stringOf, booleanOf } from "@/components/viz/control-schema";
import { useGsapContext } from "@/lib/hooks/use-gsap-context";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(Flip);

const LABELS = {
  vi: {
    title: "Flip: lưới thẻ ↔ thẻ nổi bật",
    duration: "Thời lượng (s)",
    ease: "Ease",
    absolute: "position: absolute khi flip",
    shuffle: "Xáo trộn thứ tự",
    hint: "Nhấn một thẻ để phóng to, nhấn lại để thu nhỏ",
  },
  en: {
    title: "Flip: Card Grid ↔ Featured Card",
    duration: "Duration (s)",
    ease: "Ease",
    absolute: "position: absolute while flipping",
    shuffle: "Shuffle order",
    hint: "Click a card to feature it, click again to shrink it back",
  },
} as const;

interface CardData {
  id: string;
  label: { vi: string; en: string };
  accent: string;
}

// Labelled after this same track's own lesson topics — no real content
// needed, just six distinct, recognizable blocks to flip between layouts.
const CARDS: CardData[] = [
  { id: "tween", label: { vi: "Tween", en: "Tween" }, accent: "bg-sky-500/70" },
  { id: "timeline", label: { vi: "Timeline", en: "Timeline" }, accent: "bg-violet-500/70" },
  { id: "stagger", label: { vi: "Stagger", en: "Stagger" }, accent: "bg-rose-500/70" },
  { id: "easing", label: { vi: "Easing", en: "Easing" }, accent: "bg-amber-500/70" },
  { id: "scrolltrigger", label: { vi: "ScrollTrigger", en: "ScrollTrigger" }, accent: "bg-emerald-500/70" },
  { id: "observer", label: { vi: "Observer", en: "Observer" }, accent: "bg-cyan-500/70" },
];

const EASE_OPTIONS = [
  { value: "power1.inOut", label: "power1.inOut" },
  { value: "power3.out", label: "power3.out" },
  { value: "back.out(1.7)", label: "back.out(1.7)" },
  { value: "elastic.out(1,0.5)", label: "elastic.out(1,0.5)" },
  { value: "bounce.out", label: "bounce.out" },
];

function shuffledCopy(ids: string[]) {
  const copy = [...ids];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as string, copy[i] as string];
  }
  return copy;
}

function cardSizeClass(isFeatured: boolean, hasFeatured: boolean) {
  if (isFeatured) return "aspect-video w-full";
  return hasFeatured
    ? "aspect-square w-[calc(16.666%-0.42rem)]"
    : "aspect-square w-[calc(33.333%-0.34rem)]";
}

// The non-canvas demo path (spec Track 5 brief): plain styled <div>/<button>
// content inside <Demo>, no DemoCanvas. Same element stays mounted across
// grid <-> featured states (React keeps it via `key`) and data-flip-id gives
// Flip a second, identity-independent way to match it — the mechanism the
// theory explains for cases where the DOM node itself gets recreated.
function FlipGrid() {
  const { values } = useDemoContext();
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  const stageRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  const pendingState = useRef<Flip.FlipState | null>(null);

  const [order, setOrder] = useState<string[]>(() => CARDS.map((c) => c.id));
  const [featuredId, setFeaturedId] = useState<string | null>(null);

  const duration = numberOf(values, "duration", 0.6);
  const ease = stringOf(values, "ease", "power1.inOut");
  const absolute = booleanOf(values, "absolute", true);

  // Long-lived context: click handlers fire well after mount, so ctxRef is
  // always populated by the time beginFlip()/Flip.from() actually run.
  useGsapContext((ctx) => {
    ctxRef.current = ctx;
  }, []);

  // Runs after React commits the layout-changing state update (Last is now
  // in the DOM) — exactly the point Flip.from should measure Last and Play.
  useLayoutEffect(() => {
    const state = pendingState.current;
    if (!state) return;
    pendingState.current = null;
    ctxRef.current?.add(() => {
      Flip.from(state, { duration, ease, absolute, scale: true, nested: true });
    });
  }, [order, featuredId, duration, ease, absolute]);

  function beginFlip() {
    const els = stageRef.current?.querySelectorAll("[data-flip-id]");
    if (els) pendingState.current = Flip.getState(els); // First
  }

  function selectCard(id: string) {
    beginFlip();
    setFeaturedId((prev) => (prev === id ? null : id)); // mutate
  }

  function shuffle() {
    beginFlip();
    setOrder((prev) => shuffledCopy(prev)); // mutate
  }

  const displayOrder = featuredId
    ? [featuredId, ...order.filter((id) => id !== featuredId)]
    : order;
  const hasFeatured = featuredId !== null;

  return (
    <div className="flex size-full flex-col gap-3 p-3">
      <div
        ref={stageRef}
        className="flex flex-1 flex-wrap content-start gap-2 overflow-y-auto"
      >
        {displayOrder.map((id) => {
          const card = CARDS.find((c) => c.id === id);
          if (!card) return null;
          const isFeatured = id === featuredId;
          return (
            <button
              key={id}
              type="button"
              data-flip-id={id}
              onClick={() => selectCard(id)}
              className={`${card.accent} ${cardSizeClass(isFeatured, hasFeatured)} flex items-center justify-center rounded-lg text-sm font-medium text-white shadow-sm`}
            >
              {card.label[locale as keyof typeof card.label] ?? card.label.vi}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground text-xs">{L.hint}</span>
        <Button size="sm" variant="outline" onClick={shuffle}>
          {L.shuffle}
        </Button>
      </div>
    </div>
  );
}

export default function FlipLayoutTransitionsDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        {
          kind: "number",
          key: "duration",
          label: L.duration,
          min: 0.2,
          max: 1.5,
          step: 0.1,
          defaultValue: 0.6,
        },
        {
          kind: "select",
          key: "ease",
          label: L.ease,
          options: EASE_OPTIONS,
          defaultValue: "power1.inOut",
        },
        {
          kind: "boolean",
          key: "absolute",
          label: L.absolute,
          defaultValue: true,
        },
      ]}
    >
      <FlipGrid />
    </Demo>
  );
}
