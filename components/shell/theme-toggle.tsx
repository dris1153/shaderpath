"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
  IconSun,
  IconMoon,
  IconDeviceDesktop,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPTIONS = [
  { value: "light", Icon: IconSun },
  { value: "dark", Icon: IconMoon },
  { value: "system", Icon: IconDeviceDesktop },
] as const;

export function ThemeToggle() {
  const t = useTranslations("themeToggle");
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={t("label")}>
            <IconSun className="dark:hidden" />
            <IconMoon className="hidden dark:block" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {OPTIONS.map(({ value, Icon }) => (
          <DropdownMenuItem
            key={value}
            data-active={theme === value}
            className="data-[active=true]:bg-muted"
            onClick={() => setTheme(value)}
          >
            <Icon />
            {t(value)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
