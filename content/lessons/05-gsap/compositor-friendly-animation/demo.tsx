"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import gsap from "gsap";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf, stringOf } from "@/components/viz/control-schema";
import { useGsapContext } from "@/lib/hooks/use-gsap-context";
import { useVisibleRaf } from "@/lib/hooks/use-visible-frameloop";

const LABELS = {
  vi: {
    title: "Layout path vs compositor path",
    mode: "Đường chạy",
    modeCompositor: "Compositor (transform)",
    modeLayout: "Layout (width/margin)",
    willChange: "will-change: transform",
    boxCount: "Số lượng box",
  },
  en: {
    title: "Layout Path vs Compositor Path",
    mode: "Path",
    modeCompositor: "Compositor (transform)",
    modeLayout: "Layout (width/margin)",
    willChange: "will-change: transform",
    boxCount: "Box count",
  },
} as const;

const BOX_SIZE = 14;
const GROWN_SIZE = 32;
const SHIFT = 20;

function StressRow() {
  const { values, containerRef } = useDemoContext();
  const rowRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const boxesRef = useRef<(HTMLDivElement | null)[]>([]);
  const frameTimesRef = useRef<number[]>([]);
  const lastTsRef = useRef<number | null>(null);

  const mode = stringOf(values, "mode", "compositor");
  const willChange = booleanOf(values, "willChange", false);
  const boxCount = Math.round(numberOf(values, "boxCount", 80));

  // Rebuilds the tween set whenever the path or box count changes; gsap.context
  // reverts the previous set first (kills tweens, clears inline styles it wrote).
  useGsapContext(() => {
    const boxes = boxesRef.current.slice(0, boxCount);
    boxes.forEach((box, i) => {
      if (!box) return;
      const delay = (i % 16) * 0.03;
      if (mode === "layout") {
        gsap.set(box, { clearProps: "transform", width: BOX_SIZE, marginLeft: 0 });
        gsap.to(box, {
          width: GROWN_SIZE,
          marginLeft: SHIFT,
          duration: 1,
          delay,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      } else {
        gsap.set(box, { width: BOX_SIZE, marginLeft: 0, x: 0, scaleX: 1 });
        gsap.to(box, {
          x: SHIFT,
          scaleX: GROWN_SIZE / BOX_SIZE,
          transformOrigin: "left center",
          force3D: true,
          duration: 1,
          delay,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }
    });
  }, [mode, boxCount]);

  // will-change is a plain style hint, not an animation — kept out of the
  // gsap context on purpose so toggling it never disturbs running tweens.
  useEffect(() => {
    for (const box of boxesRef.current.slice(0, boxCount)) {
      if (box) box.style.willChange = willChange ? "transform" : "auto";
    }
  }, [willChange, boxCount]);

  // Pure instrumentation: samples real rAF frame deltas to show the gap live.
  // This does not drive the boxes (GSAP's own ticker does) — it only reads timing.
  useVisibleRaf(containerRef, (t) => {
    if (lastTsRef.current !== null) {
      const dt = t - lastTsRef.current;
      const buf = frameTimesRef.current;
      buf.push(dt);
      if (buf.length > 40) buf.shift();
      const avg = buf.reduce((a, b) => a + b, 0) / buf.length;
      const fps = avg > 0 ? 1000 / avg : 0;
      if (readoutRef.current) {
        readoutRef.current.textContent = `${avg.toFixed(1)} ms/frame · ~${fps.toFixed(0)} fps`;
      }
    }
    lastTsRef.current = t;
  });

  return (
    <div className="flex size-full flex-col gap-3 overflow-hidden p-4">
      <div ref={readoutRef} className="text-muted-foreground font-mono text-xs">
        —
      </div>
      <div ref={rowRef} className="flex flex-1 flex-wrap content-start gap-1 overflow-hidden">
        {Array.from({ length: boxCount }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              boxesRef.current[i] = el;
            }}
            className="bg-primary h-3.5 shrink-0 rounded-sm"
            style={{ width: BOX_SIZE }}
          />
        ))}
      </div>
    </div>
  );
}

export default function CompositorFriendlyAnimationDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={16 / 9}
      controls={[
        {
          kind: "select",
          key: "mode",
          label: L.mode,
          options: [
            { value: "compositor", label: L.modeCompositor },
            { value: "layout", label: L.modeLayout },
          ],
          defaultValue: "compositor",
        },
        { kind: "boolean", key: "willChange", label: L.willChange, defaultValue: false },
        {
          kind: "number",
          key: "boxCount",
          label: L.boxCount,
          min: 20,
          max: 300,
          step: 10,
          defaultValue: 80,
        },
      ]}
    >
      <StressRow />
    </Demo>
  );
}
