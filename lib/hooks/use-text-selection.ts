"use client";

import { useEffect, useState, type RefObject } from "react";

export interface TextSelection {
  text: string;
  /** Nearest preceding heading id inside the container, if any */
  anchorId: string | null;
  /** Viewport-relative rect of the selection end */
  rect: { top: number; left: number; bottom: number };
}

// Anchoring strategy (phase-08 key insight): notes attach to the nearest
// heading, not to a character range — content edits then degrade gracefully.
export function useTextSelection(
  containerRef: RefObject<HTMLElement | null>,
): [TextSelection | null, () => void] {
  const [selection, setSelection] = useState<TextSelection | null>(null);

  useEffect(() => {
    const onMouseUp = () => {
      // Let the browser finalize the selection first
      requestAnimationFrame(() => {
        const container = containerRef.current;
        const sel = window.getSelection();
        if (!container || !sel || sel.isCollapsed || sel.rangeCount === 0) {
          return;
        }
        const range = sel.getRangeAt(0);
        if (!container.contains(range.commonAncestorContainer)) return;
        const text = sel.toString().trim();
        if (text.length < 3) return;

        const rect = range.getBoundingClientRect();
        const headings = Array.from(
          container.querySelectorAll<HTMLElement>("h2[id], h3[id], h4[id]"),
        );
        let anchorId: string | null = null;
        for (const h of headings) {
          if (h.getBoundingClientRect().top <= rect.top) anchorId = h.id;
          else break;
        }

        setSelection({
          text,
          anchorId,
          rect: { top: rect.top, left: rect.left, bottom: rect.bottom },
        });
      });
    };

    document.addEventListener("mouseup", onMouseUp);
    return () => document.removeEventListener("mouseup", onMouseUp);
  }, [containerRef]);

  return [selection, () => setSelection(null)];
}
