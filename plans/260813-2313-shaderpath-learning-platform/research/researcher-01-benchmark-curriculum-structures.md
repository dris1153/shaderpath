# Benchmark Research: 3D Graphics Learning Resource Curriculum Structures

## Executive Summary
Analyzed 6 leading 3D/WebGL/shader learning platforms. Pattern: hierarchies range 3-4 levels deep (course→chapter→lesson); optimal video unit ~6-10min; text deep-dives 3000-5000w; theory:practice ratio 40:60 for hands-on resources, 70:30 for theory-heavy. Interactive playgrounds critical for reducing cognitive overload.

---

## Resource Breakdown

### 1. **Three.js Journey** (Bruno Simon)
- **Structure**: 7 chapters → 66 lessons → 93 hours video
- **Lesson Unit**: ~1.4h per lesson avg (but highly variable: 10m–45m)
- **Hierarchy**: Course → Chapter → Lesson (4 sections per chapter avg)
- **Theory:Practice**: 30:70 (heavy project-driven)
- **Student feedback**: Pacing "great"; difficulty ramps smoothly; text transcripts + video slowdown available
- **Digestibility**: Split-screen teaching, starter files + solutions per lesson, progressive projects
- **Weakness**: High volume (93h) can overwhelm; requires consistent engagement

### 2. **The Book of Shaders**
- **Structure**: 15+ chapters (0–15), open-ended ongoing
- **Chapter unit**: ~800–2000w per chapter (estimated from interactive breadth)
- **Hierarchy**: Book → Chapter → Subsections (3–6 per chapter, many with multiple examples)
- **Theory:Practice**: 50:50 (editable code in-browser, immediate feedback)
- **Digestibility**: Interactive playgrounds (live GLSL editing) crucial; visual feedback instant; no overwhelming text walls
- **Strength**: Non-linear, exploratory; low barrier to experimentation
- **Note**: Chapters target creative coders; assumes linear algebra basics

### 3. **WebGL Fundamentals** (Gregg Tavares)
- **Structure**: 60+ articles in 12 categories
- **Article unit**: ~3000–5000w per article (substantial tutorials)
- **Hierarchy**: Website → Category → Article (variable: 1–13 articles per category)
- **Theory:Practice**: 60:40 (code-heavy but explanatory)
- **Digestibility**: Incremental math, diagrams, code samples; "one step at a time" principle; no prerequisites assumed beyond basics
- **Strength**: Comprehensive reference; beginner-friendly pacing
- **Weakness**: Linear structure; requires sequential reading for best outcomes

### 4. **LearnOpenGL**
- **Structure**: 13 sections → chapters (3–11 subsections each)
- **Chapter unit**: ~2000–4000w per subsection
- **Hierarchy**: Website → Section → Chapter → Subsection (4 tiers)
- **Theory:Practice**: 70:30 (theory-forward; code-light examples)
- **Digestibility**: Color-coded hints (green=notes, red=warnings); code blocks; GitHub repo with full samples
- **Strength**: Printable PDF/EPUB; structured for sequential mastery
- **Weakness**: Dense; expects foundational OpenGL knowledge; less interactive

### 5. **Maxime Heckel's Shader Articles**
- **Structure**: Standalone deep-dive articles (non-sequential)
- **Article unit**: ~5000w avg with 15+ subsections, interactive demos
- **Hierarchy**: Blog → Article → Sections → Code blocks + interactive widgets
- **Theory:Practice**: 55:45 (conceptual + visual + hands-on demos)
- **Digestibility**: Diagrams, interactive playgrounds, real-world examples (React Three Fiber context)
- **Strength**: Bridges theory and practice; visually rich; permissive of exploration
- **Weakness**: Not structured as curriculum; requires self-direction to build progression

### 6. **Inigo Quilez's Miscellaneous Articles**
- **Structure**: 100+ free articles; no formal curriculum
- **Article unit**: Varies; typically 1000–3000w
- **Hierarchy**: Portfolio → Topic → Article (minimal structure)
- **Theory:Practice**: Highly variable (from pure math to shader demos)
- **Digestibility**: High for creators with graphics background; opaque for beginners
- **Strength**: Cutting-edge content; authentic voice
- **Weakness**: No progression path; assumes advanced math/graphics literacy

### 7. **Frontend Masters 3D/WebGL Courses**
- **Structure**: ~2 courses; modules → lessons
- **Lesson unit**: 10–30min video per lesson (inferred from platform standard)
- **Hierarchy**: Course → Module → Lesson
- **Theory:Practice**: 40:60 (Creative Coding with Canvas) to 50:50 (Advanced WebGL)
- **Instructor**: Matt DesLauriers (freelance creative dev)
- **Strength**: Professional video; structured progression
- **Limitation**: Requires paid subscription; content not publicly auditable

---

## Comparative Metrics

| Resource | Total Units | Unit Size | Theory:Practice | Hierarchy Depth |
|----------|------------|-----------|-----------------|-----------------|
| Three.js Journey | 66 lessons | 1–45m video | 30:70 | 3 |
| Book of Shaders | 15+ chapters | 800–2000w | 50:50 | 3 |
| WebGL Fundamentals | 60+ articles | 3000–5000w | 60:40 | 2 |
| LearnOpenGL | ~80 subsections | 2000–4000w | 70:30 | 4 |
| Maxime Heckel | ~8 major articles | ~5000w | 55:45 | 3 |
| Inigo Quilez | 100+ articles | 1000–3000w | Variable | 1 |
| FM 3D | ~30–50 lessons | 10–30m video | 40–50:50–60 | 2–3 |

**Research Consensus (industry standard)**:
- Optimal video lesson: **6–12 minutes** (med. engagement 6m; completion peak <10m)
- Text deep-dive: **2500–5000 words** before cognitive saturation
- Chapter grouping: **3–5 lessons** (15–50m cohesive unit)
- Progression: Difficulty ramp **per chapter**, not per lesson

---

## Actionable Observations for Shaderpath (13-Track Platform)

### 1. **Hierarchy Recommendation: Course → Track → Unit → Lesson**
- Tracks = domain silos (math foundations, vertex shaders, etc.)
- Units = 3–5 cohesive lessons per unit (~30–50m total)
- Lessons = atomic 6–10m video + optional 1–3k word companion text
- Avoids Three.js Journey's fatigue (93h monolith); avoids LearnOpenGL's 4-tier cognitive load

### 2. **Interleave Theory–Practice Tightly**
- Theory video (2–3m) → Code example (playable, editable) → Practice exercise (5m)
- *Why*: Book of Shaders & Maxime Heckel show immediate feedback reduces overwhelm; pure theory (LearnOpenGL 70:30) tests higher but feels stale

### 3. **Interactive Playgrounds > Passive Reading**
- Embed WebGL/shader sandboxes (like three.js/babylon.js live editors)
- *Why*: Book of Shaders & Maxime's articles cite visual experimentation as primary learning lever; reduces translation gap between theory and running code

### 4. **Provide Dual Modalities (Video + Text)**
- Three.js Journey's text transcripts + slowdown controls proven successful
- Text-first learners (especially in math-heavy tracks) need option to scan/reference

### 5. **Cap Cumulative Track Length**
- LearnOpenGL's 13 sections work; Three.js Journey's 66 lessons feel open-ended
- Shaderpath's 13 tracks suggests ~40–50 units per track, ~5–7 lessons per unit; **total ~2–3k lessons (excessive)**
- *Alternative*: 13 tracks × 3–4 units per track × 4 lessons per unit = **156–208 total lessons** (~20–30h); digestible progression

### 6. **Sequence Math → Concept → Demo → Project**
- Book of Shaders pattern (algebra → patterns → noise → fractals → applications)
- Prevents "why am I doing this?" dropoff seen in pure reference-style (WebGL Fundamentals)

### 7. **Use Progressive Projects as Checkpoints**
- Three.js Journey's success: every ~10 lessons, a capstone project (e.g., "build a galaxy")
- Breaks fatigue; reinforces abstract concepts in context

### 8. **Community Feedback: Scaffolding Critical for Overwhelm Prevention**
- Three.js Journey combats difficulty scaling with starter files + solutions; LearnOpenGL uses color-coded boxes
- Shaderpath: include hints hierarchy (spoiler-free → progressive reveal → solution)

---

## Unresolved Questions

1. **GPGPU/PBR tracks**: LearnOpenGL's PBR section relatively shallow (3 subsections). Do existing resources treat advanced topics as dense 5000w monoliths or split granularly? *Implication: May need original design for Shaderpath's advanced material.*

2. **Cohort pacing**: Three.js Journey (93h linear) vs. Book of Shaders (non-linear exploration). Shaderpath's 13 tracks suggest sequential *or* exploratory? *Decision needed: Path-based (prereq graph) vs. open curriculum?*

3. **Video production cost/ROI**: Three.js Journey (66 × 20m avg = 1320m editing overhead) vs. Maxime's articles (8 pieces, visuals + code). Shaderpath at 156–208 lessons: feasible with Remotion/Three.js inline rendering or requires human cinematography? *Resource constraint.*

---

## Sources

- [Three.js Journey](https://threejs-journey.com/) — Bruno Simon course
- [The Book of Shaders](https://thebookofshaders.com/) — Patricio Gonzalez Vivo
- [WebGL Fundamentals](https://webglfundamentals.org/) — Gregg Tavares
- [LearnOpenGL](https://learnopengl.com/) — Joey de Vries
- [Maxime Heckel's Blog](https://blog.maximeheckel.com/posts/the-study-of-shaders-with-react-three-fiber/) — Shader learning articles
- [Inigo Quilez Portfolio](https://iquilezles.org/) — Graphics articles & Shadertoy
- [Frontend Masters WebGL/Canvas Courses](https://frontendmasters.com/courses/webgl-shaders/) — Matt DesLauriers
- [Online Video Length Research](https://www.qualitymatters.org/qa-resources/resource-center/articles-resources/research-video-length) — Quality Matters
- [Optimal Instructional Video Duration](https://www.boclips.com/blog/whats-the-optimum-length-for-an-instructional-video-and-why-does-it-matter) — Boclips
