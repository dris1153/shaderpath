import { hasVecMarker, parseVec } from "../src/kit/vec-marker";

// On-screen multiplication symbols keep one meaning each (video/src/kit/STYLE.md, "Math symbols"):
// · is the dot product and × the cross product, both only between vectors. Plain multiplication
// is `*`. A · or × between two numbers (or a tuple and a number), or beside a member access (`a.x`), is plain
// multiplication in disguise.
const NUMBER_SIDES = /[\d)]\s*[·×]\s*[−-]?\d/;
const MEMBER_SIDE = /\w\.\w+\s*[·×]|[·×]\s*\w+\.\w/;
// An arrow is math notation for a vector; `{a}.x` would put it on a code member access.
const ARROW_ON_CODE = /\}\.\w/;
// A radical sign needs its radicand in braces so the bar spans it: `√{x² + y²}`, not `√(x² + y²)` or `√25`.
const BARE_RADICAND = /√[^\s{]/;
// SVG text drops leading and trailing spaces and merges doubled ones, which would shift the measured letter positions.
const ODD_SPACING = /^\s|\s$|\s{2}/;

export function symbolWarnings(strings: Record<string, string>): string[] {
  const warnings: string[] = [];
  for (const [key, value] of Object.entries(strings)) {
    try {
      parseVec(value);
    } catch (error) {
      warnings.push(`strings.en.json: "${key}": ${(error as Error).message}`);
      continue;
    }
    if (BARE_RADICAND.test(value)) {
      warnings.push(`strings.en.json: "${key}" (${value}) has a radicand without braces; write √{…} so the bar spans it`);
    } else if (hasVecMarker(value) && ODD_SPACING.test(value)) {
      warnings.push(`strings.en.json: "${key}" (${JSON.stringify(value)}) has a leading, trailing or doubled space; SVG collapses it and the arrows would land on the wrong letter`);
    } else if (ARROW_ON_CODE.test(value)) {
      warnings.push(`strings.en.json: "${key}" (${value}) puts a vector arrow on a member access; code stays plain (a.x, not {a}.x)`);
    } else if (NUMBER_SIDES.test(value)) {
      warnings.push(`strings.en.json: "${key}" (${value}) multiplies numbers with · or ×; use * (· is dot, × is cross)`);
    } else if (MEMBER_SIDE.test(value)) {
      warnings.push(`strings.en.json: "${key}" (${value}) puts · or × beside a member access like a.x; use * (· is dot, × is cross)`);
    }
  }
  return warnings;
}
