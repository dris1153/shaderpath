"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useThree } from "@react-three/fiber";

// Spec §8.3 (hard requirement): canvases outside the viewport must consume
// zero GPU. The RAF pump only runs while the container intersects the
// viewport; browsers additionally pause RAF in hidden tabs.
// `data-frames` on the container counts pump ticks — e2e asserts it freezes
// off-screen.

export function useVisibleRaf(
  containerRef: RefObject<HTMLElement | null>,
  callback: (timeMs: number) => void,
) {
  const cbRef = useRef(callback);
  useEffect(() => {
    cbRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let rafId = 0;
    const pump = (t: number) => {
      el.dataset.frames = String((Number(el.dataset.frames) || 0) + 1);
      cbRef.current(t);
      rafId = requestAnimationFrame(pump);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          if (!rafId) rafId = requestAnimationFrame(pump);
        } else if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
      },
      { threshold: 0.01 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [containerRef]);
}

/** R3F flavor: pumps `invalidate()` while visible — pair with `frameloop="demand"`. */
export function useVisibleFrameloop(
  containerRef: RefObject<HTMLElement | null>,
) {
  const invalidate = useThree((s) => s.invalidate);
  useVisibleRaf(containerRef, () => invalidate());
}
