import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SHOTS } from "@/components/home/demo-shots";
import { LESSONS } from "@/content/curriculum";

// The landing strip points at lessons by slug and at PNGs by path, and it
// renders nothing for a slug it cannot resolve. Without this, renaming a
// checkpoint would quietly leave the page with two thumbnails.
describe("home demo strip", () => {
  it("every shot resolves to a real lesson", () => {
    for (const shot of SHOTS) {
      expect(LESSONS.find((l) => l.slug === shot.slug), shot.slug).toBeDefined();
    }
  });

  it("every shot points at an image that exists", () => {
    for (const shot of SHOTS) {
      const file = path.join(process.cwd(), "public", shot.src);
      expect(existsSync(file), shot.src).toBe(true);
    }
  });
});
