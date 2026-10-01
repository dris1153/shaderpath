"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GROUP_OF, type QueueGroup, type QueueKind } from "@/lib/dashboard-queue";
import { cn } from "@/lib/utils";

export interface QueueItemVM {
  kind: QueueKind;
  slug: string;
  title: string;
  daysLate?: number;
  reviewCount?: number;
  easeFactor?: number;
  confidence?: number;
  hintedExercises?: number;
  solutionsRevealed?: number;
  scrollPercent?: number;
}

const PILL_TONE: Record<QueueKind, string> = {
  overdue: "text-destructive border-destructive/50",
  due: "text-destructive border-destructive/50",
  leech: "text-foreground border-sun-edge",
  shaky: "text-link border-primary/50",
  hinted: "text-link border-primary/50",
  continue: "text-muted-foreground border-border",
};

type Filter = "all" | QueueGroup;

export function ActionQueue({
  items,
  unlocksLesson,
}: {
  items: QueueItemVM[];
  unlocksLesson?: string;
}) {
  const t = useTranslations("dashboard");
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const acc: Record<Filter, number> = { all: items.length, review: 0, weak: 0, next: 0 };
    for (const item of items) acc[GROUP_OF[item.kind]] += 1;
    return acc;
  }, [items]);

  const shown = items.filter((i) => filter === "all" || GROUP_OF[i.kind] === filter);

  const reasonOf = (i: QueueItemVM) => {
    switch (i.kind) {
      case "overdue":
        return t("reasonOverdue", { days: i.daysLate ?? 1 });
      case "due":
        return t("reasonDue");
      case "leech":
        return t("reasonLeech", { count: i.reviewCount ?? 0 });
      case "shaky":
        return t("reasonShaky", { confidence: i.confidence ?? 0 });
      case "hinted":
        return t("reasonHinted");
      case "continue":
        return t("reasonContinue");
    }
  };

  const metaOf = (i: QueueItemVM) => {
    switch (i.kind) {
      case "overdue":
      case "due":
        return t("metaReview", { count: (i.reviewCount ?? 0) + 1 });
      case "leech":
        return t("metaLeech", { ease: (i.easeFactor ?? 0).toFixed(1) });
      case "shaky":
        return t("metaShaky");
      case "hinted":
        return t("metaHinted", {
          solutions: i.solutionsRevealed ?? 0,
          hints: i.hintedExercises ?? 0,
        });
      case "continue":
        return i.scrollPercent
          ? t("metaContinue", { percent: Math.round(i.scrollPercent) })
          : "";
    }
  };

  const actionLabelOf = (kind: QueueKind) =>
    kind === "leech"
      ? t("actionRead")
      : kind === "shaky"
        ? t("actionRevisit")
        : kind === "hinted"
          ? t("actionRedo")
          : t("continue");

  if (items.length === 0) {
    return (
      <Card className="mt-4 px-5 py-6" data-testid="action-queue">
        <p className="text-muted-foreground text-sm">{t("queueEmpty")}</p>
      </Card>
    );
  }

  const CHIPS: { key: Filter; label: string; dot?: string }[] = [
    { key: "all", label: t("queueAll") },
    { key: "review", label: t("queueReview"), dot: "bg-coral" },
    { key: "weak", label: t("queueWeak"), dot: "bg-sun" },
    { key: "next", label: t("queueNext"), dot: "bg-muted-foreground" },
  ];

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={t("queueTitle")}>
        {CHIPS.map((chip) => (
          <Button
            key={chip.key}
            size="sm"
            variant={filter === chip.key ? "default" : "outline"}
            aria-pressed={filter === chip.key}
            className="rounded-full"
            onClick={() => setFilter(chip.key)}
          >
            {chip.dot && (
              <span aria-hidden className={cn("size-1.5 rounded-full", chip.dot)} />
            )}
            <span className="font-semibold">{counts[chip.key]}</span>
            {chip.label}
          </Button>
        ))}
      </div>

      <Card className="mt-3 gap-0 py-0" data-testid="action-queue">
        <ul>
          {shown.map((item) => (
            <li
              key={item.slug}
              data-kind={item.kind}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-5 py-3.5 last:border-b-0"
            >
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold",
                  PILL_TONE[item.kind],
                )}
              >
                {reasonOf(item)}
              </span>
              <span className="min-w-0 flex-1">
                <Link
                  href={`/lesson/${item.slug}`}
                  className="block truncate font-medium hover:underline"
                >
                  {item.title}
                </Link>
                <span className="text-muted-foreground block text-sm">
                  {metaOf(item)}
                </span>
              </span>
              {/* Grading lives on /review, after the question: grading a bare
                  title here was recognition, not recall. */}
              {GROUP_OF[item.kind] === "review" ? (
                <Button
                  size="sm"
                  variant="outline"
                  nativeButton={false}
                  className="shrink-0"
                  render={<Link href="/review" />}
                >
                  {t("actionReview")}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant={item.kind === "continue" ? "default" : "outline"}
                  nativeButton={false}
                  className="shrink-0"
                  render={<Link href={`/lesson/${item.slug}`} />}
                >
                  {actionLabelOf(item.kind)}
                </Button>
              )}
            </li>
          ))}
        </ul>
        {unlocksLesson && (
          <p className="text-muted-foreground border-t px-5 py-3 text-sm">
            {unlocksLesson}
          </p>
        )}
      </Card>
    </>
  );
}
