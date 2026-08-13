import { getTranslations } from "next-intl/server";
import { IconExternalLink } from "@tabler/icons-react";
import type { Citation, Locale } from "@/content/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export async function References({
  references,
  locale,
}: {
  references: Citation[];
  locale: Locale;
}) {
  const t = await getTranslations("lesson");
  if (references.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold tracking-tight">
        {t("references")}
      </h2>
      <Separator className="mt-2" />
      <ul className="mt-4 space-y-4">
        {references.map((ref) => (
          <li key={ref.id} className="text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{ref.type}</Badge>
              {ref.url ? (
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium underline underline-offset-4"
                >
                  {ref.title}
                  <IconExternalLink className="size-3.5" />
                </a>
              ) : (
                <span className="font-medium">{ref.title}</span>
              )}
              {(ref.authors || ref.year) && (
                <span className="text-muted-foreground">
                  {[ref.authors?.join(", "), ref.year]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              )}
            </div>
            {ref.note && (
              <p className="text-muted-foreground mt-1">{ref.note[locale]}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
