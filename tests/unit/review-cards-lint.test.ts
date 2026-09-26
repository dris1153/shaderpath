import { describe, expect, it } from "vitest";
import type { ReviewCard } from "@/content/types";
import { lintReviewCards } from "@/lib/review-cards-lint";

const card = (id: string, over: Partial<ReviewCard> = {}): ReviewCard => ({
  id,
  q: { vi: "Vì sao?", en: "Why?" },
  a: { vi: "Vì vậy.", en: "Because." },
  ...over,
});

const lint = (cards: ReviewCard[], kind: "lesson" | "checkpoint" = "lesson") =>
  lintReviewCards({ at: "00-math/x", kind, cards });

describe("lintReviewCards", () => {
  it("accepts two to five well-formed cards", () => {
    expect(lint([card("a"), card("b")])).toEqual([]);
    expect(lint(["a", "b", "c", "d", "e"].map((id) => card(id)))).toEqual([]);
  });

  it("rejects too few and too many", () => {
    expect(lint([card("a")])[0]).toContain("needs 2-5 review cards, has 1");
    expect(
      lint(["a", "b", "c", "d", "e", "f"].map((id) => card(id)))[0],
    ).toContain("has 6");
  });

  it("rejects duplicate ids", () => {
    expect(lint([card("a"), card("a")])).toEqual([
      '00-math/x: duplicate review card id "a"',
    ]);
  });

  it("rejects a side missing in either locale", () => {
    const errors = lint([
      card("a", { a: { vi: "Vì vậy.", en: " " } }),
      card("b"),
    ]);
    expect(errors).toEqual(["00-math/x/a: empty en a"]);
  });

  it("rejects tags PromptBody would print literally, but not code or math", () => {
    const tagged = card("a", { q: { vi: "Dùng <Callout> nhé", en: "Why?" } });
    expect(lint([tagged, card("b")])).toEqual([
      "00-math/x/a: vi q contains a tag PromptBody cannot render",
    ]);
    const fine = card("a", {
      q: { vi: "`vec<3>` và $a<b$?", en: "```\nfoo<T>()\n```" },
    });
    expect(lint([fine, card("b")])).toEqual([]);
  });

  it("rejects cards on a checkpoint", () => {
    expect(lint([card("a"), card("b")], "checkpoint")[0]).toContain(
      "checkpoint lessons take no review cards",
    );
  });
});
