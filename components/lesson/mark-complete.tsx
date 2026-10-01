"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { IconCircleCheck } from "@tabler/icons-react";
import { toast } from "sonner";
import type { LessonSlug } from "@/content/slugs";
import type { ProgressMap } from "@/lib/curriculum";
import { markComplete } from "@/lib/progress";
import { fetchJson } from "@/lib/hooks/fetch-json";
import { useInvalidateGamification } from "@/lib/hooks/use-gamification";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useInvalidateLessonState,
  useLessonState,
} from "@/lib/hooks/use-lesson-state";
import { cn } from "@/lib/utils";

// Loaded on completion only: it carries Inko and the confetti.
const LessonCompleteCard = dynamic(() =>
  import("@/components/celebrate/lesson-complete-card").then((m) => m.LessonCompleteCard),
);

type Props = {
  slug: string;
  next?: { slug: string; title: string };
  /** Core lessons of this lesson's module ([] when this lesson is not core). */
  moduleSlugs: LessonSlug[];
};

export function MarkComplete({ slug, next, moduleSlugs }: Props) {
  const t = useTranslations("lesson");
  const [pending, startTransition] = useTransition();
  const { data } = useLessonState(slug);
  const invalidate = useInvalidateLessonState(slug);
  const invalidateXp = useInvalidateGamification();
  const queryClient = useQueryClient();
  // Set only by a completion in this visit, so revisiting a done lesson is quiet.
  const [celebrate, setCelebrate] = useState<{ moduleDone: boolean } | null>(null);
  // undefined means the reader has not touched the dial, so the stored value
  // still applies; null is a deliberate "no confidence given".
  const [picked, setPicked] = useState<number | null | undefined>(undefined);

  // Both branches below assert something ("you finished this" / "you have not"),
  // so until the answer arrives neither may render. Same outer Card, so the
  // page does not jump when it resolves.
  if (!data) {
    return (
      <Card className="mt-10" aria-busy>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-9 w-32" />
        </CardContent>
      </Card>
    );
  }

  const completed = data.row?.status === "completed";
  const confidence = data.row?.confidence ?? null;
  const selected = picked === undefined ? confidence : picked;

  const status = confidence
    ? t("completedWithConfidence", { confidence })
    : t("completed");

  if (completed && celebrate) {
    return <LessonCompleteCard status={status} next={next} moduleDone={celebrate.moduleDone} />;
  }

  if (completed) {
    return (
      <div className="mt-10 flex items-center gap-2 rounded-lg border p-4">
        <IconCircleCheck className="text-link size-5" />
        <span className="font-medium">{status}</span>
      </div>
    );
  }

  return (
    <Card className="mt-10">
      <CardHeader>
        <CardTitle>{t("markCompleteTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-4">
        <div
          role="radiogroup"
          aria-label={t("confidenceLabel")}
          className="flex items-center gap-1"
        >
          <span className="text-muted-foreground mr-2 text-sm">
            {t("confidenceLabel")}
          </span>
          {[1, 2, 3, 4, 5].map((n) => (
            <Button
              key={n}
              variant="outline"
              size="icon-sm"
              role="radio"
              aria-checked={selected === n}
              className={cn(
                selected === n &&
                  "bg-primary! text-primary-foreground! hover:bg-primary/90!",
              )}
              onClick={() => setPicked(selected === n ? null : n)}
            >
              {n}
            </Button>
          ))}
        </div>
        <Button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await markComplete(slug, selected ?? undefined);
              toast.success(t("markedToast"));
              // A failed read only costs the module confetti, never the completion.
              const { progress } = await fetchJson<{ progress: ProgressMap }>(
                "/api/progress-map",
              ).catch(() => ({ progress: {} as ProgressMap }));
              const moduleDone =
                moduleSlugs.length > 0 &&
                moduleSlugs.every((s) => progress[s] === "completed");
              setCelebrate({ moduleDone });
              // router.refresh() used to repaint this from the server read the
              // page no longer performs; the query is the source of truth now.
              await invalidate();
              void invalidateXp();
              void queryClient.invalidateQueries({ queryKey: ["progress-map"] });
            })
          }
        >
          {t("markComplete")}
        </Button>
      </CardContent>
    </Card>
  );
}
