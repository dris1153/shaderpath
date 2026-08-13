"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ExerciseCard } from "./exercise-card";
import type { AttemptStatus, AttemptVM, ExerciseVM } from "./types";

export function ExerciseList({
  lessonSlug,
  items,
}: {
  lessonSlug: string;
  items: {
    exercise: ExerciseVM;
    initial: AttemptVM | null;
    prompt: ReactNode;
    solutionHtml: string | null;
  }[];
}) {
  const t = useTranslations("exercise");
  const [statuses, setStatuses] = useState<Record<string, AttemptStatus>>(
    () =>
      Object.fromEntries(
        items.map((i) => [i.exercise.id, i.initial?.status ?? "not_started"]),
      ),
  );

  const completed = Object.values(statuses).filter(
    (s) => s === "completed",
  ).length;

  return (
    <section className="mt-10" data-testid="exercise-section">
      <div className="flex items-baseline justify-between gap-4 border-b pb-2">
        <h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>
        <span className="text-muted-foreground text-sm tabular-nums">
          {t("summary", { completed, total: items.length })}
        </span>
      </div>
      <div className="mt-4 space-y-4">
        {items.map((item, i) => (
          <ExerciseCard
            key={item.exercise.id}
            lessonSlug={lessonSlug}
            exercise={item.exercise}
            index={i + 1}
            initial={item.initial}
            prompt={item.prompt}
            solutionHtml={item.solutionHtml}
            onStatusChange={(id, status) =>
              setStatuses((prev) => ({ ...prev, [id]: status }))
            }
          />
        ))}
      </div>
    </section>
  );
}
