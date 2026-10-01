"use client";

import { useTranslations } from "next-intl";
import { IconBolt } from "@tabler/icons-react";

/** "+5 XP" chip that floats up once when it mounts. */
export function XpGain({ amount }: { amount: number }) {
  const t = useTranslations("xp");
  return (
    <span className="text-foreground motion-safe:animate-xp-float inline-flex items-center gap-1 rounded-lg bg-[color-mix(in_oklch,var(--sun)_30%,var(--card))] px-2 py-0.5 text-xs font-extrabold">
      <IconBolt className="text-sun-edge size-3.5" aria-hidden />
      {t("gain", { amount })}
    </span>
  );
}
