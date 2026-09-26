import { defineRouting } from "next-intl/routing";
import { DEFAULT_LOCALE, LOCALES } from "@/content/types";

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
  // en is THE default — neither Accept-Language nor a remembered cookie overrides it
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
