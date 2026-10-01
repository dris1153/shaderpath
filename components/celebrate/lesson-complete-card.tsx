"use client";

import { useTranslations } from "next-intl";
import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import { Inko } from "@/components/mascot/inko";
import { buttonVariants } from "@/components/ui/button";
import { XP_PER_LESSON } from "@/lib/xp";
import { Confetti } from "./confetti";
import { CountUp } from "./count-up";

type Props = {
  /** "Completed · confidence 4/5", the same line the plain completed state shows. */
  status: string;
  next?: { slug: string; title: string };
  /** This completion finished the lesson's module. */
  moduleDone: boolean;
};

/** Replaces the Mark-complete card right after a completion in this session. */
export function LessonCompleteCard({ status, next, moduleDone }: Props) {
  const t = useTranslations("xp");

  return (
    <section
      aria-live="polite"
      className="edge-card bg-card relative mt-10 flex flex-wrap items-center gap-5 rounded-xl p-5"
    >
      {moduleDone ? <Confetti /> : null}
      <Inko pose="cheer" size={96} />
      <div className="flex min-w-48 flex-1 flex-col gap-1">
        <p className="font-heading text-3xl leading-none font-extrabold">
          {moduleDone ? t("moduleDone") : t("lessonDone")}
        </p>
        <p className="text-lg font-extrabold">
          +<CountUp to={XP_PER_LESSON} /> XP
        </p>
        <p className="text-muted-foreground">{status}</p>
      </div>
      {next ? (
        <Link href={`/lesson/${next.slug}`} className={buttonVariants({ size: "lg" })}>
          <span className="max-w-56 truncate">{t("nextLesson", { title: next.title })}</span>
          <IconArrowRight data-icon="inline-end" />
        </Link>
      ) : null}
    </section>
  );
}
