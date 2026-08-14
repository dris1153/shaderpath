"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { Demo } from "@/components/viz/demo";
import { useDemoContext } from "@/components/viz/demo-context";
import { numberOf, stringOf } from "@/components/viz/control-schema";
import { useGsapContext } from "@/lib/hooks/use-gsap-context";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(SplitText);

const LABELS = {
  vi: {
    title: "SplitText: reveal theo char / word / line",
    mode: "Kiểu split",
    modeChars: "Ký tự (chars)",
    modeWords: "Từ (words)",
    modeLines: "Dòng, có mask (lines)",
    stagger: "Stagger (s)",
    replay: "Phát lại",
    count: "Số phần tử đang animate",
    headline: "GSAP tách chữ, bạn animate từng mảnh",
  },
  en: {
    title: "SplitText: Char / Word / Line Reveal",
    mode: "Split mode",
    modeChars: "Characters (chars)",
    modeWords: "Words (words)",
    modeLines: "Lines, masked (lines)",
    stagger: "Stagger (s)",
    replay: "Replay",
    count: "Elements being animated",
    headline: "GSAP splits the text, you animate every piece",
  },
} as const;

type SplitMode = "chars" | "words" | "lines";

// The non-canvas demo path (spec Track 5 brief): plain styled <div> content
// inside <Demo>. All split/animate work lives in ONE useGsapContext call so
// deps changes (mode/stagger/replay) revert the previous tweens AND the
// previous split's DOM mutation together, in the right order — see the
// revert() discipline section of the theory.
function SplitStage() {
  const { values } = useDemoContext();
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  const headlineRef = useRef<HTMLHeadingElement>(null);
  const splitRef = useRef<SplitText | null>(null);
  const [count, setCount] = useState(0);
  const [replayTick, setReplayTick] = useState(0);

  const mode = stringOf(values, "mode", "chars") as SplitMode;
  const stagger = numberOf(values, "stagger", 0.03);

  useGsapContext(() => {
    const el = headlineRef.current;
    if (!el) return;

    // Split DOM is a real mutation — always revert the previous instance
    // before creating a new one, never split on top of a split.
    splitRef.current?.revert();

    const split = SplitText.create(el, {
      type: mode,
      mask: mode === "lines" ? "lines" : undefined,
      aria: "auto",
    });
    splitRef.current = split;

    const targets =
      mode === "chars" ? split.chars : mode === "words" ? split.words : split.lines;
    setCount(targets.length);

    gsap.set(targets, { yPercent: 110, opacity: 0 });
    gsap.to(targets, {
      yPercent: 0,
      opacity: 1,
      duration: 0.7,
      stagger,
      ease: "power3.out",
    });
  }, [mode, stagger, replayTick]);

  // Final safety net: restore the plain headline DOM on unmount, matching
  // the "cleanup must revert() one last time" rule from the theory.
  useEffect(() => {
    return () => {
      splitRef.current?.revert();
      splitRef.current = null;
    };
  }, []);

  return (
    <div className="flex size-full flex-col items-center justify-center gap-5 overflow-hidden p-6 text-center">
      <h3
        ref={headlineRef}
        className="text-foreground text-2xl leading-snug font-semibold text-balance sm:text-3xl"
      >
        {L.headline}
      </h3>
      <div className="flex items-center gap-3">
        <Button size="sm" variant="outline" onClick={() => setReplayTick((t) => t + 1)}>
          {L.replay}
        </Button>
        <span className="text-muted-foreground font-mono text-xs">
          {L.count}: {count}
        </span>
      </div>
    </div>
  );
}

export default function SplitTextTypographyDemo() {
  const locale = useLocale();
  const L = LABELS[locale as keyof typeof LABELS] ?? LABELS.vi;

  return (
    <Demo
      title={L.title}
      ratio={3}
      controls={[
        {
          kind: "select",
          key: "mode",
          label: L.mode,
          options: [
            { value: "chars", label: L.modeChars },
            { value: "words", label: L.modeWords },
            { value: "lines", label: L.modeLines },
          ],
          defaultValue: "chars",
        },
        {
          kind: "number",
          key: "stagger",
          label: L.stagger,
          min: 0.01,
          max: 0.1,
          step: 0.005,
          defaultValue: 0.03,
        },
      ]}
    >
      <SplitStage />
    </Demo>
  );
}
