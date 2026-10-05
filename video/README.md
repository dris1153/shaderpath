# Lesson videos

This package turns a lesson into a 3–5 minute cartoon explainer, hosted by Inko the octopus.

- **Stack:** Remotion 4 with a small kit of flat-cartoon primitives, TTS voices from ElevenLabs or Fish Audio, and cue-driven timing.
- **Outputs:** every lesson ships as separate files: picture (2560×1440), voice and subtitles. Nothing is burned in, so a language is a new voice file and a new subtitle file.
- **Isolation:** `video/` is its own pnpm workspace (own lockfile). The Next.js app never imports it.

## Setup

```sh
cd video
pnpm install
```

- **Keys:** put `ELEVENLABS_API_KEY` and/or `FISH_AUDIO_API_KEY` in the repo-root `.env.local`. The scripts load that file themselves and never print or cache the keys.
- **ffmpeg:** `pnpm qc` needs a full ffmpeg on `PATH`, with `tile`, `drawtext` and `ebur128`. Rendering and TTS use Remotion's bundled ffmpeg, so they need nothing else.

## Where things live

| What | Where |
|---|---|
| Script, per language | `content/lessons/<track>/<slug>/video/script.<lang>.md` |
| On-screen strings | `content/lessons/<track>/<slug>/video/strings.en.json` |
| Scene code | `video/src/lessons/<slug>/`, registered in `video/src/lessons/index.ts` |
| Storyboard | `video/src/lessons/<slug>/STORYBOARD.md` |
| Kit, style rules, mascot | `video/src/kit/` (read `STYLE.md` first), `video/src/mascot/` |
| **Finished files** (committed) | `content/lessons/<track>/<slug>/youtube/` (see below) |
| **Videos and the upload kit** (not pushed) | `media/` at the repo root, gitignored, same structure as `content/` |
| Working cache: voice, timing, subtitles | `video/public/generated/<slug>/<lang>/` (gitignored; rebuilt by `pnpm video:restore`) |
| Working cache: renders and QC | `video/out/<slug>/<lang>/` (gitignored; re-render any time) |
| TTS cache (raw provider responses) | `video/.cache/tts/` (gitignored) |

The `dummy` and `style` lessons are pipeline fixtures, not lessons. Their scripts
and strings sit next to their scene code.

## Finished files: `youtube/` and `media/`

What you cannot cheaply re-create is kept in the repo, next to the lesson's `video/` source. **Videos are never pushed**; they live in a gitignored `media/` folder that mirrors `content/`.

```
content/lessons/<track>/<slug>/youtube/      pushed
  thumbnail.png              the chosen thumbnail
  thumbnail-src/             the paid gpt-image backgrounds
  upload-notes.md            language-neutral steps: end screen, outroAt (lessons with the outro)
  languages/<lang>/
    metadata.md              Studio title and description (English also: tags, quizzes)
    subtitles.vtt, audio.mp3, timing.json, strings.json
    site.mp3                 fitted languages: mono 64 kbps dub the site plays
media/lessons/<track>/<slug>/youtube/        gitignored: video.mp4 + a full copy of the tree above
  final/video.<lang>.mp4      per language: picture + voice + soft subtitles in one file (pnpm final)
media/shared/outro/outro.mp4                 gitignored: the shared like/subscribe outro, 14 s, picture only
content/shared/outro/outro.<lang>.mp3        pushed: the outro's voice per language (one picture, a voice each)
```

- **Upload kit.** `pnpm youtube` writes `video.mp4` and a full copy of the tree into `media/`, so one folder holds everything to upload (video, audio, subtitles, metadata, thumbnail, notes). The copy is derived and never deleted from; `content/` is the one to edit.
- **Source of truth.** `video/out/` and `video/public/generated/` are caches. Delete them any time; `pnpm video:restore <slug>` rebuilds the voice, subtitles, timing, strings and thumbnail backgrounds from `content/.../youtube/`, and a render recreates the picture and the mp4. It keeps a cache file that differs from `youtube/` unless you pass `--force`. A fresh clone therefore needs no TTS credits, only a render.
- **Who writes what.** `pnpm tts` mirrors the voice, subtitles, timing and strings; `pnpm thumbnail-bg` mirrors the backgrounds; `pnpm thumbnail <slug> --pick <n>` keeps the chosen thumbnail; `pnpm youtube` writes the rest and fills `media/`.
- **Not stored:** the TTS raw cache (only edited scenes cost characters again), the picture-only `video.mp4` and the preview renders. The mp4 is only in `media/`, so it is lost with the machine; it can be re-rendered, and YouTube holds the upload.
- **No Git LFS.** Nothing large is pushed. Audio is about 12.5 MB per lesson (English, Vietnamese and the site dub).
- **Site dub.** The build (`pnpm build`, and `pnpm dev` on start) runs `pnpm sync:dubs` in the repo root. It copies each `languages/<lang>/site.mp3` to `public/videos/<slug>/audio.<lang>.mp3`, which is gitignored. A host needs no ffmpeg.

## Workflow for one lesson

Each numbered step ends in a check. The **checkpoints** are where a person decides
before money or time is spent.

1. **Script.** Write `script.en.md` from the lesson's theory and review cards.
   - Aim for 420–700 words (3–5 min) and 5–8 scenes: the core mental model, not the whole page.
   - Every sentence must hold up against `theory.en.mdx` and must not contradict the review cards.
   - Check it with `pnpm video:lint <slug>`.
   - **Checkpoint:** approve the full text, the scene list and the estimated length. Scenes and cues are free to change here.
2. **Voice.** Run `pnpm tts <slug> en`.
   - The course voice is ElevenLabs "Jessica", the adapter's default (picked at the pilot).
   - To audition voices, cut the script down to scenes 1–2 for a moment. Then, for each candidate, run `pnpm tts <slug> en --voice <id>` and listen to `public/generated/<slug>/en/voice.mp3`. Restore the full script afterwards. Every take stays cached, so the chosen voice's scenes 1–2 cost nothing in the full run, but each candidate costs its own characters.
   - Scenes are cached by their spoken text, so a re-run with no text change sends 0 characters.
   - The mix is written to a wav first and `loudnorm` reads that file. Placed right after `concat` in the same ffmpeg graph, Remotion's ffmpeg 7.1 shifted and cut the speech of short, silence-heavy tracks (the dummy fixture's Vietnamese voice).
   - After encoding, `tts` checks that `voice.mp3` is as long as the picture and that at most 15% of the word spans are silent (real lessons measure 6–8%; a voice moved a second or more against its words measures 13–70%). On failure it stops, removes its temp files and keeps the previous `voice.mp3`.
   - A re-run rewrites `voice.mp3` with the same timing but slightly different samples than takes made before this change (about 0.4% off, a ~5 MB diff per language in `content/`). Do not re-run `tts` on an uploaded lesson without a reason; `pnpm video:restore <slug> --force` puts the committed audio back.
3. **Storyboard.** Write `STORYBOARD.md`, one entry per scene:
   - the hero;
   - what appears on which cue;
   - the motion;
   - the tail hold.
   - Add `{cue}` markers to the script as the storyboard needs them. **Cue edits never re-voice**, because only the spoken text is in the cache key.
4. **Scenes 1–2.** Build them from kit primitives and Inko, render, and look at the first minute.
   - Render with `pnpm render <slug>`; spot-check with `pnpm stills <slug> en <frames>`.
   - **Checkpoint:** look, pace and Inko's acting. Change the kit or the style here, not later.
5. **The rest.** Build the remaining scenes, render, then run `pnpm qc <slug>` until it passes. It checks:
   - nothing is still for more than 3 s, and every scene ends on a 30-frame calm hold;
   - no black or empty stretches;
   - the subtitle budgets (≤ 42 chars × 2 lines, ≤ 6 s);
   - loudness −16 ±2 LUFS, with peaks ≤ −1 dBFS.
   - Read `qc/sheet.png`, one tile per 3 s. Motion problems print as `m:ss:ff`, where the last field counts frames. Subtitle problems quote their VTT timestamps.
6. **Final checkpoint.** Share `final.mp4` (the preview mux), `subs.vtt` and `qc/sheet.png`.
7. **Commit:** the scene code, storyboard, script and strings, and the lesson's `content/.../youtube/` folder. Never commit videos, `media/`, `video/out/` or `video/public/generated/`.

## Script format

```md
---
slug: cartesian-and-uv-space
title: Cartesian and UV Space
---

## scene: hook
{in}Hi, I'm Inko! Look closely at any screen and you'll find a {grid}grid of tiny squares.
Today we'll meet | {uv}[UV](U V) and [NDC](N D C).
# hold 12
```

| Syntax | Meaning |
|---|---|
| `## scene: <id>` | Starts a scene. Ids are `a-z`, `0-9` and `-`, and must match the keys in the lesson's `scenes` map |
| `{name}` | A cue on the next word. Scene code reads it with `useCue("name")`, as frames since that word started |
| `\|` | Forces a subtitle break before the next word |
| `[display](spoken)` | Subtitles show `display`, and TTS reads `spoken`. Spell out acronyms, symbols and numbers: `[gl_FragCoord](G L frag coord)`, `[(0.5, 0.5)](point five, point five)` |
| `# hold <frames>` | Extra calm frames after the scene's speech (a default 36 is always added) |

A scene lasts as long as its speech, plus the hold.

## Outro

Add `outro: true` to a script's frontmatter (every language) to end on the shared
like/subscribe outro, `src/outro/`. It is appended as a last scene, `outro`, from
`src/outro/script.<lang>.md`, so a lesson must not define its own `outro` scene.
- Beats: Inko presses like (`{like}`), then subscribe and the bell (`{sub}`); from
  `{next}` the buttons leave and the last ~10 s stay free for YouTube's end screen.
- `pnpm youtube` adds a "Thanks for watching" chapter and prints the end-screen
  window and the site's `outroAt`; a `chapters.outro` override is an error.
- Studio → End screen: template "1 video + subscribe". Place the video box over
  the empty left half and the subscribe circle where Inko points (`END_SCREEN`
  in `src/outro/Outro.tsx`).
- The lesson page stops the player at `outroAt` (YouTube's `end`), so site viewers
  skip the outro.

## Scene rules

These are the short version; `src/kit/STYLE.md` has the full rules.

- **Kit first:** build from kit primitives (`Stage`, `PixelGrid`, `Axis2D`, `Callout`, `Pop`, `SlideIn`, `FadeOut`, `drawn`, …) and `Inko`, in palette roles, never hex values. Plain SVG (`line`, `rect`, `circle`) is fine for one-off marks.
- **Timing:** everything moves on `useCue` time. Never nest `<Sequence>` inside a scene.
- **On-screen text:**
  - it comes from `strings.en.json` via `useString`;
  - keep it language-neutral: symbols, formulas and terms such as UV or NDC, plus short English labels;
  - draw ✓, ✗ and other glyphs the bundled fonts lack as paths (`Shape`); `scripts/cmap.test.ts` lists the symbols the fonts cover;
  - the same picture serves every language.
- **Holds:** exits finish at least 30 frames before the cut.

## Commands

| Command | Does |
|---|---|
| `pnpm video:lint <slug>` | Checks the script syntax and that every language keeps the English scenes, and that the scene code's strings and cues exist |
| `pnpm tts <slug> en [--engine elevenlabs\|fish] [--voice <id>] [--model <id>] [--fresh]` | Voices the English master: `voice.mp3`, `timing.json`, `strings.json` and `subs.vtt` in `public/generated/<slug>/en/` |
| `pnpm render <slug> [lang]` | Writes `final.mp4` (picture + voice) and `video.mp4` (picture only) at **2560×1440** (`RENDER_SCALE = 2` in `scripts/remotion.ts`; the layout stays 1280×720) and copies the voice, subtitles and timing into `out/<slug>/<lang>/`. English is what YouTube and the site use. Render `vi` only when `final/video.vi.mp4` is wanted: Inko's mouth follows the locale's own words, so a `vi` render is lip-synced to Vietnamese and costs a second render |
| `… --fresh` | Ignores the TTS cache and re-voices every scene (for example after an ElevenLabs plan change, so the takes fall under the new plan's terms) |
| `pnpm stills <slug> <lang> <f1,f2,…>` | Renders single frames to `out/<slug>/<lang>/stills/` at 1280×720 (always 1×, so stills stay comparable byte for byte) |
| `pnpm qc <slug> [lang]` | Writes `qc/report.md` and `qc/sheet.png`, and exits 1 on failure |
| `pnpm tts <slug> <lang> --fit en --model <model> [--fresh]` | Voices another language into the English picture: `voice.mp3`, `subs.vtt`, `timing.json` and `strings.json` in `public/generated/<slug>/<lang>/` |
| `pnpm youtube <slug>` | Writes the lesson's `youtube/` folder (and `video.mp4` plus a full copy of it into `media/`): per-language `metadata.md` (from the lesson's `video/youtube.json`), `subtitles.vtt`, `audio.mp3`, `timing.json`, `strings.json`, the site dub `site.mp3`, the thumbnail backgrounds, and `upload-notes.md`. It stops when English was re-voiced after the last render, or when a committed language is missing from the cache |
| `pnpm thumbnail-bg <slug> [--variants 2]` | Generates thumbnail backgrounds with `gpt-image-2` from `youtube.json` `thumbnail.background` (the motif; the house style is added), cropped to 1280×720 as `public/generated/<slug>/thumbnail-bg-<n>.png`, numbered after the cache and `youtube/thumbnail-src/` together, so a chosen background is never overwritten, and mirrored into `thumbnail-src/`. Reads only `OPENAI_API_KEY`, from the environment, the repo `.env.local` or `~/.claude/.env` |
| `pnpm video:restore <slug> [--force]` | Rebuilds `public/generated/<slug>/` from the lesson's `youtube/` folder (a fresh clone, or a wiped cache) |
| `pnpm outro [lang …]` | Renders the `dummy` fixture once (English) and cuts the outro scene's frames into the silent picture `media/shared/outro/outro.mp4`, and each language's voice over the same range (from `public/generated/dummy/<lang>/voice.mp3`) into `content/shared/outro/outro.<lang>.mp3` (default: en and vi) |
| `pnpm final <slug> [lang …]` | Writes `media/.../youtube/final/video.<lang>.mp4`: that language's render (its picture and voice) with its subtitles as a soft, toggleable `mov_text` track, for sharing outside YouTube (stream copy, seconds). Needs the system ffmpeg and the language's render (`pnpm render <slug> <lang>`); stops when the render is older than the committed voice. Default languages: en plus every voiced language whose render exists and is not older than the English one; the others are named and skipped |
| `pnpm thumbnail <slug> [--lines "A\|B\|C"] [--code <text>] [--bg <file>] [--out <name>] [--pick <n>]` | Renders a 1280×720 thumbnail per background to `out/<slug>/thumbnail-<n>.png` (or `thumbnail.png` over plain paper when there is none; `--bg` is a path under `public/`): Inko points at the stacked title lines (from `thumbnail.lines`), with an optional code chip. Keep the words language-neutral. `--pick <n>` also keeps variant n as `youtube/thumbnail.png` |
| `pnpm studio` | Opens Remotion Studio for live scene work |
| `pnpm test` / `pnpm typecheck` | Runs the unit tests and tsc |

## Adding a language

There is **one picture for every language**. English is the master: it sets each
scene's length and every cue. Another language ships only its own voice file and
subtitle file, which go next to the same `video.mp4` (for example, as YouTube audio
tracks and captions).

1. **Translate.** Write `script.en.md` as `script.<lang>.md`.
   - Keep the same scenes, in the same order; `pnpm video:lint` enforces this.
   - Cues are optional and ignored: the picture follows the English cues.
   - Keep it about as long as the English. Each scene may run at most 1.2× faster than natural speech to fit, so aim for roughly the same spoken length per scene.
   - There is no `strings.<lang>.json`: the picture is shared.
2. **Voice.** Run `pnpm tts <slug> <lang> --fit en --voice <id> --model <model>`. Lesson 1's Vietnamese uses the course voice, Jessica (`cgSgspJ2msm6clMCkdW9`), on `eleven_v4`.
   - Each scene is voiced, sped up only if needed (≤ 1.2×), and padded to the English scene's exact length.
   - If a scene is too long, the run stops and says how much to cut. Takes stay cached, so only edited scenes are re-voiced.
   - It also warns when a scene's speech fills less than 85% of it, because the scene's last visuals would then play ahead of the voice.
   - `--model` is required for ElevenLabs, because the default model is English-first and has no Vietnamese.
   - Output: `public/generated/<slug>/<lang>/{voice.mp3, subs.vtt, timing.json, strings.json}`.
3. **Package.** Run `pnpm youtube <slug>`. It writes the lesson's `youtube/` folder and the upload kit in `media/` (see above):
   - `media/.../video.mp4`: the English render. Upload it once.
   - `languages/<lang>/subtitles.vtt` for every language: Studio → Languages → add subtitles. Any channel can do this. Upload ours rather than relying on auto-translated captions: ours follow the dub's own timing.
   - `languages/<lang>/audio.mp3` for each fitted language: Studio → Languages → Dub. This needs multi-language audio, which YouTube opens to channels gradually. It lasts as long as the video to within a few milliseconds.
   - `languages/<lang>/metadata.md`: that language's title and description, ready to paste.
   - `languages/<lang>/site.mp3`, the **site dub** (mono 64 kbps, about 2.5 MB). Commit it; the build copies it to `public/videos/`.
4. **Page.** Add `"<slug>": { youtube: "<id>", dubs: ["vi"] }` to `content/lesson-videos.ts`.
   - The lesson page shows a click-to-load player (nothing loads from YouTube before play), with an **Audio: English | Tiếng Việt** switch under it.
   - A dub plays from the site dub file, following the muted YouTube player: play, pause, seek, speed, volume, and re-sync whenever the drift exceeds 0.25 s.
   - Each page starts with its own language when a dub exists.
   - Inko's mouth follows the English, because the picture is shared.

**Voices and models:** ElevenLabs' default `eleven_multilingual_v2` has no Vietnamese. Use `eleven_v4`, or `eleven_v4_turbo`, `eleven_flash_v2_5` or `eleven_turbo_v2_5` at half the character cost. Library voices (such as Giang) need a paid ElevenLabs plan.

## YouTube metadata: `video/youtube.json`

Each lesson keeps its YouTube text next to its script, in
`content/lessons/<track>/<slug>/video/youtube.json`. `pnpm youtube` turns it into one
`youtube/languages/<lang>/metadata.md` per language, the copy to paste into Studio:
- the title and description of that language (chapters timed from the English timing, per-locale lesson links);
- English also holds the tags and one block per quiz, with its Studio time and each field ready to paste;
- the language-neutral steps (end screen, `outroAt`) go to `youtube/upload-notes.md`.

Edit the json, never the generated file. Re-voicing moves every time automatically.

| Field | Content |
|---|---|
| `title`, `summary`, `lessonLink`, `series` | `{ en, vi }` strings (title ≤ 100 chars) |
| `bullets` | `{ en: [...], vi: [...] }` for the "In this video" list |
| `tags`, `hashtags` | lists (tags ≤ 500 chars in all) |
| `chapters` | one `{ en, vi }` title per scene id; every scene needs one, and each must last ≥ 10 s |
| `quizzes` | `{ at, question (≤ 100), answers (2–4), correct (index), explanation }` |
| `thumbnail` | `{ lines, code?, background? }` |

**Quiz anchors (`at`):**
- `"<scene>:end"` is the last second before that scene's cut.
- `"<scene>.<cue>"` is the cue's second. Put a cue at the start of the sentence after the quiz's topic.

The validator runs before anything is written. It rejects:
- unknown scenes or cues;
- missing or empty chapter titles, and fewer than 3 chapters;
- malformed quizzes and bad answer indices;
- `<` and `>`, which Studio refuses;
- text over YouTube's limits. Studio's quiz field reads `minutes:seconds:frames`, so times are emitted as `m:ss:00`.


## Pilot log: lesson 1, `cartesian-and-uv-space` (2026-09-30)

| Item | Result |
|---|---|
| Length | 4:12, 7 scenes, about 640 spoken words |
| Voice | ElevenLabs Jessica, `eleven_multilingual_v2` |
| TTS characters | about 5,700 in total: 1,965 to audition 3 voices on scenes 1–2; 2,634 for the full lesson (the chosen voice's scenes 1–2 came from the cache); 1,134 to re-voice 2 scenes after review |
| Render | about 1.5–1.75 min for the full 4:11 video on this machine |
| QC | 2 s. It caught a 1.8 s empty start and a 4 s still stretch in one scene, both fixed before the final |
| Checkpoints | script (approved as drafted), voice (Jessica), first minute (approved; decided "one picture for all languages"), final (approved) |
| Review | caught a wrong claim carried over from the lesson ("normals point inward" after a handedness mix-up; the model comes out mirrored). The script and both theory files were fixed, and 2 scenes re-voiced |
| Not yet proven | Fish Audio: the live call returned 402 (no API credit), so the "re-voice with the other engine, zero scene edits" check is still open |
| Vietnamese (2026-10-01) | `script.vi.md` fitted to the English picture, voiced by Jessica on `eleven_v4`: 3,257 chars, no speed-up needed, speech fills 84–96% of each scene, −16.6 LUFS. An earlier take with Giang cost 3,248 chars. The English was re-voiced with `--fresh` on the Starter plan for commercial rights (3,314 chars), and the video re-rendered |

**Cost note:** the ElevenLabs free tier gives 10,000 characters a month, which is
two to three lessons of this length, fewer with voice auditions or re-voicing. It is also non-commercial and requires
attribution. Fish Audio needs API credit, which is separate from its web credit.

## Pilot log: lesson 2, `vector-basics` (2026-10-01)

| Item | Result |
|---|---|
| Length | 5:04, 9 scenes, 738 spoken words; a game through-line (diagonal-speed race, slime chase, NaN poof) |
| Voice | Jessica: English on `eleven_multilingual_v2`, Vietnamese on `eleven_v4` fitted with `--fit en` |
| TTS characters | 8,213 in total: 3,967 English, 3,870 Vietnamese, and 376 to re-voice one Vietnamese scene that filled only 84%. Adding cues later cost nothing (cache) |
| New kit | `kit/grid.tsx` (`GridSpace`, `toStage`, `Grid`, `Vector`) for vector diagrams in world units; the `slime` palette role |
| QC | passed on every full render; the only warnings are 4 subtitles reading at 17–18 chars/s |
| Checkpoints | script EN + VI (approved), the first 1:34 (approved), final (approved; thumbnail variant 2) |
| Review | the on-screen math was right except one arrow label. Three reveals ran 3–5 s ahead of the words, fixed with extra cues before the Vietnamese voicing, because the dub inherits the English cues |
| Automation | `youtube.json` drove the titles, descriptions, 9 chapters and 8 Studio quizzes with no manual time edits; `pnpm thumbnail-bg` made the backgrounds (first real run) |
