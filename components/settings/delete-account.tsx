"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { IconTrash } from "@tabler/icons-react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { downloadExportFile } from "./download-export";

/**
 * Irreversible and unrecoverable: with no email verification there is no reset
 * path, so a deleted account cannot be reclaimed. The confirmation asks for the
 * address rather than a yes/no, and the export button sits inside the same card
 * so the last chance to keep the data is where the decision is made.
 */
export function DeleteAccount() {
  const t = useTranslations("settings");
  const { data } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);

  const email = data?.user?.email ?? null;
  if (!data?.user) return null;

  const confirmed =
    email !== null && typed.trim().toLowerCase() === email.toLowerCase();

  async function handleDelete() {
    setBusy(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) throw new Error(String(res.status));
      queryClient.clear();
      router.refresh();
      router.push("/");
    } catch {
      toast.error(t("deleteAccountError"));
      setBusy(false);
    }
  }

  return (
    <Card className="border-destructive/40 mt-6">
      <CardHeader>
        <CardTitle className="text-destructive text-base">
          {t("deleteAccountTitle")}
        </CardTitle>
        <CardDescription>{t("deleteAccountBody")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => void downloadExportFile()}
        >
          {t("deleteAccountExportFirst")}
        </Button>

        <div className="flex flex-col gap-2">
          <label htmlFor="confirm-email" className="text-sm font-medium">
            {t("deleteAccountConfirmLabel", { email: email ?? "" })}
          </label>
          <Input
            id="confirm-email"
            autoComplete="off"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
          />
        </div>

        <Button
          variant="destructive"
          disabled={!confirmed || busy}
          onClick={handleDelete}
        >
          <IconTrash /> {busy ? t("deleteAccountWorking") : t("deleteAccount")}
        </Button>
      </CardContent>
    </Card>
  );
}
