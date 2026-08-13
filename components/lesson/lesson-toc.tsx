"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { TocItem } from "@/content/lesson-registry.generated";
import { cn } from "@/lib/utils";

export function LessonToc({ toc }: { toc: TocItem[] }) {
  const t = useTranslations("lesson");
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const headings = toc
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            return;
          }
        }
      },
      { rootMargin: "0px 0px -70% 0px" },
    );
    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [toc]);

  if (toc.length === 0) return null;

  return (
    <nav aria-label={t("onThisPage")} className="text-sm">
      <p className="text-foreground mb-3 font-medium">{t("onThisPage")}</p>
      <ul className="space-y-2">
        {toc.map((item) => (
          <li key={item.id} style={{ paddingLeft: (item.depth - 2) * 12 }}>
            <a
              href={`#${item.id}`}
              aria-current={activeId === item.id ? "location" : undefined}
              className={cn(
                "text-muted-foreground hover:text-foreground block transition-colors",
                activeId === item.id && "text-foreground font-medium",
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
