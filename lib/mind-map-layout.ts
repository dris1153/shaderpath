import type { MindMapNode } from "@/content/types";

export interface PlacedNode {
  node: MindMapNode;
  parentId: string | null;
  depth: number;
  /** Center position relative to the layout center. */
  x: number;
  y: number;
  /** For collapsed branches: how many children are hidden. */
  hiddenCount: number;
}

export interface MindMapLayout {
  nodes: PlacedNode[];
  edges: { from: string; to: string }[];
  width: number;
  height: number;
  cx: number;
  cy: number;
}

// Elliptical radii per depth: wider than tall because labels are wide boxes.
const RX = [0, 190, 330, 470];
const RY = [0, 120, 215, 300];
const BOX_W = 180;
const BOX_H = 60;

// IEEE 754 guarantees bit-identical results for + - * / but NOT for sin/cos:
// V8-in-Node (SSR) and V8-in-Chrome can differ by one ULP. That is enough to
// make the rendered `style="top:…"` differ between the server HTML and the
// hydrating client, and React answers a mismatch by discarding the server tree
// and re-rendering the whole subtree — which throws away the static render for
// that page and detaches every element inside it.
//
// Snapping right after the trigonometry kills the divergence at the source;
// everything downstream (edge midpoints, extents) is plain arithmetic and so is
// already deterministic. 0.01px is far below one device pixel.
const snap = (v: number) => Math.round(v * 100) / 100;

function leafCount(node: MindMapNode): number {
  if (!node.children || node.children.length === 0) return 1;
  return node.children.reduce((n, c) => n + leafCount(c), 0);
}

function place(
  out: MindMapLayout,
  node: MindMapNode,
  parentId: string | null,
  depth: number,
  angle: number,
  span: number,
  expandChildren: boolean,
  expandedId: string | null,
): void {
  const rx = RX[Math.min(depth, RX.length - 1)] ?? 0;
  const ry = RY[Math.min(depth, RY.length - 1)] ?? 0;
  const x = depth === 0 ? 0 : snap(Math.cos(angle) * rx);
  const y = depth === 0 ? 0 : snap(Math.sin(angle) * ry);
  const children = node.children ?? [];
  out.nodes.push({
    node,
    parentId,
    depth,
    x,
    y,
    hiddenCount: expandChildren ? 0 : children.length,
  });
  if (parentId !== null) out.edges.push({ from: parentId, to: node.id });
  if (!expandChildren || children.length === 0) return;

  const weights = children.map((c) => {
    // Accordion: only the expanded branch spreads its leaves; collapsed
    // branches are compact chips with a small fixed angular footprint.
    if (depth === 0) return c.id === expandedId ? leafCount(c) : 1.25;
    return leafCount(c);
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let cursor = angle - span / 2;
  children.forEach((child, i) => {
    const childSpan = (span * (weights[i] ?? 1)) / total;
    const childAngle = cursor + childSpan / 2;
    cursor += childSpan;
    const open = depth === 0 ? child.id === expandedId : true;
    place(out, child, node.id, depth + 1, childAngle, childSpan, open, expandedId);
  });
}

/**
 * Deterministic radial layout. `expandedId` names the single open branch
 * (accordion) so the inline map always fits its column; pass `"*"` semantics
 * by expanding branches upstream is intentionally unsupported — the
 * fullscreen view calls `layoutMindMapExpanded` instead.
 */
export function layoutMindMap(
  root: MindMapNode,
  expandedId: string | null,
): MindMapLayout {
  const out: MindMapLayout = { nodes: [], edges: [], width: 0, height: 0, cx: 0, cy: 0 };
  // Start at the top and sweep the full circle.
  place(out, root, null, 0, -Math.PI / 2, Math.PI * 2, true, expandedId);
  finishExtents(out);
  return out;
}

// Fullscreen shows every node WITH its detail text, so boxes are tall and a
// radial fan overlaps. A two-sided horizontal tree cannot overlap by
// construction: leaves are stacked rows, parents center on their children.
const COL_X = [0, 250, 500, 720];
const ROW_H = 120;

function placeTree(
  out: MindMapLayout,
  node: MindMapNode,
  parentId: string | null,
  depth: number,
  side: 1 | -1,
  topRow: number,
): number {
  const rows = leafCount(node);
  const x = side * (COL_X[Math.min(depth, COL_X.length - 1)] ?? 0);
  const y = (topRow + rows / 2) * ROW_H;
  out.nodes.push({ node, parentId, depth, x, y, hiddenCount: 0 });
  if (parentId !== null) out.edges.push({ from: parentId, to: node.id });
  let cursor = topRow;
  for (const child of node.children ?? []) {
    cursor += placeTree(out, child, node.id, depth + 1, side, cursor);
  }
  return rows;
}

/** Fullscreen variant: every branch open, split into left/right columns. */
export function layoutMindMapExpanded(root: MindMapNode): MindMapLayout {
  const out: MindMapLayout = { nodes: [], edges: [], width: 0, height: 0, cx: 0, cy: 0 };
  const children = root.children ?? [];
  // Balance sides by leaf weight: fill right first, overflow to the left.
  const weights = children.map((c) => leafCount(c));
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const right: MindMapNode[] = [];
  const left: MindMapNode[] = [];
  let acc = 0;
  children.forEach((child, i) => {
    (acc < total / 2 ? right : left).push(child);
    acc += weights[i] ?? 0;
  });
  const rowsOf = (side: MindMapNode[]) =>
    side.reduce((n, c) => n + leafCount(c), 0);
  const tallest = Math.max(rowsOf(right), rowsOf(left), 1);
  out.nodes.push({
    node: root,
    parentId: null,
    depth: 0,
    x: 0,
    y: (tallest * ROW_H) / 2,
    hiddenCount: 0,
  });
  for (const [side, list] of [[1, right], [-1, left]] as const) {
    let cursor = (tallest - rowsOf(list)) / 2;
    for (const child of list) {
      cursor += placeTree(out, child, root.id, 1, side, cursor);
    }
  }
  finishExtents(out);
  return out;
}

function finishExtents(out: MindMapLayout): void {
  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;
  for (const p of out.nodes) {
    minX = Math.min(minX, p.x - BOX_W / 2);
    maxX = Math.max(maxX, p.x + BOX_W / 2);
    minY = Math.min(minY, p.y - BOX_H / 2);
    maxY = Math.max(maxY, p.y + BOX_H / 2);
  }
  const pad = 16;
  out.width = maxX - minX + pad * 2;
  out.height = maxY - minY + pad * 2;
  out.cx = -minX + pad;
  out.cy = -minY + pad;
}
