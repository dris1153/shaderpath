"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { useLessonState } from "@/lib/hooks/use-lesson-state";
import { ExerciseCard } from "./exercise-card";
import type { AttemptStatus, ExerciseVM } from "./types";

export function ExerciseList({
  lessonSlug,
  items,
}: {
  lessonSlug: string;
  items: {
    exercise: ExerciseVM;
    prompt: ReactNode;
    solutionNote: ReactNode;
    solutionHtml: string | null;
  }[];
}) {
  const t = useTranslations("exercise");
  const { data, isPending } = useLessonState(lessonSlug);
  const [overrides, setOverrides] = useState<Record<string, AttemptStatus>>({});

  const heading = (
    <div className="flex items-baseline justify-between gap-4 border-b pb-2">
      <h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>
      {data ? (
        <span className="text-muted-foreground text-sm tabular-nums">
          {t("summary", {
            completed: items.filter(
              (i) =>
                (overrides[i.exercise.id] ?? data.attempts[i.exercise.id]?.status) ===
                "completed",
            ).length,
            total: items.length,
          })}
        </span>
      ) : (
        <Skeleton className="h-4 w-24" />
      )}
    </div>
  );

  // ExerciseCard seeds its state — including the code editor's contents — once
  // at mount, so it must not mount before the answer is known. Seeding it with
  // starter code while the reader's saved attempt is still in flight would show
  // work that is not theirs, and risk overwriting what is.
  //
  // `isPending` false with no data means the read failed: the cards still mount,
  // because the exercise text is content and should survive a database outage.
  // Writes from them will fail and toast, same as anywhere else in the app.
  if (isPending) {
    return (
      <section className="mt-10" data-testid="exercise-section" aria-busy>
        {heading}
        <div className="mt-4 space-y-4">
          {items.map((item) => (
            <Skeleton key={item.exercise.id} className="h-16 w-full" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10" data-testid="exercise-section">
      {heading}
      <div className="mt-4 space-y-4">
        {items.map((item, i) => (
          <ExerciseCard
            key={item.exercise.id}
            lessonSlug={lessonSlug}
            exercise={item.exercise}
            index={i + 1}
            initial={data?.attempts[item.exercise.id] ?? null}
            prompt={item.prompt}
            solutionNote={item.solutionNote}
            solutionHtml={item.solutionHtml}
            onStatusChange={(id, status) =>
              setOverrides((prev) => ({ ...prev, [id]: status }))
            }
          />
        ))}
      </div>
    </section>
  );
}
