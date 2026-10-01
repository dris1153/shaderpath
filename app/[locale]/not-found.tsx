import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { FullPageState } from "@/components/states/full-page-state";

export default async function NotFound() {
  const t = await getTranslations("errors");

  return (
    <FullPageState title={t("notFoundTitle")} description={t("notFoundDescription")}>
      <Link href="/" className={buttonVariants()}>
        {t("goHome")}
      </Link>
      <Link href="/roadmap" className={buttonVariants({ variant: "secondary" })}>
        {t("backToRoadmap")}
      </Link>
    </FullPageState>
  );
}
