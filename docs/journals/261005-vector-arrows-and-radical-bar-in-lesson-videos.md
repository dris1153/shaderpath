# Vector Arrows and Radical Bar in Lesson Videos

**Date**: 2026-10-05  
**Severity**: Medium  
**Component**: video/src/kit (Remotion), lesson scenes (vector-basics, dot-and-cross-products)  
**Status**: Pending phase 4 (YouTube re-upload and site wiring)

## Summary

Implemented vector arrows and radical bars in the video kit. Vectors now render with arrows over their letters in math expressions (vector-basics, dot-and-cross-products videos), and the radical sign in vector-basics now draws a bar spanning the radicand, matching the lesson page layout. Both features use SVG because the bundled fonts (Baloo 2, Nunito, JetBrains Mono) lack U+20D7 (combining arrow) and have no radical bar.

## What Changed

**Commits:**
- `61a3a2e`: kit arrow rendering (MarkedText SVG arrow, FONTS_READY promise), lint for malformed markers, arrows on code and odd spacing
- `f8a71e6`: apply arrows to vector-basics and dot-and-cross-products scenes
- `e33d870`: kit radical bar drawing, lint for a radicand without braces, `docs/rule-render-video.md`
- `3973cf9`: apply radical bar to vector-basics, use `*` for scalar multiplication

**Files:**
- `video/src/kit/vec-marker.ts`: marker parsing (`{a}` arrows, `√{…}` radicands)
- `video/src/kit/vector-arrow.tsx`: `MarkedText`: measures the live text, draws the arrows and the radical (hook, descending stroke, ascending stroke, bar)
- `video/src/lessons/vector-basics/`: scenes updated, strings normalized
- `video/src/lessons/dot-and-cross-products/`: scenes updated
- `docs/rule-render-video.md`: rules documented for future work

## Decisions

- **Multiplication symbol rule:** `*` for scalar (plain) multiplication (`k * v`, `(4, −2) * −1.5`); `·` and `×` only for vector dot/cross products. Updated STYLE.md exception for lesson 2.
- **Radical marker:** `√{x² + y²}` with braces directly after `√`; parentheses dropped to match KaTeX rendering.
- **Invisible glyph strategy:** Keep `√` in text but invisible (`<tspan fill="none" stroke="none">`) so the line reserves its width and the drawn radical sits aligned.
- **Arrow rule:** An arrow marks math notation for a vector; code stays plain (`a.x`, `dot(a, b)`). Strings mark letters with `{a}`.
- **YouTube handling:** vector-basics cannot be replaced in place; YouTube re-upload gets a new id.

## Surprises and Fixes

**The strings cache trap:** The render reads `video/public/generated/<slug>/<lang>/strings.json`, not `content/.../video/strings.en.json`. Editing the content file alone leaves the render using the old cached text. A new cache key crashes the scene with opaque "ProtocolError: Target closed". Fixed by manually writing the cache (no command exists yet to do this without `pnpm tts` spending credits).

**Arrow height was guessed wrong:** First version measured the text and drew the arrow above it, but the arrowhead and halo sat on top of letter ascenders. Fixed by measuring real ink height with `canvas.measureText().actualBoundingBoxAscent` and drawing the marks underneath the text.

**Marked string splitting causes pixel drift:** Rendering `{a} · {b}` as separate text nodes shifted glyphs by sub-pixels (PSNR 50-62 dB). Kept the string intact and split only where a hidden glyph is needed (the invisible `√` in a radicand).

**Spacing whitespace crashes the render:** Leading, trailing, or doubled spaces in a marked string break the render because SVG collapses whitespace and `getExtentOfChar` indices drift. Added a lint warning; no existing string was affected.

**Media restoration:** After a fresh clone, `media/` is gitignored and gone. Rebuilt it by rendering from source (video:restore → render en/vi → qc → youtube → final), not by downloading from YouTube (which has voice baked in and no picture-only version). No TTS credits used; voice is committed under `content/.../youtube/`.

## Open Items

- **YouTube re-upload:** Phase 4 pending. vector-basics upload gets a new id; `content/lesson-videos.ts` must be updated.
- **Cache refresh without TTS:** No command to refresh `video/public/generated/<slug>/<lang>/strings.json` without spending credits. Manual JSON write works but needs a utility.
- **parseVec performance:** Runs three times per render (cosmetic issue, low priority).
- **Studio preview lag:** Arrows render correctly in the final file but lag when a label moves every frame in Remotion Studio (left alone on purpose).

## Baseline Validation

Captured stills of untouched lessons before modifying kit, then compared byte-for-byte after the change to confirm no leakage. Used ffmpeg PSNR and amplified difference images when sub-pixel shifts appeared. The tester and code-reviewer agents also helped: in the radical round the review caught that plain runs were being measured too, which could abort a render on odd spacing.
