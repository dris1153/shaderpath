"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useReviewDueCount } from "@/lib/hooks/use-review-due-count";
import { cn } from "@/lib/utils";
import { DueBadge } from "./main-nav";
import { activeNavKey, NAV_ITEMS } from "./nav-items";

// Below md the four destinations live in a fixed bottom bar. Lesson pages get
// their own dock instead, so the bar (and its spacer) is absent there.
export function BottomTabs({ label }: { label: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const due = useReviewDueCount();
  if (pathname.startsWith("/lesson/")) return null;
  const active = activeNavKey(pathname);

  return (
    <>
      <div aria-hidden className="h-[calc(4.5rem+env(safe-area-inset-bottom))] shrink-0 md:hidden" />
      <nav
        aria-label={label}
        className="bg-card fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t-2 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {NAV_ITEMS.map(({ key, href, Icon, prefetch }) => (
          <Link
            key={key}
            href={href}
            prefetch={prefetch}
            aria-current={active === key ? "page" : undefined}
            className={cn(
              "chunky-label text-muted-foreground flex min-h-14 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px]",
              active === key && "text-link",
            )}
          >
            <span
              className={cn(
                "relative grid h-8 w-12 place-items-center rounded-xl",
                active === key && "bg-secondary ring-primary/30 ring-2 ring-inset",
              )}
            >
              <Icon className="size-5" aria-hidden />
              {key === "review" && <DueBadge count={due} className="absolute -top-1 -right-2" />}
            </span>
            {t(key)}
          </Link>
        ))}
      </nav>
    </>
  );
}
