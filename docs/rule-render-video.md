# Rules for rendering lesson videos

Hard-won rules for `video/` (Remotion). Each one cost time once. Commands and the
pipeline itself are in [video/README.md](../video/README.md); this page is only
what went wrong and what to do instead. Add a line here whenever a render
surprises you.

## Setup on a fresh clone

- **`media/` is gitignored and gone after a clone.** Rebuild it by rendering, not by downloading from YouTube: the upload has the voice baked in, is re-encoded, and has no picture-only version.
- **Two installs.** `pnpm install` in the repo root and again in `video/` (its own workspace and lockfile).
- **`pnpm final` and `pnpm qc` need a full ffmpeg on `PATH`** with `drawtext`, `tile`, `ebur128` and the `mov_text` encoder. Remotion's bundled ffmpeg is not enough. On Windows: `winget install Gyan.FFmpeg`. A shell opened before the install does not see it; open a new one, or in PowerShell reload `PATH` from the Machine and User environment.
- **Rebuild order per lesson** (from `video/`, one lesson at a time):
  `pnpm video:restore <slug>` → `pnpm render <slug> en` → `pnpm render <slug> vi` → `pnpm qc <slug>` → `pnpm youtube <slug>` → `pnpm final <slug>`.
  The shared outro is `pnpm outro en`. No TTS credits are needed, the voice is committed under `content/.../youtube/`.
- **Never run `pnpm tts` on a lesson that already has a voice.** It costs credits, the TTS cache (`video/.cache/tts/`) is gitignored so a fresh clone re-voices every scene, and it rewrites the committed audio with slightly different samples.

## The strings cache decides what the render shows

- **The render reads `video/public/generated/<slug>/<lang>/strings.json`, not `content/.../video/strings.en.json`.** The cache is written by `pnpm tts` and restored by `pnpm video:restore` from `youtube/`. Edit the content file alone and every still keeps the old text.
- **A new string key crashes the scene.** `useString` throws on a key the cache lacks, and the render reports only `ProtocolError: Target closed`. The real error is hidden behind it. If a scene dies with "Target closed" after a strings edit, compare the cache with the content file first.
- **Refresh the cache without TTS:** write `{...outroStrings (only if the script has outro: true), ...lessonStrings}` as `JSON.stringify(strings, null, 2) + "\n"` to the `en` and `vi` folders. Both languages share the English picture, so both files are identical. There is no command for this yet.
- After `pnpm youtube`, the four `youtube/languages/<lang>/strings.json` files change for real. Commit them.

## Check pictures before spending render time

- **Look at stills first:** `pnpm stills <slug> en <frame,frame,...>` writes PNGs to `video/out/<slug>/en/stills/`. Frame numbers come from `public/generated/<slug>/en/timing.json` (`scenes` and `cues`, 30 fps).
- **Capture baseline stills before touching anything in `video/src/kit/`.** The kit is shared by every lesson and by the `dummy` fixture that `pnpm outro` renders into the shared outro. After the change, render the same frames of a lesson you did not touch plus the `dummy` outro and `cmp` them byte for byte. Equal means the change cannot have leaked.
- **When `cmp` says a still differs, measure it before guessing.** `ffmpeg -i old.png -i new.png -lavfi psnr -f null -` gives the size of the difference (above ~50 dB is sub-pixel). To see where, use `-lavfi "blend=all_mode=difference,format=gray,lut=y='min(255\,val*60)'"`; `eq` does not amplify values near zero and shows a black image.
- **Look at a frame from the final mp4 too** (`ffmpeg -ss 40 -i final/video.vi.mp4 -frames:v 1 f.png`). It proves the muxed file shows the new picture.

## Narration

- **Read a vector as its own sentence.** Write the spoken text of every tuple as one sentence, with "the vector" in front and commas only inside the tuple: `Here a is the vector three, one. And b is the vector minus two, four.` Spoken as `three, one plus minus two, four`, the pause inside a tuple (0.63 s) was longer than the gap between tuples (none), so the tuples blurred into loose numbers: a listener reported "3 … −6 + 2 … 5" for `(3, −6) + (2, 5)`.
- **Measure pauses from `public/generated/<slug>/<lang>/timing.json`:** for consecutive `words`, the gap is `(next.from - prev.to) / fps`. Inside a tuple it should be below about 0.25 s and at a full stop clearly longer. Some inner pauses still appear (0.4 to 0.6 s in `(0, 1)` and `(2, 2)`); the fitted Vietnamese reads sentence ends with gaps under 0.25 s. Numbers can only flag a problem, judge by ear.
- **`pnpm tts` re-voices every scene when `video/.cache/tts/` is missing** (a fresh clone) and rewrites the committed audio, timing and subtitles. Once the cache exists, only edited scenes cost characters again. Count what will be sent with `spokenText()` from `video/scripts/script-parse.ts`, not with `wc` (markup inflates it).
- **A re-voice moves everything:** scene lengths, cues, chapter times and quiz times in `metadata.md`, and `outroAt` in `upload-notes.md` change for real. Re-render both languages, and keep those file changes.
- **The ElevenLabs key goes in the repo-root `.env.local`** (gitignored); `scripts/tts.ts` loads no other file (a key already in the process environment also works). Never put it in `.env.example` (tracked) or print it. Before a commit, check `git diff` for any `*_API_KEY=` line.

## Text on screen

- **Bundled fonts miss many glyphs.** None of Baloo 2, Nunito or JetBrains Mono has the combining arrow U+20D7. Draw it as SVG. `video/scripts/cmap.test.ts` lists what the fonts cover.
- **`loadFont` resolves late.** It adds a face to `document.fonts` only after the face has loaded, so measuring text early uses a fallback face. Await `FONTS_READY` (from `kit/fonts.ts`) before measuring.
- **Never guess glyph heights.** A guessed height put arrowheads on top of letters. Measure with `canvas.measureText().actualBoundingBoxAscent` in the real font.
- **Draw decoration under the text.** A paper-coloured halo around an arrow drawn after the letter covers the letter. The reverse holds for a stroke that touches letters, like a radical: the text's own halo (`Title` size/7, `Label` size/6) cuts a stroke drawn under it, so draw that stroke over the text and keep only its halo underneath.
- **Do not size things from `string.length` when the string has markup.** `{a}` is 3 characters but 1 on screen. Use `vecPlain()`. Check pill widths, label offsets and anything placed after a string.
- **Do not split a marked string into several text nodes.** Rendering `{a} · {b}` as separate string children moved glyphs by sub-pixels (PSNR 50-62 dB against the old render). Keep the text one string and split only where a hidden glyph is needed (the `√` of a radicand).
- **Leading, trailing and doubled spaces break marked strings.** SVG collapses them, so `getExtentOfChar` indices drift or throw and the render dies with "Target closed". Use single spaces; `pnpm video:lint` warns.
- **Radicals:** write `√{x² + y²}`, never `√(x² + y²)` or `√25`. The bar spans the braces and the parentheses go away. A bare `√` is for running text only: at display size the font glyph looks like a check mark, and a crossed-out one reads as "wrong". An icon uses `√{x}`.
  - `pnpm video:lint` warns on `√(…)`, on `√25`, and on any `√` followed by something other than a space or `{`.
  - A radicand cannot contain another marker: `√{{a} · {a}}` throws. No lesson needs it yet.
  - The `√` stays in the text inside an invisible `<tspan>` so the line keeps its width and the drawn radical sits in that box. Place anything that follows the string with `vecPlain()`, which keeps the `√`: `length.tsx` puts `= √{25} = 5` after `√{9 + 16}` this way.
- **`·` and `×` are only for vectors.** A scalar times something is `*` (`k * v`, `(4, −2) * −1.5`). `pnpm video:lint` flags numbers around `·` or `×`.
- **Vector arrows follow one rule:** an arrow is math notation for a vector, code stays plain (`a.x`, `dot(a, b)`). Details in `video/src/kit/STYLE.md`.

## After the render

- **`pnpm youtube` and `pnpm outro` rewrite committed files with CRLF-only changes** (`core.autocrlf=true`), typically every `metadata.md` and `upload-notes.md`. Check with `git diff --ignore-space-at-eol --numstat`: an empty list is noise, so `git checkout --` those files. Real changes stay: the `strings.json` files after a strings edit, and the chapter times, quiz times and `outroAt` after a re-voice.
- **`pnpm final` refuses a render older than the committed voice** (it compares `timing.json`). Render first, then `final`.
- **Do not re-upload by replacing a file.** YouTube Studio cannot swap the video of an existing upload. A new upload has a new id; update `content/lesson-videos.ts` and unlist the old one. The Vietnamese dub and subtitles stay valid when only the picture's text changed, because timing is unchanged.

## Running it on Windows

- PowerShell shows pnpm's stderr as a red `NativeCommandError` even on success. Trust the exit code (`$LASTEXITCODE`).
- Chain a long job in one background script and stop at the first non-zero exit, so a failed render is not followed by `youtube` and `final` on stale output.
