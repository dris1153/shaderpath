import { describe, expect, it } from "vitest";
import { LESSONS } from "@/content/curriculum";
import {
  PITFALLS_REGISTRY,
  TOC_REGISTRY,
} from "@/content/lesson-registry.generated";
import type { LessonMeta, MindMapNode } from "@/content/types";
import { getDependents } from "@/lib/curriculum";
import { buildLessonMindMap, type MindMapStrings } from "@/lib/mind-map";
import {
  layoutMindMap,
  layoutMindMapExpanded,
} from "@/lib/mind-map-layout";

const strings: MindMapStrings = {
  objectives: "Objectives",
  content: "Content",
  pitfalls: "Pitfalls",
  links: "Links",
  prerequisiteNote: "before",
  dependentNote: "after",
};

const meta: LessonMeta = {
  slug: "matrix-basics" as LessonMeta["slug"],
  trackId: "math",
  moduleId: "m",
  order: 1,
  title: { vi: "Ma trận", en: "Matrices" },
  summary: { vi: "Tóm tắt", en: "Summary" },
  difficulty: 2,
  estimatedMinutes: 30,
  tags: [],
  tier: "core",
  kind: "lesson",
  prerequisites: [],
  objectives: { vi: ["A", "B"], en: ["A", "B"] },
  hasDemo: false,
  hasPlayground: false,
};

function build(overrides: Partial<Parameters<typeof buildLessonMindMap>[0]> = {}) {
  return buildLessonMindMap({
    meta,
    locale: "vi",
    toc: [
      { id: "one", text: "Chủ đề: ý chính", depth: 2 },
      { id: "one-sub", text: "Mục con", depth: 3 },
      { id: "two", text: "Không có hai chấm", depth: 2 },
    ],
    pitfalls: [{ label: "P1", detail: "d1" }],
    prerequisites: [],
    dependents: [],
    strings,
    ...overrides,
  });
}

describe("getDependents", () => {
  it("is the exact inverse of prerequisites across the curriculum", () => {
    for (const l of LESSONS) {
      for (const p of l.prerequisites) {
        expect(
          getDependents(p).map((d) => d.slug),
          `${p} should list ${l.slug} as dependent`,
        ).toContain(l.slug);
      }
      for (const d of getDependents(l.slug)) {
        expect(d.prerequisites).toContain(l.slug);
      }
    }
  });
});

describe("buildLessonMindMap", () => {
  it("splits section headings at the first colon and nests depth 3", () => {
    const content = build().children?.find((b) => b.id === "content");
    const one = content?.children?.[0];
    expect(one).toMatchObject({ id: "one", label: "Chủ đề", detail: "ý chính" });
    expect(one?.children?.[0]).toMatchObject({ id: "one-sub", label: "Mục con" });
    expect(content?.children?.[1]).toMatchObject({
      id: "two",
      label: "Không có hai chấm",
    });
    expect(content?.children?.[1]?.detail).toBeUndefined();
  });

  it("hides empty branches", () => {
    const tree = build({ toc: [], pitfalls: [] });
    const ids = (tree.children ?? []).map((b) => b.id);
    expect(ids).toEqual(["objectives"]);
  });

  it("builds link children with lesson slugs as ids", () => {
    const prereq = { ...meta, slug: "quaternions" as LessonMeta["slug"] };
    const dependent = {
      ...meta,
      slug: "homogeneous-coordinates-4x4" as LessonMeta["slug"],
    };
    const links = build({
      prerequisites: [prereq],
      dependents: [dependent],
    }).children?.find((b) => b.id === "links");
    expect(links?.children?.map((c) => c.id)).toEqual([
      "quaternions",
      "homogeneous-coordinates-4x4",
    ]);
    expect(links?.children?.[0]?.detail).toBe("before");
    expect(links?.children?.[1]?.detail).toBe("after");
  });

  it("keeps node ids unique in every real lesson tree (both locales)", () => {
    for (const lesson of LESSONS) {
      for (const locale of ["vi", "en"] as const) {
        const tree = buildLessonMindMap({
          meta: lesson,
          locale,
          toc: TOC_REGISTRY[lesson.slug]?.[locale] ?? [],
          pitfalls: PITFALLS_REGISTRY[lesson.slug]?.[locale] ?? [],
          prerequisites: lesson.prerequisites
            .map((p) => LESSONS.find((l) => l.slug === p))
            .filter((l): l is LessonMeta => l !== undefined),
          dependents: getDependents(lesson.slug),
          strings,
        });
        const ids: string[] = [];
        const walk = (n: MindMapNode) => {
          ids.push(n.id);
          n.children?.forEach(walk);
        };
        walk(tree);
        const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
        expect(dupes, `${lesson.slug} (${locale}) duplicate ids`).toEqual([]);
      }
    }
  });
});

describe("layoutMindMap", () => {
  const tree: MindMapNode = build();

  it("is deterministic", () => {
    expect(layoutMindMap(tree, "content")).toEqual(layoutMindMap(tree, "content"));
    expect(layoutMindMapExpanded(tree)).toEqual(layoutMindMapExpanded(tree));
  });

  it("places only the expanded branch's children (accordion)", () => {
    const layout = layoutMindMap(tree, "content");
    const ids = new Set(layout.nodes.map((p) => p.node.id));
    expect(ids.has("one")).toBe(true);
    expect(ids.has("pitfall-0")).toBe(false);
    const pitfalls = layout.nodes.find((p) => p.node.id === "pitfalls");
    expect(pitfalls?.hiddenCount).toBe(1);
  });

  it("expanded layout places every node with finite coordinates", () => {
    const layout = layoutMindMapExpanded(tree);
    const countNodes = (n: MindMapNode): number =>
      1 + (n.children ?? []).reduce((s, c) => s + countNodes(c), 0);
    expect(layout.nodes.length).toBe(countNodes(tree));
    for (const p of layout.nodes) {
      expect(Number.isFinite(p.x), p.node.id).toBe(true);
      expect(Number.isFinite(p.y), p.node.id).toBe(true);
    }
    expect(layout.width).toBeGreaterThan(0);
    expect(layout.height).toBeGreaterThan(0);
  });

  it("snaps every coordinate, so SSR and the client agree bit for bit", () => {
    // sin/cos are not bit-identical across V8 builds, so an unsnapped
    // coordinate renders as `top:149.90528800979624` on the server and
    // `…627` in the browser. React answers that mismatch by throwing away the
    // server tree and re-rendering the whole subtree — the static render for
    // that page is lost and every element inside it is replaced.
    for (const layout of [layoutMindMap(tree, "content"), layoutMindMapExpanded(tree)]) {
      for (const p of layout.nodes) {
        expect(
          Math.abs(p.x * 100 - Math.round(p.x * 100)),
          `${p.node.id}: x=${p.x} is not snapped to 0.01`,
        ).toBeLessThan(1e-9);
        expect(
          Math.abs(p.y * 100 - Math.round(p.y * 100)),
          `${p.node.id}: y=${p.y} is not snapped to 0.01`,
        ).toBeLessThan(1e-9);
      }
    }
  });

  it("every edge references placed nodes", () => {
    const layout = layoutMindMap(tree, "content");
    const ids = new Set(layout.nodes.map((p) => p.node.id));
    for (const e of layout.edges) {
      expect(ids.has(e.from)).toBe(true);
      expect(ids.has(e.to)).toBe(true);
    }
  });
});
