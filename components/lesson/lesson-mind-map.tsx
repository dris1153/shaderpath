"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { IconArrowsMaximize } from "@tabler/icons-react";
import type { MindMapNode } from "@/content/types";
import { layoutMindMap } from "@/lib/mind-map-layout";
import { Button } from "@/components/ui/button";
import { MindMapCanvas } from "./mind-map-canvas";

export interface MindMapUiStrings {
  title: string;
  open: string;
  close: string;
  zoomIn: string;
  zoomOut: string;
  reset: string;
}

const Fullscreen = dynamic(() => import("./lesson-mind-map-fullscreen"), {
  ssr: false,
});

export function LessonMindMap({
  tree,
  strings,
}: {
  tree: MindMapNode;
  strings: MindMapUiStrings;
}) {
  // Accordion: one branch open at a time so the inline map always fits.
  const [expandedId, setExpandedId] = useState<string | null>("content");
  const [fullscreen, setFullscreen] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const layout = useMemo(() => layoutMindMap(tree, expandedId), [tree, expandedId]);
  // SSR guesses the fit from the typical article column width (deterministic,
  // so hydration matches); the effect then measures the real column. The
  // post-mount correction is small, instead of a full 1 → ~0.6 jump.
  const [fit, setFit] = useState(() => Math.min(1, 720 / layout.width));
  const toggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  useEffect(() => {
    const measure = () => {
      const w = frameRef.current?.clientWidth;
      if (w) setFit(Math.min(1, w / layout.width));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [layout.width]);

  return (
    <section aria-label={strings.title} className="mt-6">
      <div
        ref={frameRef}
        className="bg-card/50 relative hidden overflow-hidden rounded-xl border lg:block"
        style={{ height: layout.height * fit }}
      >
        <div
          className="absolute top-0 left-1/2"
          style={{ transform: `translateX(-50%) scale(${fit})`, transformOrigin: "top center", width: layout.width }}
        >
          <MindMapCanvas
            layout={layout}
            ariaLabel={strings.title}
            onToggleBranch={toggle}
          />
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute top-2 right-2"
          aria-label={strings.open}
          onClick={() => setFullscreen(true)}
        >
          <IconArrowsMaximize />
        </Button>
      </div>

      {/* Mobile: the inline radial map does not fit — offer the fullscreen view. */}
      <div className="bg-card/50 flex items-center justify-between gap-3 rounded-xl border p-3 lg:hidden">
        <div className="min-w-0 text-sm">
          <p className="font-medium">{strings.title}</p>
          <p className="text-muted-foreground truncate text-xs">
            {(tree.children ?? [])
              .map((b) => `${b.label} (${b.children?.length ?? 0})`)
              .join(" · ")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => setFullscreen(true)}
        >
          <IconArrowsMaximize /> {strings.open}
        </Button>
      </div>

      {fullscreen && (
        <Fullscreen
          tree={tree}
          strings={strings}
          onClose={() => setFullscreen(false)}
        />
      )}
    </section>
  );
}
