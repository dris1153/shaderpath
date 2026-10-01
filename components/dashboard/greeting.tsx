"use client";

import { useTranslations } from "next-intl";
import { Inko } from "@/components/mascot/inko";

type Props = {
  /** Undefined while the streak is still loading. */
  streak?: number;
  /** Title of the lesson to do next; undefined once every core lesson is done. */
  nextTitle?: string;
};

/** Page heading plus Inko with a speech bubble built from real progress. */
export function Greeting({ streak, nextTitle }: Props) {
  const t = useTranslations("dashboard");
  const line = !nextTitle
    ? t("greetDone")
    : streak
      ? t("greetStreak", { days: streak, title: nextTitle })
      : t("greetFresh", { title: nextTitle });

  return (
    <div className="flex items-center gap-4 sm:gap-6">
      <Inko pose="cheer" size={120} className="hidden sm:block" />
      <div className="flex min-w-0 flex-col gap-3">
        <h1 className="text-4xl leading-tight">{t("welcome")}</h1>
        <p className="edge-card bg-card relative w-fit max-w-xl rounded-xl px-4 py-2.5 font-bold">
          {line}
        </p>
      </div>
    </div>
  );
}
