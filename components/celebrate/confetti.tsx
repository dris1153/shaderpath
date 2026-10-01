"use client";

import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";

const COLORS = ["var(--primary)", "var(--coral)", "var(--sun)", "var(--mint)", "var(--sky)"];
const PIECES = 28;

/**
 * One burst of CSS confetti from the centre of its positioned parent. Mounted
 * only after a click, so its layout never meets SSR; skipped under reduced motion.
 */
export function Confetti() {
  const reduced = usePrefersReducedMotion();
  if (reduced) return null;

  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
      {Array.from({ length: PIECES }, (_, i) => {
        // Fan the pieces across a half-disc with a fixed integer pattern.
        const dx = ((i * 47) % 260) - 130;
        const dy = -(50 + ((i * 29) % 110));
        return (
          <span
            key={i}
            className="motion-safe:animate-confetti absolute top-1/2 left-1/2 h-2.5 w-1.5 rounded-[2px]"
            style={
              {
                background: COLORS[i % COLORS.length],
                "--dx": `${dx}px`,
                "--dy": `${dy}px`,
                "--spin": `${(i % 2 ? 1 : -1) * (180 + i * 23)}deg`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </span>
  );
}
