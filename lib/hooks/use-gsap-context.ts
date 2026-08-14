"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

// The single-render-loop rule (spec §8.4): GSAP tweens PLAIN objects only;
// scenes read the tweened values inside `useFrame`. Never register a render
// function on `gsap.ticker` next to R3F's loop — two loops fight and stutter.
//
// a11y: shared by every content-lesson GSAP demo, so `prefers-reduced-motion`
// is gated once here instead of touching all 124 demo files. Reduced motion
// scales the global timeline near-instant rather than removing tweens — end
// states (and any code awaiting tween completion) stay correct.
export function useGsapContext(
  setup: (ctx: gsap.Context) => void,
  deps: unknown[] = [],
) {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    gsap.globalTimeline.timeScale(reducedMotion ? 60 : 1);
    const ctx = gsap.context(setup);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, ...deps]);
}
