---
title: Learning Science for Technical Curriculum Chunking
date: 2026-08-13
tags: [learning-design, cognitive-load, curriculum-structure]
---

# Learning Science Principles for Chunking 3D Graphics Curriculum

## Cognitive Load Theory (Sweller)
Working memory capacity: ~4±1 chunks. Cognitive load = intrinsic (inherent complexity) + extraneous (poor design) + germane (schema building). For high-element-interactivity topics (matrix math, WebGL state management, shader compilation), intrinsic load dominates—design can only reduce extraneous load. **Key implication:** Don't assume microlearning fixes overload; it doesn't reduce intrinsic load.

## Microlearning vs Deep Work
Microlearning (2–5 min snippets) excels for compliance, recall, procedural drills. **Fails** for high element-interactivity content: shaders, matrix transformations, rendering pipeline require sustained 15–45 min deep work sessions. Surface engagement ≠ mastery. Integration: use microlearning for *reviews* via SRS, reserve core lessons for immersive blocks. [Lemonlearning, ResearchGate 2024-2025]

## Mastery Learning & Prerequisites (Bloom)
Hierarchical: learners must reach ~90% mastery on prerequisites before advancing. No free progression. **For graphics:** linear algebra → graphics math → WebGL APIs → shader writing. Weak foundations cascade. Completion gates work if threshold is clear; free-choice progression causes overwhelm. [Structural Learning]

## Worked Examples & Faded Scaffolding
Worked examples reduce cognitive load vs pure problem-solving. Fading removes steps gradually; 3-stage fade (full example → partial code → blank template) balances support and challenge. Metacognitive scaffolding (reflection prompts) boosts problem-solving. **Lesson structure:** theory + worked example + faded exercise + independent project. [Springer, ACM, Wiley 2025]

## Spacing & Interleaving
Spacing effect: distributed repetitions 2× more efficient than massing. SRS-driven review distributes practice, allowing lessons to stay concise. Interleaving forces discrimination (mixing topics e.g., matrix ops + quaternions in one session). Blocks (e.g., "all linear algebra") initially feel easier but produce surface learning. **Architecture:** lessons 15–45 min; SRS queue handles distributed review; optional interleaved mini-projects.

## Spiral Curriculum (Bruner)
Revisit topics at increasing depth: basics → applications → generalizations. Each cycle adds complexity, not repetition. Risk: weak first encounter derails later cycles. **For 3D:** angles (degrees/radians) → trigonometry → transforms → rotation matrices → quaternions. Prerequisite mastery gates essential. [Structural Learning, EBSCO]

## Progress Mechanics & Motivation
Overwhelm from >100 lessons without structure. **Solution:** progress bars, module counts (e.g., 13 tracks of 10 lessons vs 131 flat lessons), visible achievement badges. Self-paced solo learners lose momentum without milestones. Daily goals ("finish 1 module") beat abstract progress. [AccessAlly, NGLC]

---

## PRACTICAL HEURISTICS

### Lesson Granularity
- **1 lesson = 1 mental model or atomic skill.** E.g., "rotation matrices" ≠ "matrix multiplication" (split). "Vector dot product" ≠ "vector cross product" (might merge if <10 min total).
- **High element-interactivity threshold:** 15–45 min per lesson. Shaders, matrix composition, state-management topics. Don't split below 12 min cognitive baseline.
- **Low element-interactivity:** 5–15 min OK. Definitions, notation, single formula derivation, GIF explanation.

### Module Structure
- **Ideal lessons/module:** 8–12 (not 3, not 20). Avoids "100+ lessons" overwhelm; granular enough for mastery gates.
- **Track = 10–14 modules** (e.g., "Linear Algebra Foundations" = 10 modules × 10 lessons ≈ 100 min material + spaced review).
- **Total curriculum:** 13–16 tracks max. Renders as "13 major stages" to learner (digestible); hides 130–160 lessons.

### When to Split vs Merge
**Split a lesson if:**
- Dual prerequisites → learners skip one accidentally (e.g., "matrix + OpenGL context" → 2 lessons).
- Intrinsic load jumps (e.g., "rotation matrices" + "gimbal lock" = split; gimbal lock is secondary depth).
- Exercise requires both → feedback loop slows 1 tight lesson.

**Merge topics if:**
- <8 min per topic, and logically atomic (e.g., dot + cross products in same 20 min lesson, differentiate in exercises).
- Same worked example illustrates both.

### Lesson Internal Structure
1. **Intro (1–2 min):** anchor to prior knowledge ("in the last lesson, vectors...").
2. **Worked example (3–8 min):** live demo, step-by-step derivation, show failure modes.
3. **Interactive exercise (5–10 min, high-interactivity) or micro-drill (1–3 min, low-interactivity):** faded scaffolding.
4. **Project/application (optional, 15–30 min):** real WebGL/shader code. Links to track capstone.

### Spacing & Review
- **First review:** 1–3 days (before working memory decay).
- **SRS queue:** 8–12 cards per lesson. Formative quizzes, not high-stakes.
- **Lesson doesn't carry spaced review.** Offload to SRS; keeps lessons short.

### Badge Mechanics & Visibility
- **Show track progress:** "4 / 13 tracks" (global), "8 / 10 modules" (track-level).
- **Lesson badges:** optional-depth ("advanced shader optimization") separated from required ("basic GLSL syntax"). Badges don't gate progression.
- **Misconception flags:** if pre-test reveals weak foundation, surface 1-min review link (not full re-lesson).

### Prerequisites & Gates
- **Hard gates:** mastery threshold (~90%) before unlock. Use for critical sequencing (algebra before calculus).
- **Soft gates:** visible prerequisite card, learner can skip with warning. For nice-to-know but not critical (e.g., "quaternion history").
- **Gate tests:** 5–10 items, formative not high-stakes; retry unlimited; SRS tracks long-term retention.

### Escalation Rule
- **If >3 gate retries:** trigger "this foundation is weak" diagnostic; surface 1-min refresher or alternate explanation, not full re-lesson.

### Reconcile with SRS
- Lesson assumes **no prior deep working-memory load from yesterday's SRS cards.** SRS runs parallel, spaced days apart.
- Single day's SRS cards <5 min total; never competes with lesson focus.

---

## Unresolved Questions
- Optimal gate mastery threshold: 80% vs 90% vs adaptive? Varies by topic criticality.
- Interleaving frequency: daily micro-interleaves or weekly project-based? Depends on learner pace.
- Worked-example quality ceiling: when does fading cause more confusion than scaffolding helps?

---

## Sources
- [Cognitive Load Theory: Research Overview — NSW Education](https://education.nsw.gov.au/content/dam/main-education/about-us/educational-data/cese/2017-cognitive-load-theory.pdf)
- [Paas & van Merriënboer (2020) — Cognitive Load Management, Perspective on Psychological Science](https://journals.sagepub.com/doi/10.1177/0963721420922183)
- [Lemon Learning — CLT Types & Principles](https://lemonlearning.com/blog/cognitive-load-theory-types-and-principles-for-reduction)
- [ResearchGate — Microlearning Effectiveness 2024](https://www.researchgate.net/publication/381080879_Exploring_learner_satisfaction_and_the_effectiveness_of_microlearning_in_higher_education)
- [Structural Learning — Mastery Learning & Bloom](https://www.structural-learning.com/post/mastery-learning)
- [Springer/Wiley (2025) — Faded Worked Examples for Programming](https://onlinelibrary.wiley.com/doi/10.1111/jcal.70012)
- [ACM — Fading Worked Examples](https://dl.acm.org/doi/abs/10.1145/1288580.1288594)
- [Gwern — Spaced Repetition](https://gwern.net/spaced-repetition)
- [ERIC — Spacing to Enhance Learning](https://files.eric.ed.gov/fulltext/ED536925.pdf)
- [Structural Learning — Spiral Curriculum](https://www.structural-learning.com/post/the-spiral-curriculum-a-teachers-guide)
- [AccessAlly — Progress Visibility & Motivation](https://accessally.com/blog/why-students-need-to-see-their-own-progress)
- [NGLC — Self-Paced Learning & Learner Agency](https://www.nextgenlearning.org/articles/self-paced-learning-empowers-every-student)
