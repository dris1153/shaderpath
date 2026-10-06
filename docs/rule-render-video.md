# Rules for rendering lesson videos

Hard-won rules for `video/` (Remotion). Each one cost time once. Commands and the
pipeline itself are in [video/README.md](../video/README.md); this page is only
what went wrong and what to do instead. Add a line here whenever a render
surprises you.

## Setup on a fresh clone

- **`media/` is gitignored and gone after a clone.** Rebuild it by rendering, not by downloading from YouTube: the upload has the voice baked in, is re-encoded, and has no picture-only version (`out/<slug>/en/video.mp4` is the picture-only render).
- **Two installs.** `pnpm install` in the repo root and again in `video/` (its own workspace and lockfile).
- **`pnpm final` and `pnpm qc` need a full ffmpeg on `PATH`** with `drawtext`, `tile`, `ebur128` and the `mov_text` encoder. Remotion's bundled ffmpeg is not enough. On Windows: `winget install Gyan.FFmpeg`. A shell opened before the install does not see it; open a new one, or in PowerShell reload `PATH` from the Machine and User environment.
- **Rebuild order per lesson** (from `video/`, one lesson at a time):
  `pnpm video:restore <slug>` → `pnpm render <slug>` (English, 2560×1440) → `pnpm qc <slug>` → `pnpm youtube <slug>` → `pnpm final <slug>`.
  The shared outro needs no rebuild: its clip is committed in `content/shared/outro/` and `pnpm youtube` and `pnpm final` join it. No TTS credits are needed, the voice is committed under `content/.../youtube/`.
- **Never run `pnpm tts` on a lesson that already has a voice.** It costs credits, the TTS cache (`video/.cache/tts/`) is gitignored so a fresh clone re-voices every scene, and it rewrites the committed audio with slightly different samples.

## The strings cache decides what the render shows

- **The render reads `video/public/generated/<slug>/<lang>/strings.json`, not `content/.../video/strings.en.json`.** The cache is written by `pnpm tts` and restored by `pnpm video:restore` from `youtube/`. Edit the content file alone and every still keeps the old text.
- **A new string key crashes the scene.** `useString` throws on a key the cache lacks, and the render reports only `ProtocolError: Target closed`. The real error is hidden behind it. If a scene dies with "Target closed" after a strings edit, compare the cache with the content file first.
- **Refresh the cache without TTS:** write `lessonStrings` (the outro has its own strings, in the `outro` fixture) as `JSON.stringify(strings, null, 2) + "\n"` to the `en` and `vi` folders. Both languages' strings files are identical (the strings are language-neutral). There is no command for this yet.
- After `pnpm youtube`, the four `youtube/languages/<lang>/strings.json` files change for real. Commit them.

## Check pictures before spending render time

- **Look at stills first:** `pnpm stills <slug> en <frame,frame,...>` writes PNGs to `video/out/<slug>/en/stills/`. Frame numbers come from `public/generated/<slug>/en/timing.json` (`scenes` and `cues`, 30 fps).
- **Capture baseline stills before touching anything in `video/src/kit/`.** The kit is shared by every lesson, by the `dummy` fixture and by the `outro` fixture that `pnpm outro` collects into the shared clip. After the change, render the same frames of a lesson you did not touch plus the `dummy` stills and `cmp` them byte for byte. Equal means the change cannot have leaked.
- **When `cmp` says a still differs, measure it before guessing.** `ffmpeg -i old.png -i new.png -lavfi psnr -f null -` gives the size of the difference (above ~50 dB is sub-pixel). To see where, use `-lavfi "blend=all_mode=difference,format=gray,lut=y='min(255\,val*60)'"`; `eq` does not amplify values near zero and shows a black image.
- **Look at a frame from the final mp4 too** (`ffmpeg -ss 40 -i final/video.vi.mp4 -frames:v 1 f.png`). It proves the muxed file shows the new picture.

## Narration

- **Read a vector as its own sentence.** Write the spoken text of every tuple as one sentence, with "the vector" in front and commas only inside the tuple: `Here a is the vector three, one. And b is the vector minus two, four.` Spoken as `three, one plus minus two, four`, the pause inside a tuple (0.63 s) was longer than the gap between tuples (none), so the tuples blurred into loose numbers: a listener reported "3 … −6 + 2 … 5" for `(3, −6) + (2, 5)`.
- **Measure pauses from `public/generated/<slug>/<lang>/timing.json`:** for consecutive `words`, the gap is `(next.from - prev.to) / fps`. Inside a tuple it should be below about 0.25 s and at a full stop clearly longer. Some inner pauses still appear (0.4 to 0.6 s in `(0, 1)` and `(2, 2)`); the fitted Vietnamese reads sentence ends with gaps under 0.25 s. Numbers can only flag a problem, judge by ear.
- **`pnpm tts` re-voices every scene when `video/.cache/tts/` is missing** (a fresh clone) and rewrites the committed audio, timing and subtitles. Once the cache exists, only edited scenes cost characters again. Count what will be sent with `spokenText()` from `video/scripts/script-parse.ts`, not with `wc` (markup inflates it).
- **A re-voice moves everything:** scene lengths, cues, chapter times and quiz times in `metadata.md`, and `outroAt` in `upload-notes.md` change for real. Re-render English, run `pnpm youtube` and `pnpm final` again, and keep those file changes.
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
- **Thumbnails use the same markers.** `thumbnail.lines` in `youtube.json` render through `Title`, so write `√{2}`, not `√2`, and `{a} · {b}` for two vectors (the thumbnail itself already follows the arrow rule; a line with arrows gets 30 px of headroom in `Thumbnail.tsx` so the arrows clear the line above), or the thumbnail shows the bare glyph that reads as a check mark. `pnpm video:lint` only checks `strings.en.json`, so look at the thumbnail itself. After a change: `pnpm thumbnail <slug> --pick <n>` (the number of the chosen background; the old file is reproduced byte for byte by a render with the old lines), then `pnpm youtube <slug>` to refresh the copy in `media/`.
- **`·` and `×` are only for vectors.** A scalar times something is `*` (`k * v`, `(4, −2) * −1.5`). `pnpm video:lint` flags numbers around `·` or `×`.
- **Vector arrows follow one rule:** an arrow is math notation for a vector, code stays plain (`a.x`, `dot(a, b)`). Details in `video/src/kit/STYLE.md`.

## Resolution and render time

- **Renders are 2560×1440** (`RENDER_SCALE = 2` in `video/scripts/remotion.ts`, passed to `renderMedia`). The layout is hard-coded for 1280×720 and `timing.json` still says 1280×720: never change those, change the scale. YouTube serves at most the size of the uploaded file, so a 1280×720 upload tops out at 720p.
- **Stills stay 1×** and thumbnails stay 1280×720, so the byte-for-byte baselines and the YouTube thumbnail size are unaffected.
- **Measured on a 150-frame sample** (`vector-basics`, frames 5500 to 5649): 2.0 s at 1×, 4.3 s at 2× (2.1× slower, not 4×), video bitrate 0.52 to 1.21 Mbps, and a downscaled 2× frame matches the 1× still at 36.3 dB PSNR (a 1× video frame against the same still gives 34.7 dB, the cost of compression alone).
- **Render English only** (`pnpm render <slug>`). `pnpm final <slug>` builds every language's `final/video.<lang>.mp4` from that English picture plus the language's committed `audio.mp3` (encoded to AAC 128k mono) and `subtitles.vtt`, so no per-language render is needed. Inko's mouth therefore follows English in the Vietnamese file; a lip-synced picture would need `pnpm render <slug> vi` (Inko uses the locale's own words, `video/src/mascot/Inko.tsx`), which still works but nothing consumes it. `final` refuses a voice whose length differs from the picture by more than 0.1 s.
- **Check the loudness of a mux against the voice file, not against an old preview.** Remotion's `final.mp4` carries the mono voice as 2-channel AAC and measures about 3 LU quieter (−19.7 LUFS) than `audio.mp3` (about −16.6 LUFS, the level `qc` approves); the files from `pnpm final` carry the mono voice and measure the same, within 0.2 LU. So does the upload file `media/.../youtube/video.mp4`: `pnpm youtube` builds it from the English picture and `voice.mp3`, not from `final.mp4`, so the English track of the upload is as loud as the Vietnamese dub (YouTube lowers loud audio but never raises quiet audio).
- **`pnpm qc` thresholds were calibrated at 1×.** It scales every frame to 160×90, so a 2× render averages more pixels per sample and reads quieter. A "nothing still > 3 s" failure on a 2× render means the scene really is near-static (the `projection` scene of lesson 3 had 4 s of idle-only motion); give it a little motion rather than lowering `STILL`.
- The shared outro clip is rendered by `pnpm render outro` through the same path, so it is 2560×1440 like the lessons; see "The shared outro clip" below.

## The shared outro clip

- **One clip, joined at packaging.** `content/shared/outro/` holds `outro.mp4` (silent, 4.5 MB, the only video allowed in git: `.gitignore` has a `!` line for exactly that path), `outro.<lang>.mp3` and `.vtt`, and `outro.json`. A script with `outro: true` gets it joined by `pnpm youtube` and `pnpm final`; the lesson's scenes, `timing.json` and `strings.json` never contain the outro.
- **The join is a stream copy**, so the lesson render and the clip must be encoded alike (`ffmpeg -i` video line equal apart from the bitrate). A lesson rendered at another scale or `RENDER_SCALE` change fails with "encoded differently": re-render both, do not re-encode the join.
- **Voice join:** lesson voice and clip voice are cut to exact sample counts, joined as wav, normalised with the same `loudnorm` stage as `pnpm tts` and encoded to mp3 once. Encoding an mp3 twice without that stage loses about 0.5 LU; with it the joined level stays within 0.3 LU of a single pass. Remotion's ffmpeg has no `pcm_f32le`, so the wav is 16-bit like the one in `tts.ts`.
- **The clip is not frame-identical to an outro baked into a lesson.** Inko's ambient motion (bob, blink) runs on the absolute frame, so it starts at phase 0 in the clip. Judge a new clip against its own lossless 2× still (`renderStill` with `scale`), 39 to 43 dB, not against another render; compare by frame index (`select=eq(n,…)`), because `psnr` of two files pairs frames by timestamp and shows 20 to 30 dB for identical pictures.
- **A committed joined voice is not a lesson voice.** `pnpm video:restore` cuts it back to the lesson length (mp3 stream copy) and drops the outro cues; `pnpm youtube` refuses a cache voice whose length is not the lesson's, and both `youtube` and `final` refuse a lesson that still voices an `outro` scene of its own.
- **After `pnpm tts` on a lesson with `outro: true`,** the committed `audio.mp3` and `subtitles.vtt` hold the lesson alone until `pnpm youtube` joins the outro again; run it before `pnpm final` or a commit.
- **Changing the outro** adds a few MB to git history per take and moves nothing else: re-run `pnpm youtube` and `pnpm final` for every lesson with `outro: true`, and check `upload-notes.md` (end-screen window) of each.
- **Checking the TTS cache before a paid call:** the key is a hash of the engine setup and the scene text, so an offline probe can tell hits from misses without calling the provider. Fixtures whose generated files are committed (`dummy`) may have no cache at all.

## After the render

- **`pnpm youtube` and `pnpm outro` rewrite committed files with CRLF-only changes** (`core.autocrlf=true`), typically every `metadata.md` and `upload-notes.md`. Check with `git diff --ignore-space-at-eol --numstat`: an empty list is noise, so `git checkout --` those files. Real changes stay: the `strings.json` files after a strings edit, and the chapter times, quiz times and `outroAt` after a re-voice.
- **`pnpm final` refuses an English render older than the committed voice** (it compares `timing.json`). Render first, then `final`.
- **Edit the description in the generator, not in `media/`.** `media/.../metadata.md` is a copy that `pnpm youtube` overwrites. The description carries no subtitle list, dub note, AI-voice credit or lesson count (removed on purpose 2026-10-06); change `COPY` and `description()` in `video/scripts/youtube-meta.ts`, then run `pnpm youtube` for every lesson.
- **Do not re-upload by replacing a file.** YouTube Studio cannot swap the video of an existing upload. A new upload has a new id; update `content/lesson-videos.ts` and unlist the old one. The Vietnamese dub and subtitles stay valid when only the picture's text changed, because timing is unchanged.

## Running it on Windows

- PowerShell shows pnpm's stderr as a red `NativeCommandError` even on success. Trust the exit code (`$LASTEXITCODE`).
- Chain a long job in one background script and stop at the first non-zero exit, so a failed render is not followed by `youtube` and `final` on stale output.
