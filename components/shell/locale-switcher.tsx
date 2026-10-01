"use client";

import { useLocale, useTranslations } from "next-intl";
import { IconLanguage } from "@tabler/icons-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Standalone language button (settings page). */
export function LocaleSwitcher() {
  const t = useTranslations("localeSwitcher");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="icon" aria-label={t("label")}>
            <IconLanguage />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-44">
        <LocaleMenuGroup />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Language section for the account and preferences menus. */
export function LocaleMenuGroup() {
  const t = useTranslations("localeSwitcher");
  const locale = useLocale();
  // ponytail: pathname only; append useSearchParams once routes carry query params
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: AppLocale) {
    if (next === locale) return;
    // Same route, no scroll reset (spec §6.1.7)
    router.replace(pathname, { locale: next, scroll: false });
  }

  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel>{t("label")}</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={locale} onValueChange={(v) => switchTo(v as AppLocale)}>
        {routing.locales.map((l) => (
          <DropdownMenuRadioItem key={l} value={l}>
            {t(l)}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuGroup>
  );
}
