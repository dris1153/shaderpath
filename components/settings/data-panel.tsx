"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { IconDownload, IconUpload } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  validate,
  SchemaVersionError,
  ValidationError,
  type ImportPayload,
} from "@/lib/export-import-schema";
import { downloadExportFile } from "./download-export";
import { ImportDialog } from "./import-dialog";

export function DataPanel() {
  const t = useTranslations("settings");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [preview, setPreview] = useState<ImportPayload | null>(null);

  async function handleExport() {
    setExporting(true);
    try {
      await downloadExportFile();
    } catch {
      toast.error(t("exportError"));
    } finally {
      setExporting(false);
    }
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file next time
    if (!file) return;
    try {
      const text = await file.text();
      setPreview(validate(JSON.parse(text)));
    } catch (err) {
      if (err instanceof SchemaVersionError) {
        toast.error(err.message);
      } else if (err instanceof ValidationError) {
        toast.error(t("importInvalid", { issues: err.issues.slice(0, 3).join("; ") }));
      } else {
        toast.error(t("importParseError"));
      }
    }
  }

  return (
    <>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("dataTitle")}</CardTitle>
          <CardDescription>{t("dataDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={exporting} onClick={handleExport}>
            <IconDownload /> {t("exportButton")}
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <IconUpload /> {t("importButton")}
          </Button>
          <Input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFile}
          />
        </CardContent>
      </Card>

      <ImportDialog payload={preview} onOpenChange={(open) => !open && setPreview(null)} />
    </>
  );
}
