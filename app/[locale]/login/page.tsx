import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthForm } from "@/components/auth/auth-form";
import { Inko } from "@/components/mascot/inko";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 py-10">
      <Inko pose="wave" size={130} />
      <div className="edge-card bg-card mt-1 w-full rounded-2xl p-6 sm:p-8">
        <h1 className="text-3xl leading-tight">{t("loginTitle")}</h1>
        <p className="text-muted-foreground mt-2 mb-6">{t("loginSubtitle")}</p>
        <AuthForm mode="login" />
      </div>
    </main>
  );
}
