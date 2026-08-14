"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
  IconBook,
  IconChartBar,
  IconFlask,
  IconLanguage,
  IconMap,
  IconMoon,
  IconNote,
  IconSun,
} from "@tabler/icons-react";
import { useRouter } from "@/i18n/navigation";
import searchIndex from "@/content/search-index.generated.json";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { rankLessons, type SearchEntry } from "./search-match";

const INDEX = searchIndex as SearchEntry[];

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("palette");
  const locale = useLocale();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [query, setQuery] = useState("");

  const localeEntries = useMemo(
    () => INDEX.filter((e) => e.locale === locale),
    [locale],
  );
  const lessons = useMemo(
    () => rankLessons(localeEntries, query),
    [localeEntries, query],
  );

  const go = (fn: () => void) => {
    onOpenChange(false);
    setQuery("");
    fn();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command shouldFilter={false}>
        <CommandInput
          placeholder={t("placeholder")}
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>{t("empty")}</CommandEmpty>

          {lessons.length > 0 && (
            <CommandGroup heading={t("lessons")}>
              {lessons.map((e) => (
                <CommandItem
                  key={e.slug}
                  value={e.slug}
                  onSelect={() => go(() => router.push(`/lesson/${e.slug}`))}
                >
                  <IconBook />
                  <span className="truncate">{e.title}</span>
                  <span className="text-muted-foreground ml-auto truncate text-xs">
                    {e.trackTitle}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandGroup heading={t("actions")}>
            <CommandItem value="action-roadmap" onSelect={() => go(() => router.push("/roadmap"))}>
              <IconMap /> {t("goRoadmap")}
            </CommandItem>
            <CommandItem value="action-playground" onSelect={() => go(() => router.push("/playground"))}>
              <IconFlask /> {t("goPlayground")}
            </CommandItem>
            <CommandItem value="action-notes" onSelect={() => go(() => router.push("/notes"))}>
              <IconNote /> {t("goNotes")}
            </CommandItem>
            <CommandItem value="action-stats" onSelect={() => go(() => router.push("/stats"))}>
              <IconChartBar /> {t("goStats")}
            </CommandItem>
            <CommandItem
              value="action-theme"
              onSelect={() =>
                go(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))
              }
            >
              {resolvedTheme === "dark" ? <IconSun /> : <IconMoon />}
              {t("toggleTheme")}
            </CommandItem>
            <CommandItem
              value="action-locale"
              onSelect={() => {
                const next = locale === "vi" ? "en" : "vi";
                onOpenChange(false);
                router.replace("/", { locale: next });
              }}
            >
              <IconLanguage /> {t("switchLocale")}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
