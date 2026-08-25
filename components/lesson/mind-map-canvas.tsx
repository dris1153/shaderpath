"use client";

import { Link } from "@/i18n/navigation";
import type { MindMapNode } from "@/content/types";
import type { MindMapLayout, PlacedNode } from "@/lib/mind-map-layout";
import { cn } from "@/lib/utils";

// Real nested lists carry the semantics; the SVG below them is decoration
// only. Every interactive node is a genuine <a>/<button> so keyboard and
// screen-reader users traverse the same graph in document order. Plain lists
// beat role="tree" here: the tree pattern demands roving-tabindex arrow-key
// navigation this widget does not implement.
export function MindMapCanvas({
  layout,
  ariaLabel,
  showDetail = false,
  onToggleBranch,
  onNavigate,
}: {
  layout: MindMapLayout;
  ariaLabel: string;
  showDetail?: boolean;
  onToggleBranch?: (id: string) => void;
  /** Called when a node performs a navigation (anchor jump or lesson link). */
  onNavigate?: () => void;
}) {
  const byId = new Map(layout.nodes.map((p) => [p.node.id, p]));
  const pos = (p: PlacedNode) => ({ x: p.x + layout.cx, y: p.y + layout.cy });

  const renderNode = (placed: PlacedNode) => {
    const { node, depth, hiddenCount } = placed;
    const { x, y } = pos(placed);
    const visibleChildren = (node.children ?? [])
      .map((c) => byId.get(c.id))
      .filter((c): c is PlacedNode => c !== undefined);
    const box = cn(
      "absolute block max-w-45 -translate-x-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1.5 text-center leading-snug",
      depth === 0 && "bg-primary text-primary-foreground z-10 text-sm font-medium",
      depth === 1 && "bg-secondary text-secondary-foreground border text-xs font-medium",
      depth >= 2 && "bg-card border text-xs",
      node.kind === "pitfall" && depth >= 2 && "border-destructive/40",
    );
    const style = { left: x, top: y };

    let control: React.ReactNode;
    if (depth === 1 && onToggleBranch) {
      control = (
        <button
          type="button"
          className={box}
          style={style}
          aria-expanded={hiddenCount === 0}
          onClick={() => onToggleBranch(node.id)}
        >
          {node.label}
          <span className="text-muted-foreground ml-1 tabular-nums">
            {hiddenCount > 0 ? `+${hiddenCount}` : ""}
          </span>
        </button>
      );
    } else if (node.kind === "link" && depth >= 2) {
      control = (
        <Link
          href={`/lesson/${node.id}`}
          className={cn(box, "hover:bg-muted")}
          style={style}
          onClick={onNavigate}
        >
          {node.label}
          {node.detail && (
            <span className="text-muted-foreground block text-[10px]">{node.detail}</span>
          )}
        </Link>
      );
    } else if (node.kind === "section" && depth >= 2) {
      control = (
        <a
          href={`#${node.id}`}
          className={cn(box, "hover:bg-muted")}
          style={style}
          title={node.detail}
          onClick={onNavigate}
        >
          {node.label}
          {showDetail && node.detail && (
            <span className="text-muted-foreground line-clamp-3 block text-[10px]">
              {node.detail}
            </span>
          )}
        </a>
      );
    } else {
      control = (
        <span className={box} style={style} title={showDetail ? undefined : node.detail}>
          {node.label}
          {showDetail && node.detail && (
            <span className="text-muted-foreground line-clamp-3 block text-[10px]">
              {node.detail}
            </span>
          )}
        </span>
      );
    }

    return (
      <li key={node.id}>
        {control}
        {visibleChildren.length > 0 && <ul>{visibleChildren.map(renderNode)}</ul>}
      </li>
    );
  };

  const root = layout.nodes.find((p) => p.parentId === null);
  return (
    <div className="relative" style={{ width: layout.width, height: layout.height }}>
      <svg
        aria-hidden
        className="absolute inset-0"
        width={layout.width}
        height={layout.height}
      >
        {layout.edges.map(({ from, to }) => {
          const a = byId.get(from);
          const b = byId.get(to);
          if (!a || !b) return null;
          const p = pos(a);
          const c = pos(b);
          const mx = p.x + (c.x - p.x) * 0.5;
          return (
            <path
              key={`${from}-${to}`}
              d={`M ${p.x} ${p.y} C ${mx} ${p.y}, ${mx} ${c.y}, ${c.x} ${c.y}`}
              fill="none"
              className="stroke-border"
              strokeWidth={1.5}
            />
          );
        })}
      </svg>
      {root && (
        <nav aria-label={ariaLabel}>
          <ul>{renderNode(root)}</ul>
        </nav>
      )}
    </div>
  );
}
