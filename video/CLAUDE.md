# Lesson videos (Remotion)

This package makes the lesson explainer videos. Before changing anything here read:

- `README.md`: setup, workflow, script format, commands, YouTube metadata, the shared outro.
- `src/kit/STYLE.md`: style guide, safe areas, motion, Inko.
- `../docs/rule-render-video.md`: rules learned the hard way (strings cache, text markers, resolution, outro, Windows).

To make the video of a new lesson, run `/lesson-video <slug>` (skill in `../.claude/skills/lesson-video/`).
It keeps one plan per lesson in `../plans/`, stops at three checkpoints, and asks before any paid TTS or image call.

Never commit videos, `../media/`, `out/` or `public/generated/` (the generated files of the `dummy` and `style` fixtures are tracked on purpose).
