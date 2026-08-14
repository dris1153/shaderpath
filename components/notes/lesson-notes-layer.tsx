"use client";

import { useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { IconBookmark, IconNote } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { createNote, toggleBookmark } from "@/lib/notes";
import { useTextSelection } from "@/lib/hooks/use-text-selection";

// Wraps the RSC-rendered theory body; owns text selection → note/bookmark UI.
export function LessonNotesLayer({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const t = useTranslations("notes");
  const containerRef = useRef<HTMLDivElement>(null);
  const [selection, clearSelection] = useTextSelection(containerRef);
  const [draft, setDraft] = useState<string>("");
  const [writing, setWriting] = useState(false);

  const close = () => {
    setWriting(false);
    setDraft("");
    clearSelection();
  };

  return (
    <>
      <div ref={containerRef} id="lesson-body">
        {children}
      </div>

      {selection && (
        <div
          className="fixed z-50"
          style={{
            top: Math.min(selection.rect.bottom + 8, window.innerHeight - 220),
            left: Math.min(selection.rect.left, window.innerWidth - 340),
          }}
        >
          <Card className="w-80 shadow-lg">
            <CardContent className="p-3">
              {writing ? (
                <div className="space-y-2">
                  <p className="text-muted-foreground line-clamp-2 border-l-2 pl-2 text-xs italic">
                    {selection.text}
                  </p>
                  <Textarea
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={t("notePlaceholder")}
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={close}>
                      {t("cancel")}
                    </Button>
                    <Button
                      size="sm"
                      disabled={draft.trim().length === 0}
                      onClick={() => {
                        createNote({
                          lessonSlug: slug,
                          anchorId: selection.anchorId,
                          selectedText: selection.text,
                          body: draft,
                        })
                          .then(() => toast.success(t("noteSaved")))
                          .catch(() => toast.error(t("saveError")));
                        close();
                      }}
                    >
                      {t("saveNote")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setWriting(true)}>
                    <IconNote /> {t("addNote")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!selection.anchorId}
                    onClick={() => {
                      toggleBookmark({
                        lessonSlug: slug,
                        anchorId: selection.anchorId,
                        label: selection.text.slice(0, 80),
                      })
                        .then((on) =>
                          toast.success(
                            on ? t("sectionBookmarked") : t("bookmarkRemoved"),
                          ),
                        )
                        .catch(() => toast.error(t("saveError")));
                      close();
                    }}
                  >
                    <IconBookmark /> {t("bookmarkSection")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
