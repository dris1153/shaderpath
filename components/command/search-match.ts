export interface SearchEntry {
  slug: string;
  locale: "vi" | "en";
  title: string;
  trackTitle: string;
  tags: string[];
  summary: string;
  excerpt: string;
}

/** Diacritic-insensitive fold so "toa do" matches "toạ độ". */
export function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

/** Every query token must hit somewhere; field weight decides the rank. */
export function rankLessons(
  entries: SearchEntry[],
  query: string,
  limit = 12,
): SearchEntry[] {
  const tokens = fold(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const scored: { entry: SearchEntry; score: number }[] = [];
  for (const entry of entries) {
    const title = fold(entry.title);
    const tags = fold(entry.tags.join(" "));
    const summary = fold(entry.summary);
    const excerpt = fold(entry.excerpt);

    let score = 0;
    let allHit = true;
    for (const token of tokens) {
      if (title.includes(token)) score += 10;
      else if (tags.includes(token)) score += 6;
      else if (summary.includes(token)) score += 3;
      else if (excerpt.includes(token)) score += 1;
      else {
        allHit = false;
        break;
      }
    }
    if (allHit) scored.push({ entry, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.entry);
}
