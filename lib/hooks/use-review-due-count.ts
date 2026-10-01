"use client";

import { REVIEW_KINDS } from "@/lib/dashboard-queue";
import { useAuth } from "./use-auth";
import { useDashboard } from "./use-dashboard";

/** Reviews due now for the nav badge; 0 for guests, who are never fetched for. */
export function useReviewDueCount() {
  const { data: auth } = useAuth();
  const { data } = useDashboard(Boolean(auth?.user));
  // ponytail: counts rows whose lesson was since renamed; the review page drops
  // those (getLesson), but the curriculum is too heavy for the shell bundle.
  return data?.queue.filter((item) => REVIEW_KINDS.has(item.kind)).length ?? 0;
}
