import { getTranslations } from "next-intl/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LocaleSwitcher } from "@/components/shell/locale-switcher";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { QualitySelect } from "@/components/settings/quality-select";
import { DataPanel } from "@/components/settings/data-panel";

export default async function SettingsPage() {
  const t = await getTranslations("settings");

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{t("appearanceTitle")}</CardTitle>
          <CardDescription>{t("appearanceDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm">{t("languageLabel")}</span>
            <LocaleSwitcher />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">{t("themeLabel")}</span>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("qualityTitle")}</CardTitle>
          <CardDescription>{t("qualityCardDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <QualitySelect />
        </CardContent>
      </Card>

      <DataPanel />
    </main>
  );
}
