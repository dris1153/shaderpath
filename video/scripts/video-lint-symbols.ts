// On-screen multiplication symbols keep one meaning each (video/src/kit/STYLE.md, "Math symbols"):
// · is the dot product and × the cross product, both only between vectors. Plain multiplication
// is `*`. A · or × between two numbers (or a tuple and a number), or beside a member access (`a.x`), is plain
// multiplication in disguise.
const NUMBER_SIDES = /[\d)]\s*[·×]\s*[−-]?\d/;
const MEMBER_SIDE = /\w\.\w+\s*[·×]|[·×]\s*\w+\.\w/;

export function symbolWarnings(strings: Record<string, string>): string[] {
  const warnings: string[] = [];
  for (const [key, value] of Object.entries(strings)) {
    if (NUMBER_SIDES.test(value)) {
      warnings.push(`strings.en.json: "${key}" (${value}) multiplies numbers with · or ×; use * (· is dot, × is cross)`);
    } else if (MEMBER_SIDE.test(value)) {
      warnings.push(`strings.en.json: "${key}" (${value}) puts · or × beside a member access like a.x; use * (· is dot, × is cross)`);
    }
  }
  return warnings;
}
