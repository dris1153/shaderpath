"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { useTranslations } from "next-intl";
import { IconFlag } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

// Sizes are world units: the card fold shows the overview at zoom ~0.25, so a
// 48-unit title reads at 12px there and grows as you zoom in. Everything the
// eye has to compare at that distance is length, not colour — see
// lib/roadmap/encoding.ts for why.

const SIDES = [
  ["t", Position.Top],
  ["r", Position.Right],
  ["b", Position.Bottom],
  ["l", Position.Left],
] as const;

/** Chain edges run between tracks, and xyflow draws nothing to a node without
 *  handles. Every side carries both kinds so each fold can leave from
 *  whichever side faces the next station. */
export function ChainHandles() {
  return SIDES.map(([id, position]) => (
    <span key={id}>
      <Handle id={`s-${id}`} type="source" position={position} className="invisible!" />
      <Handle id={`t-${id}`} type="target" position={position} className="invisible!" />
    </span>
  ));
}

export type TrackCardData = {
  order: number;
  title: string;
  href: string;
  w: number;
  h: number;
  hours: string;
  pips: number;
  difficulty: number;
  checkpoints: number;
  /** Bar length as a fraction of the card: the track's hours. */
  road: number;
  /** Fill of that bar, 0–1; undefined for a guest, who gets the road unpainted. */
  done: number | undefined;
  coreCompleted: number;
  coreTotal: number;
  isTerminus: boolean;
  summary: string;
  /** The card is sized for the lessons that appear inside it when zoomed in.
   *  Wide, those are hidden and the body would be an empty box — so the
   *  summary fills it until the rows arrive. */
  showSummary: boolean;
};

export function TrackCardNode({ data }: NodeProps<Node<TrackCardData>>) {
  const t = useTranslations("roadmap");
  return (
    <div
      style={{ width: data.w, height: data.h }}
      className={cn(
        "bg-card rounded-[28px] border-4 p-6 shadow-[0_10px_0_var(--border)]",
        data.isTerminus && "border-primary bg-secondary shadow-[0_10px_0_var(--primary-edge)]",
      )}
    >
      <ChainHandles />
      <p className="flex items-baseline gap-4 truncate text-[48px] leading-[64px] font-semibold">
        <span className="text-muted-foreground tabular-nums">
          {String(data.order).padStart(2, "0")}
        </span>
        <Link href={data.href} className="truncate hover:underline">
          {data.title}
        </Link>
      </p>
      <p className="text-muted-foreground mt-1 flex items-center gap-5 text-[34px] leading-[48px] tabular-nums">
        {/* Five pips carry difficulty without colour, so it survives
            greyscale and never competes with the progress fill. */}
        <span
          className="flex gap-2"
          role="img"
          aria-label={t("difficulty", { level: data.difficulty.toFixed(1) })}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={cn(
                "size-6 rounded-full border-4 border-current",
                i <= data.pips ? "bg-current" : i - 0.5 === data.pips && "bg-current/40",
              )}
            />
          ))}
        </span>
        <span>{t("mapHours", { hours: data.hours })}</span>
        <span className="flex items-center gap-2">
          <IconFlag className="size-8" aria-hidden />
          {t("mapCheckpoints", { count: data.checkpoints })}
        </span>
        {data.isTerminus && (
          <span className="text-link font-medium">{t("mapTerminus")}</span>
        )}
      </p>
      {/* The road: its length is the track's hours, and progress paints onto
          it rather than getting a second bar to compete with. */}
      <div className="mt-3 flex items-center gap-4">
        <div
          className="bg-muted relative h-6 overflow-hidden rounded-full"
          style={{ width: `${Math.max(data.road * 100, 8)}%` }}
        >
          {data.done !== undefined && (
            <div
              className="bg-primary absolute inset-y-0 left-0"
              style={{ width: `${data.done * 100}%` }}
            />
          )}
        </div>
        {data.done !== undefined && (
          <span className="text-muted-foreground shrink-0 text-[28px] tabular-nums">
            {t("coreProgress", {
              completed: data.coreCompleted,
              total: data.coreTotal,
            })}
          </span>
        )}
      </div>
      {data.showSummary && (
        <p className="text-muted-foreground mt-10 line-clamp-4 text-[38px] leading-[54px]">
          {data.summary}
        </p>
      )}
    </div>
  );
}

export type ModuleRowData = { title: string; w: number; h: number };

export function ModuleRowNode({ data }: NodeProps<Node<ModuleRowData>>) {
  return (
    <p
      style={{ width: data.w, height: data.h }}
      className="text-muted-foreground truncate text-[30px] leading-[40px] font-medium tracking-wide uppercase"
    >
      {data.title}
    </p>
  );
}

export type LessonRowData = {
  title: string;
  slug: string;
  w: number;
  h: number;
  state: "pending" | "completed" | "unlocked" | "locked";
  isCheckpoint: boolean;
  isElective: boolean;
};

export function LessonRowNode({ data }: NodeProps<Node<LessonRowData>>) {
  return (
    <div
      style={{ width: data.w, height: data.h }}
      className={cn(
        "flex items-center gap-2 truncate text-[16px] leading-[24px]",
        data.state === "completed" && "text-link",
        data.state === "locked" && "opacity-50",
        // Elective reads as optional, or 136 hours looks mandatory.
        data.isElective && "text-muted-foreground italic",
      )}
    >
      <Handle type="target" position={Position.Left} className="invisible!" />
      {data.isCheckpoint && <IconFlag className="size-4 shrink-0" aria-hidden />}
      <Link href={`/lesson/${data.slug}`} className="truncate hover:underline">
        {data.title}
      </Link>
      <Handle type="source" position={Position.Right} className="invisible!" />
    </div>
  );
}

/** What the card encodes. Shown to guests too: difficulty, length and
 *  checkpoints are structure, not progress. */
export function MapLegend() {
  const t = useTranslations("roadmap");
  return (
    <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
      <span className="flex items-center gap-1.5">
        <span className="flex gap-0.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2 rounded-full bg-current" />
          ))}
          {[0, 1].map((i) => (
            <span key={i} className="size-2 rounded-full border border-current" />
          ))}
        </span>
        {t("mapLegendDifficulty")}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="bg-muted h-1.5 w-8 rounded-full" aria-hidden />
        {t("mapLegendRoad")}
      </span>
      <span className="flex items-center gap-1.5">
        <IconFlag className="size-3.5" aria-hidden />
        {t("checkpoint")}
      </span>
    </div>
  );
}
