"use client";

import { useEffect } from "react";
import gsap from "gsap";

// The single-render-loop rule (spec §8.4): GSAP tweens PLAIN objects only;
// scenes read the tweened values inside `useFrame`. Never register a render
// function on `gsap.ticker` next to R3F's loop — two loops fight and stutter.
export function useGsapContext(
  setup: (ctx: gsap.Context) => void,
  deps: unknown[] = [],
) {
  useEffect(() => {
    const ctx = gsap.context(setup);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
