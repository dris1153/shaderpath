import { describe, expect, it } from "vitest";
import type { Exercise, ReviewCard } from "@/content/types";
import { pickReviewPrompt } from "@/lib/review-prompt";

const card = (id: string): ReviewCard => ({
  id,
  q: { vi: `hỏi ${id}`, en: `ask ${id}` },
  a: { vi: `đáp ${id}`, en: `answer ${id}` },
});

const exercise = (
  id: string,
  kind: Exercise["kind"],
  note = true,
): Exercise => ({
  id,
  kind,
  prompt: { vi: `đề ${id}`, en: `prompt ${id}` },
  solutionNote: note
    ? { vi: `lời giải ${id}`, en: `solution ${id}` }
    : undefined,
  hints: [],
  checklist: [
    { vi: "mục 1", en: "item 1" },
    { vi: "mục 2", en: "item 2" },
  ],
});

const objectives = { vi: ["mục tiêu"], en: ["objective"] };
const base = {
  cards: undefined,
  exercises: undefined,
  objectives,
  reviewCount: 0,
  locale: "vi" as const,
};

describe("pickReviewPrompt", () => {
  it("rotates through the cards on reviewCount and wraps", () => {
    const cards = [card("a"), card("b"), card("c")];
    const ids = [0, 1, 2, 3, 4].map((n) => {
      const p = pickReviewPrompt({ ...base, cards, reviewCount: n });
      return p.source === "card" ? p.cardId : null;
    });
    expect(ids).toEqual(["a", "b", "c", "a", "b"]);
  });

  it("prefers cards over exercises", () => {
    const p = pickReviewPrompt({
      ...base,
      cards: [card("a")],
      exercises: [exercise("e", "concept")],
    });
    expect(p.source).toBe("card");
  });

  it("falls back to the first concept exercise, skipping other kinds", () => {
    const p = pickReviewPrompt({
      ...base,
      cards: [],
      exercises: [
        exercise("code-1", "code"),
        exercise("c-1", "concept"),
        exercise("c-2", "concept"),
      ],
    });
    expect(p).toEqual({
      source: "exercise",
      exerciseId: "c-1",
      question: "đề c-1",
      answer: "lời giải c-1",
    });
  });

  it("answers with the checklist when an exercise has no solution note", () => {
    const p = pickReviewPrompt({
      ...base,
      exercises: [exercise("c", "concept", false)],
    });
    expect(p.source === "exercise" && p.answer).toBe("mục 1\n\nmục 2");
  });

  it("falls back to objectives when nothing can be asked", () => {
    const p = pickReviewPrompt({
      ...base,
      exercises: [exercise("b", "build")],
    });
    expect(p).toEqual({ source: "objectives", objectives: ["mục tiêu"] });
  });

  it("reads the requested locale", () => {
    const p = pickReviewPrompt({ ...base, locale: "en", cards: [card("a")] });
    expect(p.source === "card" && [p.question, p.answer]).toEqual([
      "ask a",
      "answer a",
    ]);
  });
});
