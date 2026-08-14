"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import gsap from "gsap";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { booleanOf, numberOf, stringOf } from "@/components/viz/control-schema";
import { useGsapContext } from "@/lib/hooks/use-gsap-context";

const LABELS = {
  vi: {
    title: "Timeline + stagger: một hàng box được đạo diễn",
    playing: "Đang chạy",
    timeScale: "Tốc độ",
    staggerFrom: "Stagger từ",
    fromStart: "Đầu (start)",
    fromCenter: "Giữa (center)",
    fromEdges: "Hai mép (edges)",
    fromRandom: "Ngẫu nhiên (random)",
  },
  en: {
    title: "Timeline + stagger: a directed row of boxes",
    playing: "Playing",
    timeScale: "Time scale",
    staggerFrom: "Stagger from",
    fromStart: "Start",
    fromCenter: "Center",
    fromEdges: "Edges",
    fromRandom: "Random",
  },
} as const;

const BOX_COUNT = 7;

// Only the values the "staggerFrom" select control can produce — narrowed
// from the generic string stringOf() returns for GSAP's stagger.from union.
type StaggerFrom = "start" | "center" | "edges" | "random";

function TweenRow() {
  const { values } = useDemoContext();
  const rootRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const staggerFrom = stringOf(values, "staggerFrom", "start") as StaggerFrom;

  // staggerFrom is baked into the tween at creation time (GSAP can't change
  // it on a live tween), so it's a useGsapContext dep: changing it reverts
  // the old timeline and builds+plays a fresh one from scratch.
  useGsapContext(() => {
    const root = rootRef.current;
    if (!root) return;
    const boxes = root.querySelectorAll<HTMLDivElement>("[data-box]");

    const tl = gsap.timeline({
      defaults: { ease: "power3.out", duration: 0.6 },
      repeat: -1,
      repeatDelay: 0.6,
    });

    tl.from(boxes, {
      yPercent: 140,
      opacity: 0,
      stagger: { each: 0.08, from: staggerFrom },
    })
      .to(boxes, { scale: 1.15, duration: 0.3, stagger: 0.05 }, "-=0.15")
      .to(boxes, { scale: 1, duration: 0.35, stagger: 0.05 }, "+=0.1");

    timelineRef.current = tl;
  }, [staggerFrom]);

  // playing/timeScale control the SAME live timeline imperatively — no
  // rebuild, so toggling play/pause never restarts the choreography.
  useEffect(() => {
    timelineRef.current?.timeScale(numberOf(values, "timeScale", 1));
  }, [values]);

  useEffect(() => {
    const tl = timelineRef.current;
    if (!tl) return;
    if (booleanOf(values, "playing", true)) tl.play();
    else tl.pause();
  }, [values]);

  return (
    <div
      ref={rootRef}
      className="flex size-full items-center justify-center gap-3 px-6"
    >
      {Array.from({ length: BOX_COUNT }).map((_, i) => (
        <div
          key={i}
          data-box
          className="bg-primary size-10 rounded-md sm:size-12"
        />
      ))}
    </div>
  );
}

export default function TweensTimelinesStaggerDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      controls={[
        { kind: "boolean", key: "playing", label: L.playing, defaultValue: true },
        {
          kind: "number",
          key: "timeScale",
          label: L.timeScale,
          min: 0.25,
          max: 2.5,
          step: 0.25,
          defaultValue: 1,
        },
        {
          kind: "select",
          key: "staggerFrom",
          label: L.staggerFrom,
          defaultValue: "start",
          options: [
            { value: "start", label: L.fromStart },
            { value: "center", label: L.fromCenter },
            { value: "edges", label: L.fromEdges },
            { value: "random", label: L.fromRandom },
          ],
        },
      ]}
    >
      <TweenRow />
    </Demo>
  );
}
