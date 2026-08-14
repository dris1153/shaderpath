import { getTranslations } from "next-intl/server";
import { IconSettings } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "./locale-switcher";
import { ThemeToggle } from "./theme-toggle";

export async function AppHeader() {
  const t = await getTranslations("app");
  const tNav = await getTranslations("nav");

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold tracking-tight">
            {t("name")}
          </Link>
          <nav className="text-muted-foreground flex items-center gap-4 text-sm">
            <Link href="/roadmap" className="hover:text-foreground transition-colors">
              {tNav("roadmap")}
            </Link>
            <Link
              href="/playground"
              className="hover:text-foreground transition-colors"
            >
              {tNav("playground")}
            </Link>
            <Link
              href="/notes"
              className="hover:text-foreground hidden transition-colors sm:inline"
            >
              {tNav("notes")}
            </Link>
            <Link
              href="/stats"
              className="hover:text-foreground hidden transition-colors sm:inline"
            >
              {tNav("stats")}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <LocaleSwitcher />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label={tNav("settings")}
            nativeButton={false}
            render={<Link href="/settings" />}
          >
            <IconSettings />
          </Button>
        </div>
      </div>
    </header>
  );
}
