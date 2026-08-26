"use client";

import { type RefObject } from "react";
import { useThree } from "@react-three/fiber";
import { useVisibleRaf } from "./use-visible-raf";

// Re-exported so the ~30 demos importing it from here keep working. Anything
// outside a <Canvas> must import from ./use-visible-raf instead: this module
// pulls in R3F, which is deliberately absent from the landing route.
export { useVisibleRaf };

/** R3F flavor: pumps `invalidate()` while visible — pair with `frameloop="demand"`. */
export function useVisibleFrameloop(
  containerRef: RefObject<HTMLElement | null>,
) {
  const invalidate = useThree((s) => s.invalidate);
  useVisibleRaf(containerRef, () => invalidate());
}
