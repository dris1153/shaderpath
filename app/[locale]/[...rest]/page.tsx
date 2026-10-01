import { notFound } from "next/navigation";

// Unmatched paths under a locale render [locale]/not-found.tsx (inside the app
// shell) instead of Next's bare default 404.
export default function CatchAll() {
  notFound();
}
