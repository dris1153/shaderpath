import type { Metadata } from "next";
import { Google_Sans, Google_Sans_Code } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { QualityProvider } from "@/components/providers/quality-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AppHeader } from "@/components/shell/app-header";
import { SkipLink } from "@/components/shell/skip-link";
import { CommandProvider } from "@/components/command/command-provider";
import { getQualityTierSetting } from "@/lib/settings-read";
import "../globals.css";
// Vendored stylesheet for a mandated dependency — allowed per decision D7
import "katex/dist/katex.min.css";

const googleSans = Google_Sans({
  variable: "--font-google-sans",
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
});

const googleSansCode = Google_Sans_Code({
  variable: "--font-google-sans-code",
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shaderpath",
  description: "A 3D & shader learning roadmap for frontend developers",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Reads the persisted quality tier on every request (spec §6.2.14).
export const dynamic = "force-dynamic";

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
  const initialTier = getQualityTierSetting();

  return (
    <html
      lang={locale}
      className={`${googleSans.variable} ${googleSansCode.variable} h-full antialiased`}
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
              <QualityProvider initialTier={initialTier}>
                <TooltipProvider>
                  <SkipLink />
                  <AppHeader />
                  {children}
                  <Toaster />
                  <CommandProvider />
                </TooltipProvider>
              </QualityProvider>
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
