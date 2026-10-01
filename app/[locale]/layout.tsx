import type { Metadata } from "next";
import { Baloo_2, JetBrains_Mono, Nunito } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { QualityProvider } from "@/components/providers/quality-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AppHeader } from "@/components/shell/app-header";
import { SkipLink } from "@/components/shell/skip-link";
import { BottomTabs } from "@/components/shell/bottom-tabs";
import { CommandProvider } from "@/components/command/command-provider";
import "../globals.css";
// Vendored stylesheet for a mandated dependency — allowed per decision D7
import "katex/dist/katex.min.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "latin-ext", "vietnamese"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shaderpath",
  description: "A 3D & shader learning roadmap for frontend developers",
};

// One entry per locale so the shell can prerender, which every route beneath
// it now does — user data arrives from /api/* after hydration instead.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  // Without this, next-intl's server APIs read headers() and opt the whole
  // subtree back into dynamic rendering, generateStaticParams or not.
  setRequestLocale(locale);
  const tA11y = await getTranslations("a11y");

  return (
    <html
      lang={locale}
      className={`${baloo.variable} ${nunito.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <QualityProvider>
                <TooltipProvider>
                  <CommandProvider>
                    <SkipLink />
                    <AppHeader />
                    {children}
                    <BottomTabs label={tA11y("mainNav")} />
                    {/* Clear the mobile tab bar. */}
                    <Toaster mobileOffset={{ bottom: "calc(4.5rem + env(safe-area-inset-bottom))" }} />
                  </CommandProvider>
                </TooltipProvider>
              </QualityProvider>
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
