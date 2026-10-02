"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useReviewDueCount } from "@/lib/hooks/use-review-due-count";
import { cn } from "@/lib/utils";
import { activeNavKey, NAV_ITEMS } from "./nav-items";

/** Count bubble on the Review item; the number is also spoken. */
export function DueBadge({ count, className }: { count: number; className?: string }) {
  const t = useTranslations("nav");
  if (count === 0) return null;
  return (
    <span className={cn("bg-coral text-ink rounded-full px-1.5 text-[11px] leading-[18px] font-extrabold tabular-nums", className)}>
      <span aria-hidden>{count > 99 ? "99+" : count}</span>
      <span className="sr-only">{t("dueCount", { count })}</span>
    </span>
  );
}

/** Desktop header links (md and up); the tab bar covers smaller screens. */
export function MainNav({ label }: { label: string }) {
  const t = useTranslations("nav");
  const active = activeNavKey(usePathname());
  const due = useReviewDueCount();

  return (
    <nav aria-label={label} className="hidden items-center gap-1 md:flex">
      {NAV_ITEMS.map(({ key, href, Icon, prefetch }) => (
        <Link
          key={key}
          href={href}
          prefetch={prefetch}
          aria-current={active === key ? "page" : undefined}
          className={cn(
            "chunky-label text-muted-foreground hover:text-foreground flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] transition-colors",
            active === key && "bg-secondary text-link ring-primary/30 hover:text-link ring-2 ring-inset",
          )}
        >
          <Icon className="hidden size-[18px] lg:block" aria-hidden />
          {t(key)}
          {key === "review" && <DueBadge count={due} />}
        </Link>
      ))}
    </nav>
  );
}
