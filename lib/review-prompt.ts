import {
  pick,
  type Exercise,
  type Locale,
  type Localized,
  type ReviewCard,
} from "@/content/types";

// What a due review asks. Pure so the rotation and the fallback order are
// unit-tested rather than trusted.

export type ReviewPrompt =
  | { source: "card"; cardId: string; question: string; answer: string }
  | { source: "exercise"; exerciseId: string; question: string; answer: string }
  | { source: "objectives"; objectives: string[] };

export function pickReviewPrompt({
  cards,
  exercises,
  objectives,
  reviewCount,
  locale,
}: {
  cards: readonly ReviewCard[] | undefined;
  exercises: readonly Exercise[] | undefined;
  objectives: Localized<string[]>;
  reviewCount: number;
  locale: Locale;
}): ReviewPrompt {
  // Schedules are per lesson, so rotating on reviewCount shows a different card
  // each time without a per-card table.
  if (cards && cards.length > 0) {
    const card = cards[reviewCount % cards.length]!;
    return {
      source: "card",
      cardId: card.id,
      question: pick(card.q, locale),
      answer: pick(card.a, locale),
    };
  }

  // Only a concept exercise is a recall question; code and build prompts are
  // things to go and do.
  const exercise = exercises?.find((e) => e.kind === "concept");
  if (exercise) {
    return {
      source: "exercise",
      exerciseId: exercise.id,
      question: pick(exercise.prompt, locale),
      answer: exercise.solutionNote
        ? pick(exercise.solutionNote, locale)
        : // PromptBody has no lists; one paragraph per item.
          exercise.checklist.map((c) => pick(c, locale)).join("\n\n"),
    };
  }

  return { source: "objectives", objectives: pick(objectives, locale) };
}
