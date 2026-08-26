import { defineRouting } from "next-intl/routing";
import { DEFAULT_LOCALE, LOCALES } from "@/content/types";

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
  // Spec §0: vi is THE default — don't let Accept-Language override it
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
