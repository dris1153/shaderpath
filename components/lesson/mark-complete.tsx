"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { toast } from "sonner";
import type { LessonSlug } from "@/content/slugs";
import type { ProgressMap } from "@/lib/curriculum";
import { markComplete } from "@/lib/progress";
import { fetchJson } from "@/lib/hooks/fetch-json";
import { useInvalidateGamification } from "@/lib/hooks/use-gamification";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

/** The centre of the lesson dock: finish the lesson, or say that it is finished. */
export function MarkComplete({ slug, next, moduleSlugs }: Props) {
  const t = useTranslations("lesson");
  const [pending, startTransition] = useTransition();
  const { data } = useLessonState(slug);
  const invalidate = useInvalidateLessonState(slug);
  const invalidateXp = useInvalidateGamification();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  // Set only by a completion in this visit, so revisiting a done lesson is quiet.
  const [celebrate, setCelebrate] = useState<{ moduleDone: boolean } | null>(null);
  // undefined means the reader has not touched the dial, so the stored value
  // still applies; null is a deliberate "no confidence given".
  const [picked, setPicked] = useState<number | null | undefined>(undefined);

  // Both branches below assert something ("you finished this" / "you have not"),
  // so until the answer arrives neither may render.
  if (!data) return <Skeleton aria-busy className="h-10 w-44 rounded-lg" />;

  const completed = data.row?.status === "completed";
  const confidence = data.row?.confidence ?? null;
  const selected = picked === undefined ? confidence : picked;

  if (completed) {
    return (
      <>
        {celebrate ? (
          <div className="absolute inset-x-0 bottom-full mb-3">
            <LessonCompleteCard next={next} moduleDone={celebrate.moduleDone} onClose={() => setCelebrate(null)} />
          </div>
        ) : null}
        <p className="flex items-center gap-1.5 text-sm font-bold">
          <IconCircleCheckFilled className="text-mint-edge size-5 shrink-0" aria-hidden />
          {confidence ? t("completedWithConfidence", { confidence }) : t("completed")}
        </p>
      </>
    );
  }

  const complete = () =>
    startTransition(async () => {
      await markComplete(slug, selected ?? undefined);
      setOpen(false);
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
    });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button />}>{t("finishLesson")}</PopoverTrigger>
      <PopoverContent side="top" className="w-auto gap-3">
        <p className="font-extrabold">{t("markCompleteTitle")}</p>
        <div role="radiogroup" aria-label={t("confidenceLabel")} className="flex flex-col gap-2">
          <span className="text-muted-foreground text-sm">{t("confidenceLabel")}</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Button
                key={n}
                variant="outline"
                size="icon-sm"
                role="radio"
                aria-checked={selected === n}
                className={cn(selected === n && "bg-primary! text-primary-foreground! hover:bg-primary/90!")}
                onClick={() => setPicked(selected === n ? null : n)}
              >
                {n}
              </Button>
            ))}
          </div>
        </div>
        <Button disabled={pending} onClick={complete}>
          {t("markComplete")}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
