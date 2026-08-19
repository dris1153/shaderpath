"use client";

import { useTranslations } from "next-intl";
import type { LessonSlug } from "@/content/slugs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isUnlocked } from "@/lib/curriculum";
import { useLessonState } from "@/lib/hooks/use-lesson-state";

// A notice, not a gate: the lesson body renders either way. That is exactly
// why it can move to the client — nothing is being withheld, so nothing is
// exposed by deciding it after hydration.
export function LearnAnywayNotice({ slug }: { slug: LessonSlug }) {
  const t = useTranslations("lesson");
  const { data } = useLessonState(slug);
  if (!data || isUnlocked(slug, data.progress)) return null;

  return (
    <Alert className="mt-6">
      <AlertDescription>{t("learnAnyway")}</AlertDescription>
    </Alert>
  );
}
