"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";
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

const OPTIONS = [
  { value: "light", Icon: IconSun },
  { value: "dark", Icon: IconMoon },
  { value: "system", Icon: IconDeviceDesktop },
] as const;

/** Standalone theme button (settings page). */
export function ThemeToggle() {
  const t = useTranslations("themeToggle");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="icon" aria-label={t("label")}>
            <IconSun className="dark:hidden" />
            <IconMoon className="hidden dark:block" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-44">
        <ThemeMenuGroup />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Theme section for the account and preferences menus. */
export function ThemeMenuGroup() {
  const t = useTranslations("themeToggle");
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel>{t("label")}</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as string)}>
        {OPTIONS.map(({ value, Icon }) => (
          <DropdownMenuRadioItem key={value} value={value}>
            <Icon />
            {t(value)}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuGroup>
  );
}
