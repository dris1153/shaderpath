"use client";

import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function PlaygroundError({ reset }: { reset: () => void }) {
  const t = useTranslations("errors");

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
      <Alert variant="destructive">
        <AlertTitle>{t("title")}</AlertTitle>
        <AlertDescription>{t("description")}</AlertDescription>
      </Alert>
      <Button className="mt-4" onClick={reset}>
        {t("retry")}
      </Button>
    </main>
  );
}
