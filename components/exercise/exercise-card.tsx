"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  IconBulb,
  IconChevronDown,
  IconCircleCheck,
  IconLock,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  revealHint,
  revealSolution,
  saveChecklist,
  setExerciseStatus,
} from "@/lib/exercises";
import { cn } from "@/lib/utils";
import { ExerciseCodePane } from "./exercise-code-pane";
import {
  EMPTY_ATTEMPT,
  type AttemptStatus,
  type AttemptVM,
  type ExerciseVM,
} from "./types";

export function ExerciseCard({
  lessonSlug,
  exercise,
  index,
  initial,
  prompt,
  solutionHtml,
  onStatusChange,
}: {
  lessonSlug: string;
  exercise: ExerciseVM;
  index: number;
  initial: AttemptVM | null;
  prompt: ReactNode;
  solutionHtml: string | null;
  onStatusChange: (id: string, status: AttemptStatus) => void;
}) {
  const t = useTranslations("exercise");
  const attempt = initial ?? EMPTY_ATTEMPT;

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [status, setStatusLocal] = useState<AttemptStatus>(attempt.status);
  const [hintsRevealed, setHintsRevealed] = useState(attempt.hintsRevealed);
  const [solutionShown, setSolutionShown] = useState(attempt.solutionRevealed);
  // Positional checklist: reset (with a toast) if content changed its length
  const [checklist, setChecklist] = useState<boolean[]>(() => {
    const stored = attempt.checklistState;
    if (stored && stored.length === exercise.checklist.length) return stored;
    return exercise.checklist.map(() => false);
  });
  const [driftWarned, setDriftWarned] = useState(false);

  const fail = () => toast.error(t("saveError"));

  function updateStatus(next: AttemptStatus) {
    setStatusLocal(next);
    onStatusChange(exercise.id, next);
    setExerciseStatus(lessonSlug, exercise.id, next).catch(fail);
  }

  function markEngaged() {
    if (status === "not_started") {
      setStatusLocal("attempted");
      onStatusChange(exercise.id, "attempted");
    }
  }

  function toggleChecklist(i: number, value: boolean) {
    if (
      !driftWarned &&
      attempt.checklistState &&
      attempt.checklistState.length !== exercise.checklist.length
    ) {
      toast.info(t("checklistReset"));
      setDriftWarned(true);
    }
    const next = checklist.map((v, idx) => (idx === i ? value : v));
    setChecklist(next);
    markEngaged();
    saveChecklist(lessonSlug, exercise.id, next).catch(fail);
  }

  const allTicked =
    exercise.checklist.length > 0 && checklist.every(Boolean);

  return (
    <Card id={`exercise-${exercise.id}`} className="overflow-hidden">
      <Collapsible
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (o) setMounted(true);
        }}
      >
        <CollapsibleTrigger className="hover:bg-muted/50 flex w-full items-center justify-between gap-3 px-6 py-4 text-left">
          <span className="flex min-w-0 items-center gap-2">
            <span className="text-muted-foreground font-mono text-sm">
              {index}.
            </span>
            <Badge variant="secondary">{t(`kind_${exercise.kind}`)}</Badge>
            <StatusBadge status={status} />
            {hintsRevealed > 0 && (
              <span className="text-muted-foreground text-xs">
                <IconBulb className="inline size-3.5" /> {hintsRevealed}/
                {exercise.hints.length}
              </span>
            )}
          </span>
          <IconChevronDown
            className={cn(
              "text-muted-foreground size-4 shrink-0 transition-transform",
              open && "rotate-180",
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          {mounted && (
            <CardContent className="border-t pt-4 pb-6">
              {prompt}

              {exercise.starterCode !== undefined &&
                (exercise.kind === "code" || exercise.kind === "shader") && (
                  <ExerciseCodePane
                    lessonSlug={lessonSlug}
                    exercise={exercise}
                    initialCode={attempt.userCode}
                    onEngaged={markEngaged}
                  />
                )}

              {exercise.hints.length > 0 && (
                <div className="mt-5 space-y-2">
                  {exercise.hints.slice(0, hintsRevealed).map((hint, i) => (
                    <Alert key={i}>
                      <IconBulb />
                      <AlertDescription>{hint}</AlertDescription>
                    </Alert>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={hintsRevealed >= exercise.hints.length}
                    onClick={() =>
                      revealHint(lessonSlug, exercise.id)
                        .then((n) => {
                          setHintsRevealed(n);
                          markEngaged();
                        })
                        .catch(fail)
                    }
                  >
                    <IconBulb />
                    {t("hintButton", {
                      revealed: hintsRevealed,
                      total: exercise.hints.length,
                    })}
                  </Button>
                </div>
              )}

              {exercise.checklist.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium">{t("checklistTitle")}</p>
                  <div className="mt-2 space-y-2">
                    {exercise.checklist.map((item, i) => (
                      <label
                        key={i}
                        className="flex cursor-pointer items-start gap-2 text-sm"
                      >
                        <Checkbox
                          checked={checklist[i] ?? false}
                          onCheckedChange={(v) => toggleChecklist(i, v === true)}
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                {solutionShown ? (
                  solutionHtml && (
                    <div>
                      <p className="text-sm font-medium">
                        {t("solutionTitle")}
                      </p>
                      <div
                        className="[&_pre]:mt-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:p-3 [&_pre]:text-xs [&_pre]:leading-5"
                        dangerouslySetInnerHTML={{ __html: solutionHtml }}
                      />
                      {exercise.referenceImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={exercise.referenceImage}
                          alt={t("referenceImage")}
                          className="mt-3 max-w-full rounded-lg border"
                        />
                      )}
                    </div>
                  )
                ) : solutionHtml ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={status === "not_started"}
                    onClick={() =>
                      revealSolution(lessonSlug, exercise.id)
                        .then(() => {
                          setSolutionShown(true);
                          markEngaged();
                        })
                        .catch(fail)
                    }
                  >
                    {status === "not_started" && <IconLock />}
                    {status === "not_started"
                      ? t("solutionLocked")
                      : t("showSolution")}
                  </Button>
                ) : null}
              </div>

              <div className="mt-6 flex flex-wrap gap-2 border-t pt-4">
                {status === "not_started" && (
                  <Button size="sm" onClick={() => updateStatus("attempted")}>
                    {t("markAttempted")}
                  </Button>
                )}
                {status !== "completed" && (
                  <Button
                    size="sm"
                    variant={allTicked ? "default" : "outline"}
                    onClick={() => updateStatus("completed")}
                  >
                    <IconCircleCheck /> {t("markCompleted")}
                  </Button>
                )}
                {status !== "completed" && status !== "skipped" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateStatus("skipped")}
                  >
                    {t("markSkipped")}
                  </Button>
                )}
              </div>
            </CardContent>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function StatusBadge({ status }: { status: AttemptStatus }) {
  const t = useTranslations("exercise");
  if (status === "completed") {
    return <Badge>{t("status_completed")}</Badge>;
  }
  if (status === "attempted") {
    return <Badge variant="outline">{t("status_attempted")}</Badge>;
  }
  if (status === "skipped") {
    return <Badge variant="outline">{t("status_skipped")}</Badge>;
  }
  return null;
}
