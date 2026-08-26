"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { LESSONS, TRACKS } from "@/content/curriculum";
import { pick, type Locale } from "@/content/types";
import { Link } from "@/i18n/navigation";
import { SHOTS } from "./demo-shots";
export function DemoStrip() {
  const locale = useLocale() as Locale;
  const t = useTranslations("home");

  return (
    <>
      <h2 className="sr-only">{t("demosLabel")}</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-3">
        {SHOTS.map((shot) => {
          const lesson = LESSONS.find((l) => l.slug === shot.slug);
          if (!lesson) return null;
          const track = TRACKS.find((tr) => tr.id === lesson.trackId);
          const count = LESSONS.filter(
            (l) => l.trackId === lesson.trackId,
          ).length;

          return (
            <li key={shot.slug}>
              <Link href={`/lesson/${shot.slug}`} className="group block">
                <Image
                  src={shot.src}
                  alt=""
                  width={shot.width}
                  height={shot.height}
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="bg-muted aspect-[16/10] w-full rounded-lg border object-cover"
                />
                <span className="mt-2 block text-sm font-medium group-hover:underline">
                  {pick(lesson.title, locale)}
                </span>
                <span className="text-muted-foreground block text-xs">
                  {t("thumbMeta", { track: track?.order ?? 0, count })}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
