# Shared Outro Clip and Description Trim

**Date**: 2026-10-06  
**Severity**: Medium  
**Component**: video (outro join, voice mix, YouTube metadata), content/shared/outro, video/scripts/outro-join.ts  
**Status**: Pending user upload and site wiring

## Summary

Moved the shared outro from a scene baked into each lesson to a standalone clip asset joined at packaging time. The outro lives in `content/shared/outro/` as a 4.5 MB silent mp4 (plus voice/vtt per language and outro.json), with its own fixture lesson. The outro flag `outro: true` now routes to clip assembly instead of scene composition. Also removed lesson count, subtitle list, dub note, and ElevenLabs credit from YouTube descriptions per user edit.

## What Changed

**Commits:**
- `daaa88c`: clip assets in content/shared/outro (2560x1440 mp4, voice.mp3, subtitles.vtt per language, outro.json)
- `900ea6c`: join module and scene mechanism removed; outro.ts collects join operations
- `5487858`: lessons 2, 3, and dummy rebuilt with joined outro
- `8dba5ea`: docs on shared outro clip and how to change it
- `bc3c406`: drop subtitle list, dub note, AI-voice credit, lesson count from description
- `9a9dbf7`: regenerate six metadata.md without trimmed lines

**Files:**
- `video/src/lessons/outro/`: fixture lesson (timing, words, vtt, mp3 stream copy only; no TTS spend)
- `video/scripts/outro-join.ts`, `outro-clip.ts`, `voice-args.ts`: join orchestration
- `video/scripts/youtube-meta.ts COPY/description()`: description trim rule baked in
- `content/shared/outro/`: asset home

## Decisions

- **One mechanism:** Outro is an asset, not a scene. Clip + voice + subs joined per lesson at package time. Code path: ffmpeg concat-demuxer (stream copy, frame-exact via per-frame md5), voice parts cut to sample count and mixed with loudnorm, subs shifted and clamped.
- **Git exception:** Pushed one 4.5 MB mp4 into `content/shared/outro/video.mp4` with negation in .gitignore; user accepted ~30 MB git churn from regenerated metadata.
- **Description strip:** Removed lesson count, subtitle list, vi dub note, ElevenLabs credit (generator rule, not hand-edit each). User hand-edited media copy; vector-basics en matched exactly after regenerate.
- **Dummy rebuild:** No TTS cache on fresh clone. Cut dummy offline (timing, words, vtt, mp3 stream copy from outro). Offline cache-key probe (zero provider spend) tells hits from misses.

## Surprises and Fixes

**Frame identity myth:** Standalone outro (PSNR 19–25 dB vs. baked) is NOT pixel-identical because Inko's ambient motion runs on the absolute lesson frame, not relative. Acceptance changed from "same as before" to "vs. its own lossless 2x still" (39–43 dB) plus md5 comparison to source parts.

**Remotion ffmpeg gap:** Bundled ffmpeg has no pcm_f32le encoder. A reviewer suggestion was tried and reverted.

**Wrong outro voice committed:** The dummy take (quieter) was in the committed voice.mp3; the lesson take lived in the TTS cache by text (0 characters spent). Fixed in rebuild.

**Shell tool heredoc trap:** Backslash sequences in heredocs and `node -e` were collapsed by the tool layer into real newlines in source. Any text with `\n` must use Write/Edit, not heredoc echo.

**Tester and reviewer caught:** stale English clip on `pnpm outro vi`, no double-outro guard in final.ts, misleading missing-mp4 error, noisy restore warning — all fixed before rebuild.

## Acceptance Result

- 9757/9760 frames match commit; upload-notes and chapters byte-identical (outroAt 310, end screen 5:16 for 9 s)
- Subtitles at most 1 ms off; voice onset at seam identical to clip
- One overshoot: vector-basics vi joined voice 0.3 LU louder than before (tolerance 0.2; within QC −16 ±2)
- Phases approved one by one; focused commits with explicit paths, nothing pushed yet

## Open Items

- **Upload and wire:** User will upload vector-basics video from media/lessons/00-math/vector-basics/youtube/video.mp4, then commit new id + outroAt 310 to content/lesson-videos.ts in one commit, then push.
- **Dot-and-cross-products:** Not on site yet (needs outroAt 310 in same commit).
- **Vietnamese narration:** Passages not yet listened to.
- **Cache refresh command:** No utility to refresh video/public/generated/<slug>/<lang>/strings.json without TTS spend; manual JSON write works (used here).

**Status:** DONE. Outro decoupled from scenes, clip assembly at package time, description trim rule merged.
