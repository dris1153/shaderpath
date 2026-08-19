import { getTranslations, setRequestLocale } from "next-intl/server";
import { PlaygroundClient } from "@/components/playground/playground-client";

export default async function PlaygroundPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("playground");

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto flex w-full container flex-1 flex-col px-4 py-8"
    >
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-muted-foreground mt-2 mb-6">{t("subtitle")}</p>
      <PlaygroundClient />
    </main>
  );
}
