"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import type { DashboardPayload } from "@/lib/api-payloads";
import { getLesson } from "@/lib/curriculum";
import { REVIEW_KINDS, type QueueItem } from "@/lib/dashboard-queue";
import { isAuthError } from "@/lib/hooks/fetch-json";
import { useDashboard } from "@/lib/hooks/use-dashboard";
import { ReviewCardView } from "./review-card";

export function ReviewSession() {
  const t = useTranslations("review");
  const tDash = useTranslations("dashboard");
  const { data, isError, error } = useDashboard();

  // Data first: a failed background refetch keeps `data` but sets `isError`,
  // and must not tear down a session in progress.
  if (!data) {
    if (isAuthError(error)) {
      return (
        <p className="text-muted-foreground mt-6">
          {t("signIn")}{" "}
          <Link
            href="/login"
            className="text-primary underline underline-offset-4"
          >
            {t("signInCta")}
          </Link>
        </p>
      );
    }
    if (isError) {
      return (
        <Alert className="mt-6">
          <AlertTitle>{tDash("offlineTitle")}</AlertTitle>
          <AlertDescription>{tDash("offlineBody")}</AlertDescription>
        </Alert>
      );
    }
    return <Skeleton className="mt-6 h-64 w-full rounded-xl" />;
  }

  // A row whose lesson was renamed or removed can never be graded (the server
  // rejects the slug), so it would sit at the top of the deck forever. The
  // dashboard drops such rows the same way.
  return (
    <ReviewDeck
      items={data.queue.filter(
        (i) => REVIEW_KINDS.has(i.kind) && getLesson(i.lessonSlug),
      )}
    />
  );
}

function ReviewDeck({ items }: { items: QueueItem[] }) {
  const tDash = useTranslations("dashboard");
  const queryClient = useQueryClient();
  // Snapshot: every grade moves that lesson's due date, and a background
  // refetch would reshuffle the deck under the learner mid-session.
  const [deck] = useState(items);
  const [index, setIndex] = useState(0);

  // Refresh the dashboard on the way out; the cache edit below covers the gap
  // until that refetch lands.
  useEffect(
    () => () => void queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    [queryClient],
  );

  if (deck.length === 0) {
    return <p className="text-muted-foreground mt-6">{tDash("queueEmpty")}</p>;
  }
  if (index >= deck.length) return <Summary count={deck.length} />;

  const item = deck[index]!;
  return (
    <ReviewCardView
      key={item.lessonSlug}
      item={item}
      position={index + 1}
      total={deck.length}
      onGraded={() => {
        // Drop the graded lesson from the cached queue now: coming back before
        // the refetch finishes would otherwise rebuild the deck from the old
        // queue and grade the same lesson twice.
        queryClient.setQueryData<DashboardPayload>(["dashboard"], (old) =>
          old
            ? {
                ...old,
                queue: old.queue.filter(
                  (q) => q.lessonSlug !== item.lessonSlug,
                ),
              }
            : old,
        );
        setIndex((i) => i + 1);
      }}
    />
  );
}

function Summary({ count }: { count: number }) {
  const t = useTranslations("review");
  const ref = useRef<HTMLParagraphElement>(null);
  // The last grade button just unmounted; move focus here so keyboard and
  // screen-reader users land on the result instead of the page body.
  useEffect(() => ref.current?.focus(), []);
  return (
    <div className="mt-6 space-y-4">
      <p ref={ref} tabIndex={-1} className="outline-none">
        {t("done", { count })}
      </p>
      <Button nativeButton={false} render={<Link href="/" />}>
        {t("backHome")}
      </Button>
    </div>
  );
}
