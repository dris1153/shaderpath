import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default async function LessonNotFound() {
  const t = await getTranslations("errors");

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
      <Alert>
        <AlertTitle>{t("lessonNotFoundTitle")}</AlertTitle>
        <AlertDescription>{t("lessonNotFoundDescription")}</AlertDescription>
      </Alert>
      <Button
        className="mt-4"
        nativeButton={false}
        render={<Link href="/roadmap" />}
      >
        {t("backToRoadmap")}
      </Button>
    </main>
  );
}
