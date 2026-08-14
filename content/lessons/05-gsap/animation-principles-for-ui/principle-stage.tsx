"use client";

import { useEffect, useState, type ComponentType } from "react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { useDemoContext } from "@/components/viz/demo-context";
import { stringOf } from "@/components/viz/control-schema";
import {
  AnticipationScene,
  OverlapScene,
  SecondaryMotionScene,
  SlowInOutScene,
  SquashStretchScene,
  type SceneProps,
} from "./principle-animations";
import { PANEL_LABELS, STAGE_TEXT, type PrincipleKind } from "./principle-labels";

const SCENES: Record<PrincipleKind, ComponentType<SceneProps>> = {
  anticipation: AnticipationScene,
  overlap: OverlapScene,
  secondary: SecondaryMotionScene,
  squash: SquashStretchScene,
  slowInOut: SlowInOutScene,
};

// Live matchMedia check -- respects a change in the OS setting while the
// lesson stays open, not just its value at first render.
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export function PrincipleStage() {
  const { values } = useDemoContext();
  const locale = useLocale();
  const loc: "vi" | "en" = locale === "en" ? "en" : "vi";
  const T = STAGE_TEXT[loc];
  const panelLabels = PANEL_LABELS[loc];
  const principle = stringOf(values, "principle", "anticipation") as PrincipleKind;
  const reducedMotion = usePrefersReducedMotion();
  const [playToken, setPlayToken] = useState(0);

  // Switching principle replays automatically; the button replays on demand.
  // Adjusted during render (React's documented pattern for state that must
  // change alongside a prop) instead of an effect, avoiding an extra render pass.
  const [prevPrinciple, setPrevPrinciple] = useState(principle);
  if (prevPrinciple !== principle) {
    setPrevPrinciple(principle);
    setPlayToken((n) => n + 1);
  }

  const Scene = SCENES[principle];

  return (
    <div className="flex size-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b p-2">
        <Button size="sm" variant="outline" onClick={() => setPlayToken((n) => n + 1)}>
          {T.replay}
        </Button>
        {reducedMotion && (
          <p className="text-muted-foreground max-w-[65%] text-right text-[11px]">{T.reduced}</p>
        )}
      </div>
      <div className="min-h-0 flex-1">
        <Scene playToken={playToken} reducedMotion={reducedMotion} L={panelLabels} />
      </div>
    </div>
  );
}
