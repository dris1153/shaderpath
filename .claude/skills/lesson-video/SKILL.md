---
name: lesson-video
description: "Make the explainer video for one lesson (Remotion, Inko the octopus) at the quality of lessons 1-3: script, voices, scenes, qc, Vietnamese dub, YouTube kit, thumbnail. Use when asked to make, continue or resume a lesson video."
argument-hint: "<lesson-slug>"
---

# Lesson video: `/lesson-video <slug>`

Makes the 3-5 minute video of one lesson, from script to the upload kit, at the same quality, motion
and content standard as `cartesian-and-uv-space`, `vector-basics` and `dot-and-cross-products`.
This skill only orders the work and lists the hard rules. The how-to lives in the docs below:
read them, do not rely on memory.

Replies to the user are in Vietnamese and short; code, comments, strings and commit messages are English.

## 0. Read first, in this order

1. `video/README.md`: Workflow for one lesson, Script format, Scene rules, Adding a language, YouTube metadata, Outro, Commands.
2. `video/src/kit/STYLE.md` (style, safe areas, motion, Inko) and `docs/rule-render-video.md` (every mistake already paid for).
3. `docs/journals/` (newest first): decisions and surprises of the earlier lessons.
4. The reference lesson `vector-basics`, the standard to match: `video/src/lessons/vector-basics/` (STORYBOARD.md, scene files, `index.tsx`) and `content/lessons/00-math/vector-basics/video/{script.en.md,script.vi.md,strings.en.json,youtube.json}`.
5. The target lesson's content, which the script must never contradict: `content/lessons/<track>/<slug>/{theory.en.mdx,review-cards.ts,exercises.ts}`. Find the track with `ls content/lessons/*/<slug>`; the curriculum order is `content/slugs.ts`.

## 1. Plan and resume

- Look for `plans/*-<slug>-video/`. If it exists, read it and continue at the first unfinished phase: never restart finished steps.
- If not, create `plans/<yymmdd>-<hhmm>-<slug>-video/` with `plan.md` and one short phase file per step below (status per phase), and keep the statuses current. The plan is the memory across sessions and context compaction.

## 2. Steps (each ends in a check)

0. **Preflight.** Clean `git status`; `pnpm install` done in the repo root and in `video/`; a full ffmpeg on `PATH` (Windows: `winget install Gyan.FFmpeg`; a bash shell may need its `bin` folder added by hand); `ELEVENLABS_API_KEY` (and `OPENAI_API_KEY` for backgrounds) present in the repo-root `.env.local`: check by name only, never print a value.
1. **Script.** `content/.../video/script.en.md` with `outro: true` in the front matter, 5-8 scenes, 420-700 words, `strings.en.json`, then `pnpm video:lint <slug>`. Follow the narration rules in `docs/rule-render-video.md` (tuples read as one sentence) and the text rules (`{a}` arrows on vectors, `√{x}` radicals, `*` for plain products, `·`/`×` only between vectors).
   **CHECKPOINT 1:** user approves the full text, the scene list and the length.
2. **English voice.** Probe the TTS cache offline (hash of the engine setup and the text, as `video/scripts/tts.ts` does), state the number of characters that would be sent, and ask before running `pnpm tts <slug> en`. Cue edits never re-voice.
3. **Storyboard.** `video/src/lessons/<slug>/STORYBOARD.md` (hero, what appears on which cue, the motion, the tail hold); add `{cue}` markers to the script as needed.
4. **Scenes 1-2.** Build from the kit primitives and Inko (no new look: match the reference lesson), register in `video/src/lessons/index.ts`, `pnpm render <slug>`, `pnpm stills <slug> en <frames>`, look at the pictures yourself first.
   **CHECKPOINT 2:** user judges look, pace and Inko's acting on the first minute. Kit and style change here, not later.
5. **The rest.** Remaining scenes, render, `pnpm qc <slug>` until PASS, read `qc/sheet.png`; stills of every scene with text or arrows. Capture baseline stills of an untouched lesson BEFORE any kit edit and `cmp` them after.
6. **Vietnamese.** `script.vi.md` (same scenes, about the same length), `pnpm video:lint`, probe + state characters + ask, then `pnpm tts <slug> vi --fit en --voice cgSgspJ2msm6clMCkdW9 --model eleven_v4`.
7. **Package.** `youtube.json` (every scene needs a chapter of at least 10 s; thumbnail lines use the same markers), `pnpm thumbnail-bg <slug>` (state the image count, ask), `pnpm thumbnail <slug>`, show the variants and `--pick <n>`, `pnpm youtube <slug>`, `pnpm final <slug>`. Check `upload-notes.md` (end screen window, `outroAt`) and that `metadata.md` has the chapters.
   **CHECKPOINT 3:** user reviews `final/video.*.mp4`, `qc/sheet.png`, the thumbnail, `metadata.md` and `upload-notes.md`.
8. **Commit** only when the user asks: focused commits (lesson source + scenes; the lesson's `youtube/` folder; docs), explicit paths, conventional messages without AI references. Never `git add -A`; never push.
9. **Hand-off.** The user uploads `media/lessons/<track>/<slug>/youtube/video.mp4`, sets the end screen and the languages per `upload-notes.md`, and sends the YouTube id. Then add `"<slug>": { youtube: "<id>", dubs: ["vi"], outroAt: <n> }` to `content/lesson-videos.ts` in ONE commit and tell the user to push (never push the id before the dub files and `outroAt` are in).

## 3. Hard rules

- **Money.** Before every `pnpm tts`, `pnpm thumbnail-bg` or any paid API call: probe the cache offline, state characters or images, wait for a yes. Never run `pnpm tts` on a lesson that already has a voice without a reason.
- **Secrets.** Never print, echo, quote or commit a key. Do not touch `.env.example`.
- **Git.** Explicit paths only; no push; no commit without being asked; CRLF-only changes are noise (`git diff --ignore-space-at-eol --numstat`), revert them.
- **Cache vs content.** The render reads `video/public/generated/`, not `content/`. `media/` is a derived copy: edit `content/`, then rerun the command.
- **Quality bar.** `pnpm qc` PASS, subtitles within budget, nothing static over 3 s, every scene ends on a calm hold, no scene reveal ahead of its words. If the picture is not as good as `vector-basics`, say so instead of shipping it.
- **Verify with pictures.** Look at stills before spending render time; after kit edits compare baseline stills byte for byte.
- **Delegate checks.** After code or scene work run `tester` and `code-reviewer` with isolated prompts that never include keys; apply valid cheap findings.
- **Windows shell.** PowerShell shows pnpm stderr as an error even on success: trust the exit code. In bash text with `\n` can be mangled: use the Write/Edit tools for source files.
- **Docs follow the work.** A new rule or surprise goes into `docs/rule-render-video.md` (or STYLE.md), not into this skill.

## 4. Done when

- [ ] Both languages voiced, `pnpm qc <slug>` PASS, `pnpm final <slug>` built for en and vi.
- [ ] `content/.../youtube/` complete: thumbnail, `upload-notes.md`, `languages/{en,vi}/*`; `media/.../video.mp4` exists.
- [ ] `pnpm test` and `pnpm typecheck` pass in `video/`; the three checkpoints approved.
- [ ] Plan statuses current; commits made only on request; nothing pushed; upload steps handed to the user.
