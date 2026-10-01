"use client";

import { useTranslations } from "next-intl";
import { IconBolt, IconFlame } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import { useGamification } from "@/lib/hooks/use-gamification";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const CHIP =
  "text-foreground flex h-9 items-center gap-1 rounded-lg px-2.5 text-sm font-extrabold tabular-nums transition-colors";

/** Streak and XP for a signed-in reader; renders nothing for guests or before data. */
export function GamificationChips() {
  const t = useTranslations("xp");
  const { data } = useGamification();
  if (!data) return null;

  return (
    <div className="flex items-center gap-1.5">
      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href="/stats"
              aria-label={t("streakLabel", { count: data.streak.current })}
              className={cn(CHIP, "bg-[color-mix(in_oklch,var(--coral)_22%,var(--card))]")}
            />
          }
        >
          <IconFlame className="text-coral size-[18px]" aria-hidden />
          {data.streak.current}
        </TooltipTrigger>
        <TooltipContent>{t("streakTooltip")}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href="/stats"
              aria-label={t("xpLabel", { xp: data.xp, level: data.level })}
              className={cn(CHIP, "hidden bg-[color-mix(in_oklch,var(--sun)_30%,var(--card))] sm:flex")}
            />
          }
        >
          <IconBolt className="text-sun-edge size-[18px]" aria-hidden />
          {data.xp}
        </TooltipTrigger>
        <TooltipContent>
          {t("levelTooltip", {
            level: data.level,
            left: data.levelSize - data.intoLevel,
            next: data.level + 1,
          })}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
