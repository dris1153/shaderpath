"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { LESSONS, TRACKS } from "@/content/curriculum";
import { pick, type Locale } from "@/content/types";
import { Link } from "@/i18n/navigation";
import { SHOTS } from "./demo-shots";

/** The mini-build thumbnails; callers own the section heading. */
export function DemoStrip() {
  const locale = useLocale() as Locale;
  const t = useTranslations("home");

  return (
    <ul className="mt-5 grid gap-5 sm:grid-cols-3">
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
                className="edge-card bg-muted aspect-[16/10] w-full rounded-xl object-cover transition-transform group-hover:-translate-y-0.5"
              />
              <span className="mt-3 block font-extrabold group-hover:underline">
                {pick(lesson.title, locale)}
              </span>
              <span className="text-muted-foreground block text-sm">
                {t("thumbMeta", { track: (track?.order ?? 0) + 1, count })}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
