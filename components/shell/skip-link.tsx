import { getTranslations } from "next-intl/server";

// First tab stop on every page — jumps past header/nav straight to <main id="main-content">.
export async function SkipLink() {
  const t = await getTranslations("a11y");

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:border focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg focus:ring-3 focus:ring-ring/50 focus:outline-none"
    >
      {t("skipToContent")}
    </a>
  );
}
