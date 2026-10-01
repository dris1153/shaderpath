import {
  IconCards,
  IconCode,
  IconRoute,
  IconUserCircle,
} from "@tabler/icons-react";

// The four destinations, shared by the desktop header and the mobile tab bar.
// `match` lists the locale-free path prefixes that light the item up.
export const NAV_ITEMS = [
  { key: "learn", href: "/roadmap", Icon: IconRoute, match: ["/roadmap", "/track", "/lesson"] },
  { key: "review", href: "/review", Icon: IconCards, match: ["/review"] },
  { key: "playground", href: "/playground", Icon: IconCode, match: ["/playground"] },
  { key: "you", href: "/stats", Icon: IconUserCircle, match: ["/stats", "/notes", "/settings"] },
] as const;

export type NavKey = (typeof NAV_ITEMS)[number]["key"];

/** The nav item a locale-free pathname belongs to, if any. */
export function activeNavKey(pathname: string): NavKey | undefined {
  return NAV_ITEMS.find((item) =>
    item.match.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)),
  )?.key;
}
