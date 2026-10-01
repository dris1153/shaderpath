"use client";

import { useTranslations } from "next-intl";
import { IconSearch } from "@tabler/icons-react";
import { useCommandPalette } from "@/components/command/command-provider";
import { Button } from "@/components/ui/button";

/** Full pill on wide screens, an icon button below lg; both open the palette. */
export function SearchPill() {
  const t = useTranslations("nav");
  const { open } = useCommandPalette();

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="border-border bg-card text-muted-foreground hover:border-primary/40 focus-visible:border-ring focus-visible:ring-ring/50 hidden h-10 w-60 items-center gap-2 rounded-lg border-2 px-3 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 lg:flex"
      >
        <IconSearch className="size-4" />
        {t("search")}
        <kbd className="ml-auto font-mono text-xs">Ctrl K</kbd>
      </button>
      <Button variant="ghost" size="icon" aria-label={t("search")} onClick={open} className="lg:hidden">
        <IconSearch />
      </Button>
    </>
  );
}
