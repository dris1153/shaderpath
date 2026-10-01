"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { IconInfoCircle, IconX } from "@tabler/icons-react";
import type { LessonSlug } from "@/content/slugs";
import { isUnlocked } from "@/lib/curriculum";
import { useLessonState } from "@/lib/hooks/use-lesson-state";

const storageKey = (slug: string) => `learn-anyway-dismissed:${slug}`;

function readDismissed(slug: string): boolean {
  try {
    return localStorage.getItem(storageKey(slug)) === "1";
  } catch {
    return false; // storage unavailable (private mode etc.)
  }
}

// A notice, not a gate: the lesson body renders either way. That is exactly
// why it can move to the client — nothing is being withheld, so nothing is
// exposed by deciding it after hydration. Dismissal is remembered per lesson.
export function LearnAnywayNotice({ slug }: { slug: LessonSlug }) {
  const t = useTranslations("lesson");
  const { data } = useLessonState(slug);
  // Read lazily: on the server and at hydration `data` is still undefined, so
  // this value cannot reach markup before the client owns it.
  const [dismissed, setDismissed] = useState(() => typeof window !== "undefined" && readDismissed(slug));
  if (!data || dismissed || isUnlocked(slug, data.progress)) return null;

  return (
    <p className="text-muted-foreground mt-3 flex items-start gap-2 text-sm">
      <IconInfoCircle className="text-link mt-0.5 size-4 shrink-0" aria-hidden />
      <span className="flex-1">{t("learnAnyway")}</span>
      <button
        type="button"
        aria-label={t("dismissNotice")}
        className="hover:text-foreground -m-1 grid size-7 shrink-0 place-items-center rounded-md"
        onClick={() => {
          setDismissed(true);
          try {
            localStorage.setItem(storageKey(slug), "1");
          } catch {
            // nothing to remember it in; it is dismissed for this visit
          }
        }}
      >
        <IconX className="size-4" aria-hidden />
      </button>
    </p>
  );
}
