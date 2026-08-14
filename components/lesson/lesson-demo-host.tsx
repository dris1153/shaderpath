"use client";

import { Suspense, lazy, type ComponentType } from "react";
import { DEMO_REGISTRY } from "@/content/demo-registry.generated";
import type { LessonSlug } from "@/content/slugs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Client-side lazy boundary for lesson demos. Rendering the demo from the
// server page put the union of every demo's vendors (three/gsap) into the
// lesson route's eager chunks; React.lazy over the per-lesson import keeps
// them in on-demand chunks instead. Wrappers are built once at module scope
// (lazy() does not trigger the import) so no component is created in render.
const LAZY_DEMOS = new Map<LessonSlug, ComponentType>(
  (Object.keys(DEMO_REGISTRY) as LessonSlug[]).map((slug) => {
    const loader = DEMO_REGISTRY[slug];
    if (!loader) throw new Error(`demo registry hole: ${slug}`);
    return [slug, lazy(loader)];
  }),
);

export function LessonDemoHost({ slug }: { slug: LessonSlug }) {
  const LazyDemo = LAZY_DEMOS.get(slug);
  if (!LazyDemo) return null;

  return (
    <Suspense
      fallback={
        <Card className="my-6 p-4">
          <Skeleton className="aspect-video w-full" />
        </Card>
      }
    >
      <LazyDemo />
    </Suspense>
  );
}
