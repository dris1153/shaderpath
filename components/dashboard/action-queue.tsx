"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { gradeReview } from "@/lib/review";
import type { ReviewQuality } from "@/lib/srs";
import { GROUP_OF, type QueueGroup, type QueueKind } from "@/lib/dashboard-queue";
import { cn } from "@/lib/utils";

const GRADES: ReviewQuality[] = ["again", "hard", "good", "easy"];

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
  leech: // amber-600 measures 3.19:1 on the light card — under AA at this size.
    "text-amber-800 border-amber-800/50 dark:text-amber-400 dark:border-amber-400/50",
  shaky: "text-primary border-primary/50",
  hinted: "text-primary border-primary/50",
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
  const tReview = useTranslations("review");
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [pending, startTransition] = useTransition();

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
    { key: "review", label: t("queueReview"), dot: "bg-destructive" },
    { key: "weak", label: t("queueWeak"), dot: "bg-amber-500" },
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
              {/* Reviews are graded here rather than linked away: grading is the
                  action a due card needs, and this is the only screen that offers it. */}
              {GROUP_OF[item.kind] === "review" ? (
                <span className="flex shrink-0 gap-1">
                  {GRADES.map((q) => (
                    <Button
                      key={q}
                      size="sm"
                      variant={q === "good" ? "default" : "outline"}
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          try {
                            await gradeReview(item.slug, q);
                            toast.success(tReview("graded"));
                            router.refresh();
                          } catch {
                            toast.error(tReview("gradeError"));
                          }
                        })
                      }
                    >
                      {tReview(`grade_${q}`)}
                    </Button>
                  ))}
                </span>
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
