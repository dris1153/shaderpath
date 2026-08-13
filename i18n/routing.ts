import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["vi", "en"],
  defaultLocale: "vi",
  localePrefix: "always",
  // Spec §0: vi is THE default — don't let Accept-Language override it
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
