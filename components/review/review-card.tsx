"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PromptBody } from "@/components/exercise/prompt-body";
import {
  REVIEW_CARDS_REGISTRY,
  REVIEW_EXERCISES_REGISTRY,
} from "@/content/review-registry.generated";
import { pick, type Locale } from "@/content/types";
import { Link } from "@/i18n/navigation";
import { getLesson } from "@/lib/curriculum";
import type { QueueItem } from "@/lib/dashboard-queue";
import { gradeReview } from "@/lib/review";
import { useInvalidateGamification } from "@/lib/hooks/use-gamification";
import { pickReviewPrompt } from "@/lib/review-prompt";
import type { ReviewQuality } from "@/lib/srs";

const GRADES: ReviewQuality[] = ["again", "hard", "good", "easy"];

async function loadSources(slug: QueueItem["lessonSlug"]) {
  // Each source fails on its own: a chunk that will not load drops that
  // source only, and the selector falls through to the next.
  const [cards, exercises] = await Promise.all([
    REVIEW_CARDS_REGISTRY[slug]?.()
      .then((m) => m.reviewCards)
      .catch(() => undefined),
    REVIEW_EXERCISES_REGISTRY[slug]?.()
      .then((m) => m.exercises)
      .catch(() => undefined),
  ]);
  return { cards, exercises };
}

export function ReviewCardView({
  item,
  position,
  total,
  onGraded,
}: {
  item: QueueItem;
  position: number;
  total: number;
  onGraded: () => void;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations("review");
  const slug = item.lessonSlug;
  const lesson = getLesson(slug);
  const [revealed, setRevealed] = useState(false);
  const [pending, startTransition] = useTransition();
  const questionRef = useRef<HTMLHeadingElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);
  const invalidateXp = useInvalidateGamification();

  const sources = useQuery({
    queryKey: ["review-source", slug],
    queryFn: () => loadSources(slug),
    staleTime: Infinity,
  });

  // Keyboard flow: the answer takes focus when shown, and each new card's
  // question takes it after a grade — but not the first, which would steal
  // focus from the page on load.
  useEffect(() => {
    if (revealed) answerRef.current?.focus();
  }, [revealed]);
  useEffect(() => {
    if (position > 1) questionRef.current?.focus();
  }, [position]);

  if (!lesson) return null;
  const href = `/lesson/${slug}`;
  const prompt = sources.data
    ? pickReviewPrompt({
        cards: sources.data.cards,
        exercises: sources.data.exercises,
        objectives: lesson.objectives,
        reviewCount: item.reviewCount ?? 0,
        locale,
      })
    : null;

  const grade = (quality: ReviewQuality) =>
    startTransition(async () => {
      try {
        await gradeReview(slug, quality);
        void invalidateXp();
        onGraded();
      } catch {
        toast.error(t("gradeError"));
      }
    });

  return (
    <Card className="mt-6 gap-4 px-5 py-5">
      <p className="text-muted-foreground text-sm">
        {t("counter", { current: position, total })} ·{" "}
        <Link href={href} className="hover:underline">
          {pick(lesson.title, locale)}
        </Link>
      </p>

      {item.kind === "leech" && (
        <p className="text-sm text-amber-800 dark:text-amber-400">
          {t("leechNote")}{" "}
          <Link href={href} className="underline underline-offset-4">
            {t("openLesson")}
          </Link>
        </p>
      )}

      <h2 ref={questionRef} tabIndex={-1} className="sr-only">
        {t("question")}
      </h2>
      {!prompt ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : prompt.source === "objectives" ? (
        <div className="space-y-2 text-sm leading-6">
          <p>{t("objectivesQuestion")}</p>
          <ul className="list-disc space-y-1 pl-5">
            {prompt.objectives.map((o) => (
              // Objectives carry `code` spans, so they go through PromptBody too.
              <li key={o}>
                <PromptBody text={o} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="space-y-2">
          {prompt.source === "exercise" && (
            <p className="text-muted-foreground text-xs">{t("fromExercise")}</p>
          )}
          <PromptBody text={prompt.question} />
        </div>
      )}

      {revealed && prompt ? (
        <div
          ref={answerRef}
          tabIndex={-1}
          role="region"
          aria-label={t("answer")}
          className="border-t pt-4 outline-none"
        >
          {prompt.source === "objectives" ? (
            <Link
              href={href}
              className="text-link text-sm underline underline-offset-4"
            >
              {t("openLesson")}
            </Link>
          ) : (
            <PromptBody text={prompt.answer} />
          )}
        </div>
      ) : (
        <Button
          variant="outline"
          className="self-start"
          disabled={!prompt}
          onClick={() => setRevealed(true)}
        >
          {t("showAnswer")}
        </Button>
      )}

      {/* Rendered from the start and disabled until the answer is shown, so
          grading always follows a real attempt and nothing pops in on reveal. */}
      <div className="flex flex-wrap gap-2 border-t pt-4">
        {GRADES.map((q) => (
          <Button
            key={q}
            size="sm"
            variant={q === "good" ? "default" : "outline"}
            disabled={!revealed || pending}
            // Keeps focus on the button while a grade is saving; a plain
            // disabled button drops it to <body> and a failed save strands it.
            focusableWhenDisabled
            onClick={() => grade(q)}
          >
            {t(`grade_${q}`)}
          </Button>
        ))}
      </div>
    </Card>
  );
}
