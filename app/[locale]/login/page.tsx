import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthForm } from "@/components/auth/auth-form";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-sm flex-1 px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">{t("loginTitle")}</h1>
      <p className="text-muted-foreground mt-2 mb-6 text-sm">{t("loginSubtitle")}</p>
      <AuthForm mode="login" />
    </main>
  );
}
