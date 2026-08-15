"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";

import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface TrackStepVM {
  slug: string;
  title: string;
  done: boolean;
  current: boolean;
  unlocked: boolean;
  confidence?: number;
  scrollPercent?: number;
}

// Collapsed this is a one-line "where am I"; open it becomes the track map. The
// queue below answers what to do now, so the syllabus stays out of the way until
// asked for.
export function TrackMap({
  heading,
  meta,
  overall,
  steps,
  unlocksNext,
}: {
  heading: string;
  meta: string;
  overall: { label: string; percent: number };
  steps: TrackStepVM[];
  unlocksNext?: string;
}) {
  const t = useTranslations("dashboard");
  const [open, setOpen] = useState(false);

  return (
    <Card className="mt-8 gap-0 py-0" data-testid="track-map">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger
          className="w-full px-5 py-4 text-left"
          aria-label={t("trackToggle")}
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{heading}</p>
              <p className="text-muted-foreground mt-0.5 text-sm">{meta}</p>
            </div>
            <span className="text-muted-foreground shrink-0 text-sm">
              {overall.label}
            </span>
            <IconChevronDown
              className={cn(
                "text-muted-foreground size-4 shrink-0 transition-transform",
                open && "rotate-180",
              )}
            />
          </div>
          <Progress
            value={overall.percent}
            aria-label={overall.label}
            className="mt-3"
          />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t px-5 py-4">
            <ol className="space-y-1">
              {steps.map((step, i) => (
                <li key={step.slug} className="flex items-center gap-3 py-1">
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-full border-2 text-[0.65rem]",
                      step.done && "bg-primary border-primary text-primary-foreground",
                      step.current && "border-primary text-primary",
                      !step.done && !step.current && "text-muted-foreground",
                    )}
                  >
                    {step.done ? <IconCheck className="size-3" /> : i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    {step.unlocked ? (
                      <Link
                        href={`/lesson/${step.slug}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {step.title}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground text-sm font-medium">
                        {step.title}
                      </span>
                    )}
                    {step.current && step.scrollPercent !== undefined && (
                      <span className="text-muted-foreground block text-xs">
                        {t("stepReading", {
                          percent: Math.round(step.scrollPercent),
                        })}
                      </span>
                    )}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {/* The lesson being read is never "locked", whatever the
                        prerequisite graph says about it. */}
                    {step.confidence !== undefined
                      ? t("stepConfidence", { n: step.confidence })
                      : !step.unlocked && !step.current
                        ? t("stepLocked")
                        : null}
                  </span>
                </li>
              ))}
            </ol>
            {unlocksNext && (
              <p className="text-muted-foreground mt-4 text-sm">{unlocksNext}</p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
