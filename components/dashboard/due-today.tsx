"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { gradeReview } from "@/lib/review";
import type { ReviewQuality } from "@/lib/srs";

const GRADES: ReviewQuality[] = ["again", "hard", "good", "easy"];

export function DueToday({
  due,
}: {
  due: { slug: string; title: string }[];
}) {
  const t = useTranslations("review");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (due.length === 0) return null;

  return (
    <Card className="mt-6" data-testid="due-today">
      <CardHeader>
        <CardTitle>{t("title", { count: due.length })}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {due.map((item) => (
          <div
            key={item.slug}
            className="flex flex-wrap items-center justify-between gap-2"
          >
            <Link
              href={`/lesson/${item.slug}`}
              className="min-w-0 truncate text-sm font-medium hover:underline"
            >
              {item.title}
            </Link>
            <span className="flex gap-1">
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
                        toast.success(t("graded"));
                        router.refresh();
                      } catch {
                        toast.error(t("gradeError"));
                      }
                    })
                  }
                >
                  {t(`grade_${q}`)}
                </Button>
              ))}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
