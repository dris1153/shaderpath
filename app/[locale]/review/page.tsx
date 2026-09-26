import { getTranslations, setRequestLocale } from "next-intl/server";
import { ReviewSession } from "@/components/review/review-session";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("review");

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-2xl flex-1 px-4 py-10"
    >
      <h1 className="text-3xl font-semibold tracking-tight">
        {t("pageTitle")}
      </h1>
      <ReviewSession />
    </main>
  );
}
