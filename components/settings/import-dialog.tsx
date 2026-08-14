"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TABLE_NAMES, type ImportPayload } from "@/lib/export-import-schema";
import { downloadExportFile } from "./download-export";

type ImportMode = "replace" | "merge";

interface ImportResponse {
  counts?: Record<string, number>;
  error?: string;
}

// Preview + replace/merge choice. Confirming always downloads a fresh backup
// FIRST (risk assessment: "import corrupts a working DB") before the POST.
export function ImportDialog({
  payload,
  onOpenChange,
}: {
  payload: ImportPayload | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("settings");
  const router = useRouter();
  const [mode, setMode] = useState<ImportMode>("merge");
  const [pending, startTransition] = useTransition();

  if (!payload) return null;

  const counts = TABLE_NAMES.map((name) => ({
    name,
    count: payload.tables[name].length,
  })).filter((c) => c.count > 0);

  function confirmImport() {
    startTransition(async () => {
      try {
        await downloadExportFile();
        const res = await fetch("/api/progress/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode, data: payload }),
        });
        const json = (await res.json()) as ImportResponse;
        if (!res.ok) {
          toast.error(json.error ?? t("importError"));
          return;
        }
        toast.success(t("importSuccess"));
        onOpenChange(false);
        router.refresh();
      } catch {
        toast.error(t("importError"));
      }
    });
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("importPreviewTitle")}</DialogTitle>
          <DialogDescription>{t("importBackupNotice")}</DialogDescription>
        </DialogHeader>

        <ul className="text-muted-foreground max-h-48 space-y-1 overflow-y-auto text-sm">
          {counts.length === 0 ? (
            <li>{t("importEmpty")}</li>
          ) : (
            counts.map((c) => (
              <li key={c.name} className="flex justify-between">
                <span>{t(`table_${c.name}`)}</span>
                <span className="tabular-nums">{c.count}</span>
              </li>
            ))
          )}
        </ul>

        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium">{t("importModeLabel")}</span>
          <Select
            value={mode}
            onValueChange={(next) => {
              if (next) setMode(next);
            }}
          >
            <SelectTrigger size="sm" className="w-40" aria-label={t("importModeLabel")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="merge">{t("importModeMerge")}</SelectItem>
              <SelectItem value="replace">{t("importModeReplace")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            {t("cancel")}
          </Button>
          <Button onClick={confirmImport} disabled={pending}>
            {t("importConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
