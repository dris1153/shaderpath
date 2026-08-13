import { getTranslations } from "next-intl/server";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/content/types";
import type { LessonSlug } from "@/content/slugs";
import { getNeighbors } from "@/lib/curriculum";
import { Card, CardContent } from "@/components/ui/card";

export async function LessonFooterNav({
  slug,
  locale,
}: {
  slug: LessonSlug;
  locale: Locale;
}) {
  const t = await getTranslations("lesson");
  const { prev, next } = getNeighbors(slug);

  return (
    <nav className="mt-10 grid gap-4 sm:grid-cols-2">
      {prev ? (
        <Link href={`/lesson/${prev.slug}`} className="group">
          <Card className="h-full transition-colors group-hover:border-foreground/30">
            <CardContent className="flex items-center gap-3 py-4">
              <IconArrowLeft className="text-muted-foreground size-4 shrink-0" />
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs">{t("prev")}</p>
                <p className="truncate text-sm font-medium">
                  {prev.title[locale]}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link href={`/lesson/${next.slug}`} className="group sm:text-right">
          <Card className="h-full transition-colors group-hover:border-foreground/30">
            <CardContent className="flex items-center justify-end gap-3 py-4">
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs">{t("next")}</p>
                <p className="truncate text-sm font-medium">
                  {next.title[locale]}
                </p>
              </div>
              <IconArrowRight className="text-muted-foreground size-4 shrink-0" />
            </CardContent>
          </Card>
        </Link>
      )}
    </nav>
  );
}
