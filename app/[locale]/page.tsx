import { setRequestLocale } from "next-intl/server";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="container mx-auto w-full flex-1 px-4 py-10"
    >
      <DashboardView />
    </main>
  );
}
