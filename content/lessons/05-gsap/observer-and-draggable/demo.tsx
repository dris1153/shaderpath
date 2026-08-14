"use client";

import { useRef, useState } from "react";
import { useLocale } from "next-intl";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, stringOf } from "@/components/viz/control-schema";
import { useGsapContext } from "@/lib/hooks/use-gsap-context";
import { cn } from "@/lib/utils";

gsap.registerPlugin(Observer, Draggable, InertiaPlugin);

const CARD_LABELS = {
  vi: ["Vertex Shader", "Rasterization", "Fragment Shader", "Blending", "Present"],
  en: ["Vertex Shader", "Rasterization", "Fragment Shader", "Blending", "Present"],
} as const;

// One accent hue per pipeline stage — purely visual, no meaning beyond variety.
const CARD_COLORS = [
  "oklch(0.7 0.16 30)",
  "oklch(0.7 0.16 95)",
  "oklch(0.7 0.16 150)",
  "oklch(0.7 0.16 230)",
  "oklch(0.7 0.16 300)",
];

interface Labels {
  title: string;
  wheelPane: string;
  wheelHint: string;
  dragPane: string;
  snapLabel: string;
  inertiaLabel: string;
  rotation: string;
  snapNone: string;
}

const LABELS: Record<"vi" | "en", Labels> = {
  vi: {
    title: "Observer & Draggable",
    wheelPane: "Observer — cuộn/vuốt để chuyển thẻ",
    wheelHint: "Cuộn hoặc vuốt trong khung này",
    dragPane: "Draggable — xoay knob",
    snapLabel: "Snap",
    inertiaLabel: "Quán tính (inertia)",
    rotation: "Góc xoay",
    snapNone: "Không snap",
  },
  en: {
    title: "Observer & Draggable",
    wheelPane: "Observer — scroll/swipe to cycle cards",
    wheelHint: "Scroll or swipe inside this box",
    dragPane: "Draggable — rotate the knob",
    snapLabel: "Snap",
    inertiaLabel: "Inertia",
    rotation: "Rotation",
    snapNone: "No snap",
  },
};

function CardDeck({ L, labels }: { L: Labels; labels: readonly string[] }) {
  const deckRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const current = useRef(0);
  const isAnimating = useRef(false);
  const [index, setIndex] = useState(0);
  const count = labels.length;

  // Observer only detects intent (a gesture happened) — it never scrolls or
  // renders anything itself; the actual response is a separate GSAP tween.
  useGsapContext(() => {
    if (!deckRef.current) return;

    function goTo(dir: 1 | -1) {
      if (isAnimating.current) return;
      const from = current.current;
      const to = (from + dir + count) % count;
      const fromEl = cardRefs.current[from];
      const toEl = cardRefs.current[to];
      if (!fromEl || !toEl) return;
      isAnimating.current = true;
      gsap.set(toEl, { xPercent: dir * 100, opacity: 1, zIndex: 2 });
      gsap.set(fromEl, { zIndex: 1 });
      gsap
        .timeline({
          defaults: { duration: 0.45, ease: "power2.inOut" },
          onComplete: () => {
            current.current = to;
            isAnimating.current = false;
            setIndex(to);
          },
        })
        .to(fromEl, { xPercent: -dir * 100, opacity: 0 }, 0)
        .to(toEl, { xPercent: 0 }, 0);
    }

    // target scopes listeners to the deck only — preventDefault never
    // touches scroll outside this container (spec: preventDefault discipline).
    Observer.create({
      target: deckRef.current,
      type: "wheel,touch,pointer",
      preventDefault: true,
      onDown: () => goTo(1),
      onUp: () => goTo(-1),
    });
  }, [count]);

  return (
    <div className="flex flex-1 flex-col p-4">
      <p className="text-muted-foreground mb-2 text-xs">{L.wheelPane}</p>
      <div
        ref={deckRef}
        className="bg-card relative h-32 w-full touch-none overflow-hidden rounded-lg border select-none sm:h-full"
      >
        {labels.map((label, i) => (
          <div
            key={label}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white"
            style={{
              background: CARD_COLORS[i % CARD_COLORS.length],
              opacity: i === 0 ? 1 : 0,
              zIndex: i === 0 ? 1 : 0,
            }}
          >
            {label}
          </div>
        ))}
        <p className="pointer-events-none absolute bottom-1.5 w-full text-center text-[10px] text-white/80">
          {L.wheelHint}
        </p>
      </div>
      <div className="mt-2 flex justify-center gap-1.5">
        {labels.map((label, i) => (
          <span
            key={label}
            className={cn(
              "size-1.5 rounded-full transition-colors",
              i === index ? "bg-primary" : "bg-muted-foreground/30",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function DraggableKnob({ L }: { L: Labels }) {
  const { values } = useDemoContext();
  const inertiaOn = booleanOf(values, "inertia", false);
  const snapKey = stringOf(values, "snap", "none");
  const snapStep = snapKey === "45" ? 45 : snapKey === "90" ? 90 : 0;

  const knobRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);

  // Draggable owns velocity tracking, pointer capture and bounds — the exact
  // three things a hand-rolled pointermove implementation gets wrong first.
  useGsapContext(() => {
    if (!knobRef.current) return;
    Draggable.create(knobRef.current, {
      type: "rotation",
      inertia: inertiaOn,
      snap:
        snapStep > 0
          ? (value: number) => Math.round(value / snapStep) * snapStep
          : undefined,
      onDrag: function (this: Draggable) {
        setRotation(this.rotation);
      },
      onThrowUpdate: function (this: Draggable) {
        setRotation(this.rotation);
      },
    });
  }, [inertiaOn, snapStep]);

  const normalized = ((rotation % 360) + 360) % 360;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 border-t p-4 sm:border-t-0 sm:border-l">
      <p className="text-muted-foreground text-xs">{L.dragPane}</p>
      {/* touch-none = CSS touch-action: none — without it, mobile browsers
          fight Draggable for the first touch gesture (spec: touch-action pitfall) */}
      <div
        ref={knobRef}
        className="bg-muted relative size-20 shrink-0 cursor-grab touch-none rounded-full border-2 active:cursor-grabbing"
      >
        <span className="bg-primary absolute top-1.5 left-1/2 size-2 -translate-x-1/2 rounded-full" />
      </div>
      <p className="font-mono text-xs">
        {L.rotation}: {normalized.toFixed(0)}°
      </p>
    </div>
  );
}

function ObserverDraggableInner() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;
  const labels = CARD_LABELS[locale as keyof typeof CARD_LABELS] ?? CARD_LABELS.vi;

  return (
    <div className="flex h-full w-full flex-col divide-y sm:flex-row sm:divide-x sm:divide-y-0">
      <CardDeck L={L} labels={labels} />
      <DraggableKnob L={L} />
    </div>
  );
}

export default function ObserverDraggableDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        {
          kind: "select",
          key: "snap",
          label: L.snapLabel,
          options: [
            { value: "none", label: L.snapNone },
            { value: "45", label: "45°" },
            { value: "90", label: "90°" },
          ],
          defaultValue: "none",
        },
        {
          kind: "boolean",
          key: "inertia",
          label: L.inertiaLabel,
          defaultValue: false,
        },
      ]}
    >
      <ObserverDraggableInner />
    </Demo>
  );
}
