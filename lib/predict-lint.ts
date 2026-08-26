// Validates the <Predict> blocks in a lesson's two theory files. Pure so
// lint-content.ts and the unit tests share the exact same rules.
//
// Nothing else checks these: lint-content has no MDX component allowlist, only
// a list of components a lesson must contain. Without this the two locales
// drift apart silently — one gets a question, the other does not, and the page
// still builds.

export interface PredictLintResult {
  errors: string[];
}

const BLOCK = /<Predict\b[\s\S]*?\/>/g;
const OPTIONS = /options=\{\s*\[([\s\S]*?)\]\s*\}/;
const ANSWER = /answer=\{\s*(-?\d+)\s*\}/;
// A JSX string literal, escapes included — counting bare quotes would miscount
// any option containing one.
const STRING = /"(?:[^"\\]|\\.)*"/g;

function optionCount(block: string): number | null {
  const inner = OPTIONS.exec(block)?.[1];
  if (inner === undefined) return null;
  return (inner.match(STRING) ?? []).length;
}

function answerIndex(block: string): number | null {
  const raw = ANSWER.exec(block)?.[1];
  return raw === undefined ? null : Number(raw);
}

export function lintPredict(args: {
  at: string;
  vi: string;
  en: string;
}): PredictLintResult {
  const { at, vi, en } = args;
  const errors: string[] = [];
  const blocks = {
    vi: vi.match(BLOCK) ?? [],
    en: en.match(BLOCK) ?? [],
  };

  if (blocks.vi.length !== blocks.en.length) {
    errors.push(
      `${at}: <Predict> count differs (vi: ${blocks.vi.length}, en: ${blocks.en.length}) — both locales carry the same questions`,
    );
    return { errors };
  }

  for (const [i, viBlock] of blocks.vi.entries()) {
    const enBlock = blocks.en[i]!;
    const where = `${at}: <Predict> #${i + 1}`;

    const counts = { vi: optionCount(viBlock), en: optionCount(enBlock) };
    for (const loc of ["vi", "en"] as const) {
      if (counts[loc] === null) {
        errors.push(`${where}: ${loc} has no options={[...]} array`);
      } else if (counts[loc] === 0) {
        errors.push(`${where}: ${loc} options array is empty`);
      }
    }
    if (counts.vi === null || counts.en === null) continue;

    if (counts.vi !== counts.en) {
      errors.push(
        `${where}: option count differs (vi: ${counts.vi}, en: ${counts.en})`,
      );
    }

    for (const [loc, block, count] of [
      ["vi", viBlock, counts.vi],
      ["en", enBlock, counts.en],
    ] as const) {
      const answer = answerIndex(block);
      if (answer === null) {
        errors.push(`${where}: ${loc} has no answer={n}`);
      } else if (answer < 0 || answer >= count) {
        errors.push(
          `${where}: ${loc} answer=${answer} is outside 0..${count - 1}`,
        );
      }
    }
  }

  return { errors };
}
