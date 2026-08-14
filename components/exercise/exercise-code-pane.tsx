"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { IconRestore } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlaygroundEmbed } from "@/components/playground/playground-embed";
import { saveUserCode } from "@/lib/exercises";
import { CodeEditor } from "./code-editor";
import type { ExerciseVM } from "./types";

// userCode autosave: debounce 2s; reset cancels the in-flight debounce and
// writes synchronously before re-enabling (races noted in the phase plan).
export function ExerciseCodePane({
  lessonSlug,
  exercise,
  initialCode,
  onEngaged,
}: {
  lessonSlug: string;
  exercise: ExerciseVM;
  initialCode: string | null;
  onEngaged: () => void;
}) {
  const t = useTranslations("exercise");
  const starter = exercise.starterCode ?? "";
  const [code, setCode] = useState(initialCode ?? starter);
  const [resetOpen, setResetOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Remount key forces the editor to accept the reset value
  const [editorEpoch, setEditorEpoch] = useState(0);

  const persist = (value: string) => {
    saveUserCode(lessonSlug, exercise.id, value).catch(() =>
      toast.error(t("saveError")),
    );
  };

  const handleChange = (value: string) => {
    setCode(value);
    onEngaged();
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => persist(value), 2000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="mt-4">
      <div className="mb-2 flex justify-end">
        <Dialog open={resetOpen} onOpenChange={setResetOpen}>
          <DialogTrigger
            render={
              <Button variant="ghost" size="sm">
                <IconRestore /> {t("resetCode")}
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("resetConfirmTitle")}</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground text-sm">
              {t("resetConfirmDescription")}
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResetOpen(false)}>
                {t("cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (timerRef.current) clearTimeout(timerRef.current);
                  setCode(starter);
                  setEditorEpoch((n) => n + 1);
                  persist(starter);
                  setResetOpen(false);
                }}
              >
                {t("resetCode")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {exercise.kind === "shader" ? (
        <PlaygroundEmbed
          key={editorEpoch}
          compact
          initialSource={code}
          onSourceChange={handleChange}
        />
      ) : (
        <div className="h-64 overflow-hidden rounded-lg border">
          <CodeEditor key={editorEpoch} value={code} onChange={handleChange} />
        </div>
      )}
    </div>
  );
}
