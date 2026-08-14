"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuality } from "@/components/providers/quality-provider";
import type { QualityTier } from "@/lib/quality";

const TIERS: QualityTier[] = ["low", "medium", "high"];

export function QualitySelect() {
  const t = useTranslations("settings");
  const { tier, setTier } = useQuality();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{t("qualityLabel")}</p>
        <p className="text-muted-foreground text-sm">{t("qualityDescription")}</p>
      </div>
      <Select
        value={tier}
        // Base UI reads the trigger label from `items`; without it the trigger
        // renders the raw value ("low" instead of the translated tier name).
        items={Object.fromEntries(
          TIERS.map((tr) => [tr, t(`qualityTier_${tr}`)]),
        )}
        onValueChange={(next) => {
          if (next) setTier(next);
        }}
      >
        <SelectTrigger size="sm" className="w-40" aria-label={t("qualityLabel")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TIERS.map((tr) => (
            <SelectItem key={tr} value={tr}>
              {t(`qualityTier_${tr}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
