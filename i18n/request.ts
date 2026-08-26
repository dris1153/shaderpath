import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { DEFAULT_LOCALE } from "@/content/types";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // A locale still being filled in may have no messages file yet. Falling back
  // keeps its pages rendering — with default-locale chrome — instead of a 500
  // the moment it is added to the routing list. Never for the default locale
  // itself: there is nothing left to fall back to, so let that one surface.
  try {
    return {
      locale,
      messages: (await import(`../content/i18n/${locale}.json`)).default,
    };
  } catch (error) {
    if (locale === DEFAULT_LOCALE) throw error;
    console.warn(
      `[i18n] no messages for "${locale}", falling back to "${DEFAULT_LOCALE}"`,
      error,
    );
    return {
      locale,
      messages: (await import(`../content/i18n/${DEFAULT_LOCALE}.json`)).default,
    };
  }
});
