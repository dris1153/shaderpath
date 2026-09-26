import {
  CORE_LOCALES,
  type LessonKind,
  type ReviewCard,
} from "@/content/types";

// Validates one lesson's review-cards.ts. Pure so lint-content.ts and the unit
// tests share the exact same rules.

export const MIN_CARDS = 2;
export const MAX_CARDS = 5;

// PromptBody prints markup it does not know as literal text, so a JSX or HTML
// tag in a card would reach the learner as angle brackets.
const TAG = /<[A-Za-z]/;

/** `vec<3>` in code or `a<b` in math is not markup. */
const stripCodeAndMath = (text: string) =>
  text.replace(/```[\s\S]*?```/g, "").replace(/`[^`]*`|\$[^$\n]*\$/g, "");

export function lintReviewCards(args: {
  at: string;
  kind: LessonKind;
  cards: readonly ReviewCard[];
}): string[] {
  const { at, kind, cards } = args;
  const errors: string[] = [];

  if (kind === "checkpoint") {
    return [
      `${at}: checkpoint lessons take no review cards (they review their objectives)`,
    ];
  }
  if (cards.length < MIN_CARDS || cards.length > MAX_CARDS) {
    errors.push(
      `${at}: needs ${MIN_CARDS}-${MAX_CARDS} review cards, has ${cards.length}`,
    );
  }

  const ids = new Set<string>();
  for (const card of cards) {
    if (ids.has(card.id))
      errors.push(`${at}: duplicate review card id "${card.id}"`);
    ids.add(card.id);
    for (const loc of CORE_LOCALES) {
      for (const field of ["q", "a"] as const) {
        const text = card[field][loc];
        if (!text?.trim()) {
          errors.push(`${at}/${card.id}: empty ${loc} ${field}`);
        } else if (TAG.test(stripCodeAndMath(text))) {
          errors.push(
            `${at}/${card.id}: ${loc} ${field} contains a tag PromptBody cannot render`,
          );
        }
      }
    }
  }
  return errors;
}
