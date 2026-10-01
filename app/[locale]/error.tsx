"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { FullPageState } from "@/components/states/full-page-state";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <FullPageState title={t("title")} description={t("pageErrorDescription")}>
      <Button onClick={retry}>{t("retry")}</Button>
      <Link href="/" className={buttonVariants({ variant: "secondary" })}>
        {t("goHome")}
      </Link>
    </FullPageState>
  );
}
