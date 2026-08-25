"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IconMinus, IconPlus, IconRefresh, IconX } from "@tabler/icons-react";
import type { MindMapNode } from "@/content/types";
import { layoutMindMapExpanded } from "@/lib/mind-map-layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { MindMapCanvas } from "./mind-map-canvas";
import type { MindMapUiStrings } from "./lesson-mind-map";

const MIN_SCALE = 0.3;
const MAX_SCALE = 2.5;
// Capture the pointer only after real movement: capturing on pointerdown
// retargets the subsequent click to the viewport, killing node links.
const DRAG_THRESHOLD = 4;

interface DragState {
  pointerId: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  captured: boolean;
}

export default function LessonMindMapFullscreen({
  tree,
  strings,
  onClose,
}: {
  tree: MindMapNode;
  strings: MindMapUiStrings;
  onClose: () => void;
}) {
  const layout = useMemo(() => layoutMindMapExpanded(tree), [tree]);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ tx: 0, ty: 0, scale: 1 });
  const drag = useRef<DragState | null>(null);

  const center = () => {
    const vp = viewportRef.current;
    if (!vp) return;
    const scale = Math.min(
      1,
      (vp.clientWidth - 32) / layout.width,
      (vp.clientHeight - 32) / layout.height,
    );
    setView({
      tx: (vp.clientWidth - layout.width * scale) / 2,
      ty: (vp.clientHeight - layout.height * scale) / 2,
      scale: Math.max(scale, MIN_SCALE),
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(center, []);

  const zoomBy = (factor: number) =>
    setView((v) => {
      const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor));
      const vp = viewportRef.current;
      if (!vp) return { ...v, scale };
      // keep the viewport center fixed while zooming
      const cx = vp.clientWidth / 2;
      const cy = vp.clientHeight / 2;
      const k = scale / v.scale;
      return { tx: cx - (cx - v.tx) * k, ty: cy - (cy - v.ty) * k, scale };
    });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="bg-background top-0 left-0 block h-full w-full max-w-none translate-x-0 translate-y-0 gap-0 rounded-none p-0 ring-0 sm:max-w-none"
      >
        <div className="absolute top-3 right-3 left-3 z-10 flex items-center justify-between gap-2">
          <DialogTitle className="truncate text-sm font-medium">
            {strings.title}
          </DialogTitle>
          <div className="flex gap-1">
            <Button variant="outline" size="icon-sm" aria-label={strings.zoomOut} onClick={() => zoomBy(1 / 1.25)}>
              <IconMinus />
            </Button>
            <Button variant="outline" size="icon-sm" aria-label={strings.zoomIn} onClick={() => zoomBy(1.25)}>
              <IconPlus />
            </Button>
            <Button variant="outline" size="icon-sm" aria-label={strings.reset} onClick={center}>
              <IconRefresh />
            </Button>
            <Button variant="outline" size="icon-sm" aria-label={strings.close} onClick={onClose}>
              <IconX />
            </Button>
          </div>
        </div>
        <div
          ref={viewportRef}
          className="absolute inset-0 cursor-grab touch-none overflow-hidden active:cursor-grabbing"
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            drag.current = {
              pointerId: e.pointerId,
              x: e.clientX,
              y: e.clientY,
              tx: view.tx,
              ty: view.ty,
              captured: false,
            };
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d) return;
            const dx = e.clientX - d.x;
            const dy = e.clientY - d.y;
            if (!d.captured) {
              if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
              e.currentTarget.setPointerCapture(d.pointerId);
              d.captured = true;
            }
            setView((v) => ({ ...v, tx: d.tx + dx, ty: d.ty + dy }));
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
          onWheel={(e) => zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15)}
        >
          <div
            style={{
              transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})`,
              transformOrigin: "0 0",
              width: layout.width,
              height: layout.height,
            }}
          >
            <MindMapCanvas
              layout={layout}
              ariaLabel={strings.title}
              showDetail
              onNavigate={onClose}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
