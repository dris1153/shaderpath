"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ChainHandles, type LessonRowData } from "./map-card-nodes";

// The original map's nodes, kept only for the columns layout so it can be
// compared against the card layouts in the app.

export type LessonNodeData = {
  title: string;
  state: LessonRowData["state"];
  slug: string;
  isCheckpoint: boolean;
};
export type LabelNodeData = {
  title: string;
  kind: "track" | "module";
  href?: string;
};

export function LessonNode({ data }: NodeProps<Node<LessonNodeData>>) {
  const t = useTranslations("roadmap");
  return (
    <div
      className={cn(
        "bg-card w-56 rounded-md border px-2.5 py-1.5 text-xs leading-snug",
        data.state === "completed" && "border-primary bg-primary/10",
        data.state === "locked" && "border-dashed opacity-60",
      )}
    >
      <Handle type="target" position={Position.Left} className="invisible!" />
      <Link href={`/lesson/${data.slug}`} className="hover:underline">
        {data.title}
      </Link>
      {data.isCheckpoint && (
        <span className="text-muted-foreground block text-[10px]">
          {t("checkpoint")}
        </span>
      )}
      <Handle type="source" position={Position.Right} className="invisible!" />
    </div>
  );
}

export function LabelNode({ data }: NodeProps<Node<LabelNodeData>>) {
  return data.kind === "track" ? (
    // A link, not a heading: 14 headings inside a canvas would clutter the
    // page outline.
    <p className="w-56 text-sm font-semibold">
      <ChainHandles />
      <Link href={data.href ?? "/roadmap"} className="hover:underline">
        {data.title}
      </Link>
    </p>
  ) : (
    <p className="text-muted-foreground w-56 text-[10px] font-medium tracking-wide uppercase">
      {data.title}
    </p>
  );
}
