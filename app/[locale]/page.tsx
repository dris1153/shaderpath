import { getTranslations, setRequestLocale } from "next-intl/server";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");
  const tApp = await getTranslations("app");

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="container mx-auto w-full flex-1 px-4 py-10"
    >
      <h1 className="text-3xl font-semibold tracking-tight">{t("welcome")}</h1>
      <p className="text-muted-foreground mt-2">{tApp("tagline")}</p>
      <DashboardView />
    </main>
  );
}
