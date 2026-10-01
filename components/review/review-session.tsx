"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Inko } from "@/components/mascot/inko";
import { EmptyState } from "@/components/states/empty-state";
import { IconCards } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import type { DashboardPayload } from "@/lib/api-payloads";
import { getLesson } from "@/lib/curriculum";
import { REVIEW_KINDS, type QueueItem } from "@/lib/dashboard-queue";
import { useAuth } from "@/lib/hooks/use-auth";
import { useDashboard } from "@/lib/hooks/use-dashboard";
import { SignedOutState } from "@/components/states/signed-out-state";
import { ReviewCardView } from "./review-card";

export function ReviewSession() {
  const t = useTranslations("review");
  const tDash = useTranslations("dashboard");
  const { data: auth, isPending: authPending } = useAuth();
  const user = auth?.user;
  const { data, isError } = useDashboard(Boolean(user));

  // Guests have no schedule, so nothing is fetched and nothing can be graded.
  if (!authPending && !user) {
    return (
      <SignedOutState
        title={t("signIn")}
        description={t("signedOutBody")}
        signInLabel={t("signInCta")}
      />
    );
  }

  // Data first: a failed background refetch keeps `data` but sets `isError`,
  // and must not tear down a session in progress.
  if (!data) {
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

// ponytail: a flat 2 min per card, same estimate as the dashboard card.
const MINUTES_PER_REVIEW = 2;

function ReviewDeck({ items }: { items: QueueItem[] }) {
  const t = useTranslations("review");
  const tDash = useTranslations("dashboard");
  const queryClient = useQueryClient();
  // Snapshot: every grade moves that lesson's due date, and a background
  // refetch would reshuffle the deck under the learner mid-session.
  const [deck] = useState(items);
  const [index, setIndex] = useState(0);
  // The soonest interval graded this session: when these lessons come back.
  const [soonest, setSoonest] = useState<number | null>(null);

  // Refresh the dashboard on the way out; the cache edit below covers the gap
  // until that refetch lands.
  useEffect(
    () => () => void queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    [queryClient],
  );

  if (deck.length === 0) {
    return (
      <EmptyState
        icon={IconCards}
        title={tDash("reviewNone")}
        cue={tDash("queueEmpty")}
        action={
          <Link href="/roadmap" className={buttonVariants({ variant: "secondary", size: "sm" })}>
            {tDash("openRoadmap")}
          </Link>
        }
      />
    );
  }
  if (index >= deck.length) return <Summary count={deck.length} nextDays={soonest} />;

  const item = deck[index]!;
  return (
    <>
    <div className="mt-6 flex flex-col gap-2">
      <p className="text-muted-foreground text-sm font-semibold">
        {t("overview", { count: deck.length, minutes: deck.length * MINUTES_PER_REVIEW })}
      </p>
      <Progress value={(index / deck.length) * 100} aria-label={t("counter", { current: index + 1, total: deck.length })} />
    </div>
    <ReviewCardView
      key={item.lessonSlug}
      item={item}
      position={index + 1}
      total={deck.length}
      onGraded={(nextDays) => {
        setSoonest((s) => (s === null ? nextDays : Math.min(s, nextDays)));
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
    </>
  );
}

function Summary({ count, nextDays }: { count: number; nextDays: number | null }) {
  const t = useTranslations("review");
  const tDash = useTranslations("dashboard");
  const ref = useRef<HTMLParagraphElement>(null);
  // The last grade button just unmounted; move focus here so keyboard and
  // screen-reader users land on the result instead of the page body.
  useEffect(() => ref.current?.focus(), []);
  return (
    <section className="edge-card bg-card mt-6 flex flex-col items-center gap-3 rounded-xl p-6 text-center">
      <Inko pose="cheer" size={140} />
      <p ref={ref} tabIndex={-1} className="font-heading text-3xl font-extrabold outline-none">
        {t("done", { count })}
      </p>
      {nextDays !== null ? (
        <p className="text-muted-foreground">{tDash("reviewNext", { days: nextDays })}</p>
      ) : null}
      <Link href="/" className={buttonVariants()}>
        {t("backHome")}
      </Link>
    </section>
  );
}
