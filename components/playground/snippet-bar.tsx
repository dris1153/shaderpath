"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { IconDeviceFloppy, IconFilePlus, IconTrash } from "@tabler/icons-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteSnippet, saveSnippet, type Snippet } from "@/lib/playground";

export function SnippetBar({
  snippets,
  currentId,
  source,
  onSnippets,
  onLoad,
  onNew,
}: {
  snippets: Snippet[];
  currentId: number | null;
  source: string;
  onSnippets: (s: Snippet[]) => void;
  onLoad: (snippet: Snippet) => void;
  onNew: () => void;
}) {
  const t = useTranslations("playground");
  const [pending, startTransition] = useTransition();
  const [saveOpen, setSaveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [title, setTitle] = useState("");

  const current = snippets.find((s) => s.id === currentId);

  function submitSave() {
    const finalTitle = title.trim() || current?.title || t("defaultTitle");
    startTransition(async () => {
      try {
        const next = await saveSnippet({
          id: currentId ?? undefined,
          title: finalTitle,
          fragmentShader: source,
        });
        onSnippets(next);
        if (currentId === null) {
          const created = next.find((s) => s.title === finalTitle);
          if (created) onLoad({ ...created, fragmentShader: source });
        }
        setSaveOpen(false);
        toast.success(t("savedToast"));
      } catch {
        toast.error(t("saveFailedToast"));
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={currentId !== null ? String(currentId) : ""}
        onValueChange={(v) => {
          const snippet = snippets.find((s) => String(s.id) === v);
          if (snippet) onLoad(snippet);
        }}
      >
        <SelectTrigger size="sm" className="w-56" aria-label={t("snippets")}>
          <SelectValue placeholder={t("snippetPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          {snippets.map((s) => (
            <SelectItem key={s.id} value={String(s.id)}>
              {s.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm" onClick={onNew}>
        <IconFilePlus /> {t("new")}
      </Button>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogTrigger
          render={
            <Button size="sm" onClick={() => setTitle(current?.title ?? "")}>
              <IconDeviceFloppy /> {t("save")}
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("saveTitle")}</DialogTitle>
          </DialogHeader>
          <label className="text-sm" htmlFor="snippet-title">
            {t("titleLabel")}
          </label>
          <Input
            id="snippet-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder={t("defaultTitle")}
          />
          <DialogFooter>
            <Button disabled={pending} onClick={submitSave}>
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {current && (
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger
            render={
              <Button variant="ghost" size="sm" aria-label={t("delete")}>
                <IconTrash />
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("deleteConfirmTitle")}</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground text-sm">
              {t("deleteConfirmDescription", { title: current.title })}
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button
                variant="destructive"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const next = await deleteSnippet(current.id);
                    onSnippets(next);
                    onNew();
                    setDeleteOpen(false);
                    toast.success(t("deletedToast"));
                  })
                }
              >
                {t("delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
