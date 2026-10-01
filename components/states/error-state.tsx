"use client";

import { useTranslations } from "next-intl";
import { IconAlertTriangle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

/** A load failure that says what failed and offers one retry. */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const t = useTranslations("errors");

  return (
    <div role="alert" className="border-border bg-card mt-8 flex flex-col items-start gap-3 rounded-xl border-2 p-5">
      <div className="flex items-start gap-3">
        <IconAlertTriangle className="text-destructive mt-0.5 size-5 shrink-0" aria-hidden />
        <p>{message}</p>
      </div>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {t("retry")}
        </Button>
      ) : null}
    </div>
  );
}
