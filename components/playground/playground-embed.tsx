"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy boundary for the embedded GLSL playground. PlaygroundClient's graph
// includes three (shader preview) and the Monaco loader — importing it
// statically from mdx-components/exercise panes put ~230KB of vendor JS into
// every lesson route's eager chunks. dynamic() keeps it per-use.
const PlaygroundClient = dynamic(
  () =>
    import("./playground-client").then((m) => ({
      default: m.PlaygroundClient,
    })),
  {
    loading: () => (
      <Card className="my-4 p-4">
        <Skeleton className="h-64 w-full" />
      </Card>
    ),
  },
);

export function PlaygroundEmbed(props: {
  compact?: boolean;
  initialSource?: string;
  onSourceChange?: (source: string) => void;
}) {
  return <PlaygroundClient {...props} />;
}
