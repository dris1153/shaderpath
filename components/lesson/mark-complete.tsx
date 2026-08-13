"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { IconCircleCheck } from "@tabler/icons-react";
import { toast } from "sonner";
import { markComplete } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MarkComplete({
  slug,
  completed,
  confidence,
}: {
  slug: string;
  completed: boolean;
  confidence: number | null;
}) {
  const t = useTranslations("lesson");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<number | null>(confidence);

  if (completed) {
    return (
      <div className="mt-10 flex items-center gap-2 rounded-lg border p-4">
        <IconCircleCheck className="text-primary size-5" />
        <span className="font-medium">
          {confidence
            ? t("completedWithConfidence", { confidence })
            : t("completed")}
        </span>
      </div>
    );
  }

  return (
    <Card className="mt-10">
      <CardHeader>
        <CardTitle>{t("markCompleteTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-4">
        <div
          role="radiogroup"
          aria-label={t("confidenceLabel")}
          className="flex items-center gap-1"
        >
          <span className="text-muted-foreground mr-2 text-sm">
            {t("confidenceLabel")}
          </span>
          {[1, 2, 3, 4, 5].map((n) => (
            <Button
              key={n}
              variant="outline"
              size="icon-sm"
              role="radio"
              aria-checked={selected === n}
              className={cn(
                selected === n &&
                  "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
              onClick={() => setSelected(selected === n ? null : n)}
            >
              {n}
            </Button>
          ))}
        </div>
        <Button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await markComplete(slug, selected ?? undefined);
              toast.success(t("markedToast"));
              router.refresh();
            })
          }
        >
          {t("markComplete")}
        </Button>
      </CardContent>
    </Card>
  );
}
