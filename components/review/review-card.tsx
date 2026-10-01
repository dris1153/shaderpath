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
import { sm2Update, type ReviewQuality } from "@/lib/srs";

const GRADES: ReviewQuality[] = ["again", "hard", "good", "easy"];
const GRADE_VARIANT = { again: "coral", hard: "secondary", good: "default", easy: "sun" } as const;

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
  /** Receives the interval the grade scheduled, in days. */
  onGraded: (nextDays: number) => void;
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

  const prompt = lesson && sources.data
    ? pickReviewPrompt({
        cards: sources.data.cards,
        exercises: sources.data.exercises,
        objectives: lesson.objectives,
        reviewCount: item.reviewCount ?? 0,
        locale,
      })
    : null;

  // The same SM-2 step the server applies, so each button can say what it schedules.
  const nextDays = (quality: ReviewQuality) =>
    sm2Update(
      { intervalDays: item.intervalDays ?? 1, easeFactor: item.easeFactor ?? 2.5, reviewCount: item.reviewCount ?? 0 },
      quality,
    ).intervalDays;

  const grade = (quality: ReviewQuality) =>
    startTransition(async () => {
      try {
        await gradeReview(slug, quality);
        void invalidateXp();
        onGraded(nextDays(quality));
      } catch {
        toast.error(t("gradeError"));
      }
    });

  // Space or Enter shows the answer, 1–4 grade. Keys aimed at a field, link or
  // button keep their own meaning.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey || target?.closest("input, textarea, select, a, button, [contenteditable]")) return;
      if (!revealed && prompt && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        setRevealed(true);
      } else if (revealed && !pending && /^[1-4]$/.test(e.key)) {
        e.preventDefault();
        grade(GRADES[Number(e.key) - 1]!);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!lesson) return null;
  const href = `/lesson/${slug}`;

  return (
    <Card className="mt-6 gap-4 px-5 py-5">
      <p className="text-muted-foreground text-sm">
        {t("counter", { current: position, total })} ·{" "}
        <Link href={href} className="hover:underline">
          {pick(lesson.title, locale)}
        </Link>
      </p>

      {item.kind === "leech" && (
        <p className="text-foreground rounded-lg bg-[color-mix(in_oklch,var(--sun)_22%,var(--card))] px-3 py-2 text-sm">
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
      <div className="grid grid-cols-2 gap-2 border-t-2 pt-4 sm:grid-cols-4">
        {GRADES.map((q, i) => (
          <Button
            key={q}
            variant={GRADE_VARIANT[q]}
            disabled={!revealed || pending}
            // Keeps focus on the button while a grade is saving; a plain
            // disabled button drops it to <body> and a failed save strands it.
            focusableWhenDisabled
            onClick={() => grade(q)}
            className="h-auto flex-col gap-0 py-2"
          >
            {t(`grade_${q}`)}
            {/* aria-hidden keeps the accessible name the grade itself; the
                interval is a visual hint and the keys are listed below. */}
            <span aria-hidden className="text-[11px] font-semibold tracking-normal normal-case">
              <kbd className="font-mono">{i + 1}</kbd> · {t("intervalDays", { days: nextDays(q) })}
            </span>
          </Button>
        ))}
      </div>
      <p className="text-muted-foreground hidden text-xs sm:block">{t("keysHint")}</p>
    </Card>
  );
}
