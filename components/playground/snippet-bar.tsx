"use client";

import { useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  IconChevronDown,
  IconDeviceFloppy,
  IconFilePlus,
  IconTrash,
} from "@tabler/icons-react";
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
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { fold } from "@/components/command/search-match";
import type { SnippetSummary } from "@/lib/api-payloads";
import { deleteSnippet, saveSnippet } from "@/lib/playground";
import {
  PRESET_GROUPS,
  findPreset,
  presetSource,
} from "@/content/playground-presets";
import { pick, type Locale } from "@/content/types";

// Values stay namespaced because presets and snippets share one list: "u:<id>"
// is a saved snippet, "p:<slug>" is a built-in preset. Losing that distinction
// would let Save overwrite a user snippet after a preset was loaded, which is
// data loss wearing a UI bug's clothes.
//
// A searchable dialog rather than a dropdown: the preset library is heading for
// ~36 entries, and a <select> that long is a list nobody reads.
export function SnippetBar({
  snippets,
  canSave,
  selection,
  source,
  onSnippets,
  onSelect,
  onNew,
}: {
  snippets: SnippetSummary[];
  /** False for a guest: presets are browsable, saving needs an account. */
  canSave: boolean;
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

  const [pending, startTransition] = useTransition();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [saveOpen, setSaveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [title, setTitle] = useState("");

  const current = snippets.find((s) => s.id === currentId);

  // fold() is the same diacritic-insensitive match the command palette uses,
  // so "vet son" finds "Vệt sơn" here too.
  const hit = useMemo(() => {
    const q = fold(query.trim());
    return (title: string) => q === "" || fold(title).includes(q);
  }, [query]);

  const triggerLabel =
    (selection.startsWith("p:")
      ? (() => {
          const p = findPreset(selection.slice(2));
          return p ? pick(p.title, locale) : null;
        })()
      : current?.title) ?? t("snippetPlaceholder");

  function choose(value: string, loaded: { title: string; source: string }) {
    onSelect(value, loaded);
    setPickerOpen(false);
    setQuery("");
  }

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
      <Button
        variant="outline"
        size="sm"
        className="w-64 justify-between font-normal"
        aria-haspopup="dialog"
        aria-label={t("snippets")}
        onClick={() => setPickerOpen(true)}
      >
        <span className="truncate">{triggerLabel}</span>
        <IconChevronDown className="opacity-60" />
      </Button>

      <CommandDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        title={t("snippets")}
        description={t("searchPlaceholder")}
        // Wider and taller than the primitive's defaults (sm:max-w-sm,
        // max-h-72): seven groups of presets need room, and sitting nearer the
        // top keeps the taller list clear of the bottom of the viewport.
        className="top-[8vh] sm:max-w-2xl"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t("searchPlaceholder")}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList className="max-h-[70vh]">
            <CommandEmpty>{t("noMatch")}</CommandEmpty>
            {PRESET_GROUPS.map((group) => {
              const matches = group.presets.filter((p) =>
                hit(pick(p.title, locale)),
              );
              if (matches.length === 0) return null;
              return (
                <CommandGroup
                  key={group.id}
                  heading={pick(group.label, locale)}
                >
                  {matches.map((p) => (
                    <CommandItem
                      key={p.slug}
                      value={`p:${p.slug}`}
                      onSelect={() =>
                        choose(`p:${p.slug}`, {
                          title: pick(p.title, locale),
                          source: presetSource(p, locale),
                        })
                      }
                    >
                      {pick(p.title, locale)}
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
            {snippets.filter((snip) => hit(snip.title)).length > 0 && (
              <CommandGroup heading={t("yourSnippets")}>
                {snippets
                  .filter((snip) => hit(snip.title))
                  .map((snip) => (
                    <CommandItem
                      key={snip.id}
                      value={`u:${snip.id}`}
                      onSelect={() =>
                        choose(`u:${snip.id}`, {
                          title: snip.title,
                          source: snip.fragmentShader,
                        })
                      }
                    >
                      {snip.title}
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>

      <Button variant="outline" size="sm" onClick={onNew}>
        <IconFilePlus /> {t("new")}
      </Button>

      {canSave && (
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
      )}

      {canSave && current && (
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
