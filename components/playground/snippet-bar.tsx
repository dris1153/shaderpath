"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SnippetSummary } from "@/lib/api-payloads";
import { deleteSnippet, saveSnippet } from "@/lib/playground";
import {
  PRESET_GROUPS,
  findPreset,
  presetSource,
} from "@/content/playground-presets";
import type { Locale } from "@/content/types";

// Select values are namespaced because presets and snippets share one list:
// "u:<id>" is a saved snippet, "p:<slug>" is a built-in preset.
export function SnippetBar({
  snippets,
  selection,
  source,
  onSnippets,
  onSelect,
  onNew,
}: {
  snippets: SnippetSummary[];
  selection: string;
  source: string;
  onSnippets: (s: SnippetSummary[]) => void;
  onSelect: (value: string, loaded: { title: string; source: string }) => void;
  onNew: () => void;
}) {
  const t = useTranslations("playground");
  const locale = useLocale() as Locale;
  const currentId = selection.startsWith("u:")
    ? Number(selection.slice(2))
    : null;

  const selectItems: Record<string, string> = {};
  for (const group of PRESET_GROUPS) {
    for (const p of group.presets) {
      selectItems[`p:${p.slug}`] = p.title[locale] ?? p.title.vi;
    }
  }
  for (const s of snippets) selectItems[`u:${s.id}`] = s.title;
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
          // Saving while a preset (or a blank buffer) is open forks it into a
          // new snippet — select that new row so the next save updates it.
          const created = next.find((s) => s.title === finalTitle);
          if (created) {
            onSelect(`u:${created.id}`, { title: finalTitle, source });
          }
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
        value={selection}
        // Base UI resolves the trigger label from `items`; without it the
        // trigger renders the raw value ("p:shaping-functions").
        items={selectItems}
        onValueChange={(v) => {
          if (!v) return;
          if (v.startsWith("p:")) {
            const preset = findPreset(v.slice(2));
            if (preset) {
              onSelect(v, {
                title: preset.title[locale] ?? preset.title.vi,
                source: presetSource(preset, locale),
              });
            }
            return;
          }
          const snippet = snippets.find((s) => `u:${s.id}` === v);
          if (snippet) {
            onSelect(v, {
              title: snippet.title,
              source: snippet.fragmentShader,
            });
          }
        }}
      >
        <SelectTrigger size="sm" className="w-64" aria-label={t("snippets")}>
          <SelectValue placeholder={t("snippetPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          {PRESET_GROUPS.map((group) => (
            <SelectGroup key={group.id}>
              <SelectLabel>{group.label[locale] ?? group.label.vi}</SelectLabel>
              {group.presets.map((p) => (
                <SelectItem key={p.slug} value={`p:${p.slug}`}>
                  {p.title[locale] ?? p.title.vi}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
          {snippets.length > 0 && (
            <>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>{t("yourSnippets")}</SelectLabel>
                {snippets.map((s) => (
                  <SelectItem key={s.id} value={`u:${s.id}`}>
                    {s.title}
                  </SelectItem>
                ))}
              </SelectGroup>
            </>
          )}
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
