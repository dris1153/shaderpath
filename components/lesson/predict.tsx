"use client";

import { useId, useState } from "react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// One forced prediction, sitting directly above the demo that settles it. The
// point is the commitment, not the score: nothing is stored, nothing is sent,
// and a guest can answer it — so this is a client component with one useState
// and no effects.
//
// Native radios rather than a custom widget: sharing a `name` gives arrow-key
// navigation, roving focus and group semantics from the browser, and the design
// system has no radio primitive to borrow.
export function Predict({
  question,
  options,
  answer,
  reveal,
}: {
  question: string;
  options: string[];
  answer: number;
  reveal: string;
}) {
  const id = useId();
  const [picked, setPicked] = useState<number | null>(null);
  const t = useTranslations("predict");
  const answered = picked !== null;
  const correct = picked === answer;

  return (
    <section
      className="bg-muted/40 mt-6 rounded-lg border p-4"
      aria-labelledby={`${id}-q`}
    >
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {t("label")}
      </p>
      <p id={`${id}-q`} className="mt-1 font-medium">
        {question}
      </p>

      <div
        role="radiogroup"
        aria-labelledby={`${id}-q`}
        className="mt-3 space-y-1.5"
      >
        {options.map((option, i) => (
          <label
            key={option}
            className={cn(
              "flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2 text-sm transition-colors",
              "has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-offset-1",
              !answered && "hover:bg-background",
              // After answering, the right option is marked whatever was picked:
              // being told only "wrong" leaves the learner with no model.
              answered && i === answer && "border-primary bg-primary/10",
              answered && i === picked && !correct && "border-destructive",
              answered && i !== answer && i !== picked && "opacity-60",
            )}
          >
            <input
              type="radio"
              name={id}
              checked={picked === i}
              onChange={() => setPicked(i)}
              className="accent-primary mt-0.5 size-4 shrink-0"
            />
            <span>{option}</span>
            {answered && i === answer ? (
              <IconCheck className="text-link ml-auto size-4 shrink-0" />
            ) : null}
            {answered && i === picked && !correct ? (
              <IconX className="text-destructive ml-auto size-4 shrink-0" />
            ) : null}
          </label>
        ))}
      </div>

      {/* Both paragraphs share one grid cell, so the block is always as tall as
          the reveal and nothing below it moves when the answer lands. */}
      <div className="text-muted-foreground mt-3 grid text-sm leading-6">
        <p
          aria-hidden
          className={cn("col-start-1 row-start-1", answered && "invisible")}
        >
          {t("placeholder")}
        </p>
        {/* role=status so the verdict is announced when it appears, not silently
            swapped in under a reader that has already moved on. */}
        <p
          role="status"
          className={cn("col-start-1 row-start-1", !answered && "invisible")}
        >
          <strong className={correct ? "text-link" : "text-destructive"}>
            {correct ? t("right") : t("wrong")}
          </strong>{" "}
          {reveal}
        </p>
      </div>
    </section>
  );
}
