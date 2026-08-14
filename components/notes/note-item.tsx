"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { deleteBookmark, deleteNote, updateNote } from "@/lib/notes";

export function NoteItem({
  id,
  body,
  selectedText,
}: {
  id: number;
  body: string;
  selectedText: string | null;
}) {
  const t = useTranslations("notes");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(body);

  return (
    <div className="py-2">
      {selectedText && (
        <p className="text-muted-foreground line-clamp-2 border-l-2 pl-2 text-xs italic">
          {selectedText}
        </p>
      )}
      {editing ? (
        <div className="mt-1 space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={pending || draft.trim().length === 0}
              onClick={() =>
                startTransition(async () => {
                  await updateNote(id, draft);
                  setEditing(false);
                  router.refresh();
                })
              }
            >
              {t("save")}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              {t("cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-1 flex items-start justify-between gap-2">
          <p className="text-sm whitespace-pre-wrap">{body}</p>
          <span className="flex shrink-0">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("edit")}
              onClick={() => setEditing(true)}
            >
              <IconPencil />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("delete")}
              onClick={() =>
                startTransition(async () => {
                  await deleteNote(id);
                  toast.success(t("noteDeleted"));
                  router.refresh();
                })
              }
            >
              <IconTrash />
            </Button>
          </span>
        </div>
      )}
    </div>
  );
}

export function BookmarkItem({
  id,
  label,
  href,
}: {
  id: number;
  label: string;
  href: string;
}) {
  const t = useTranslations("notes");
  const router = useRouter();

  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <a href={href} className="truncate text-sm hover:underline">
        {label}
      </a>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t("delete")}
        onClick={() =>
          deleteBookmark(id)
            .then(() => {
              toast.success(t("bookmarkRemoved"));
              router.refresh();
            })
            .catch(() => toast.error(t("saveError")))
        }
      >
        <IconTrash />
      </Button>
    </div>
  );
}
