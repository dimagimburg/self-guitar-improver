# Guitar Key Master Trainer — Ideas & Feature Specs

This folder contains product specs and implementation guides for expanding self-guitar-improver with full music theory training.

## Quick Navigation

**Start here:**
- [`OVERVIEW.md`](./OVERVIEW.md) — High-level fit assessment and feature breakdown
- [`ROADMAP.md`](./ROADMAP.md) — Phased implementation plan (4–6 months, 8 phases)

**Feature Specs** (each is self-contained):
- [`note-finder/`](./note-finder/README.md) — Instantly locate notes on fretboard (**Phase 2**)
- [`key-builder/`](./key-builder/README.md) — Learn major/minor scale construction (**Phase 3**)
- [`diatonic-chords/`](./diatonic-chords/README.md) — Train chord functions in keys (**Phase 4**)
- [`intervals/`](./intervals/README.md) — Visual + aural interval recognition (**Phase 5**)
- [`position-constraints/`](./position-constraints/README.md) — Play within position limits (**Phase 6**)
- [`recall-drill/`](./recall-drill/README.md) — Rapid-fire recall drills (**Phase 7**)

**Infrastructure:**
- [`theory-engine/`](./theory-engine/README.md) — Shared music theory logic (**Phase 1**)

## The Goal

Turn self-guitar-improver from "pentatonic shape trainer" into "complete fretboard fluency + music theory trainer."

**Problems we're solving:**
1. ❌ Users memorize shapes but don't understand them
2. ❌ No way to learn scales, keys, chord functions
3. ❌ No interval recognition training
4. ❌ No way to think "musically" (functional harmony)

**What we're building:**
1. ✅ Core theory engine (reusable by all exercises)
2. ✅ 6 new exercise types, each with difficulty progression
3. ✅ Adaptive skill system (learns from user struggles)
4. ✅ Same session/rating/progression pattern as existing system
5. ✅ Reuses Fretboard, useSequencer, Zustand — leverages existing code

## Architecture Overview

### Existing Code (Reuse)
- **Fretboard.tsx** — Will extend with highlight/click handlers
- **useSequencer** — Will play scales, arpeggios, chords
- **Zustand store** — Will extend with new skills and analytics
- **Session generator** — Will include new exercise types
- **Skill adaptation** — Will adjust 5 new skills based on ratings

### New Code Required
- **Theory engine** (~600 lines) — All music theory logic
  - Scales: build from intervals
  - Chords: diatonic functions, voicing validation
  - Intervals: semitone calculations
  - Fretboard: map notes to positions
- **6 Exercise components** (~1,500 lines total)
  - NoteFinderExercise
  - KeyBuilderExercise
  - DiatonicChordExercise
  - IntervalExercise
  - PositionConstraintExercise
  - RecallDrillExercise
- **Skill tracking & analytics** (~100 lines)
  - Per-note, per-key, per-interval accuracy
  - Weak area detection and prioritization

### Skills to Track
```ts
skills: {
  fretboard: 1–10       // existing
  pentatonic: 1–10      // existing
  notes: 1–10           // NEW: all 12 notes across neck
  keys: 1–10            // NEW: major/minor scale construction
  diatonicChords: 1–10  // NEW: chord functions in keys
  intervals: 1–10       // NEW: interval recognition
  positions: 1–10       // NEW: constrained-position playing
}
```

## Phased Implementation

| Phase | Feature | Duration | LOC | Gate |
|-------|---------|----------|-----|------|
| 1 | Theory engine | 4–6 weeks | 600 | Foundation for all |
| 2 | Note Finder | 2–3 weeks | 260 | Simple to test |
| 3 | Key Builder | 3–4 weeks | 310 | Builds on phases 1–2 |
| 4 | Diatonic Chords | 3–4 weeks | 310 | Requires phase 3 |
| 5 | Intervals | 2–3 weeks | 285 | Independent but uses theory |
| 6 | Position Constraints | 3–4 weeks | 375 | Capstone: combines all |
| 7 | Recall Drill | 2–3 weeks | 360 | Pure UI + theory engine |
| 8 | Polish & Analytics | 2 weeks | 250 | UX, visualization, tests |

**Total**: ~3,270 lines, 22–30 weeks (faster with parallel work)

**Recommended first ship**: Phases 1–3 (Note Finder + Key Builder). Low risk, high value.

## Key Design Principles

1. **Music-first**: Model scales, chords, intervals accurately. Let the theory drive the exercises.
2. **Fretboard-centric**: All exercises use the fretboard visualization. Consistent visual language.
3. **Skill progression**: Every exercise has difficulty gates based on skill level.
4. **Spaced repetition**: Track weak notes/keys/intervals. Prioritize them in future sessions.
5. **Reuse relentlessly**: One fretboard component, one theory engine, one session generator.
6. **Playtest early**: Build note-finder, play it yourself, iterate before moving on.

## How It Fits Into Current App

**Current state:**
- Session-based practice (Pentatonic + Fretboard exercises)
- Skill tracking for fretboard & pentatonic
- Rating-based skill adaptation
- Views: session, pentatonic-map, free-practice, fretboard-builder

**With Key Master:**
- Session-based practice (now 6 exercise types instead of 2)
- Skill tracking for fretboard, pentatonic, notes, keys, chords, intervals, positions
- Same rating-based adaptation (more granular)
- New optional views: theory dashboard, analytics heatmap
- Same Zustand store, same session flow, same rating screen

**Zero breaking changes.** Pure additive. The app stays lightweight but gets much deeper.

## Getting Started

1. **Read OVERVIEW.md** for the big picture
2. **Read ROADMAP.md** for implementation phases
3. **Pick Phase 1 + Phase 2** to start (theory engine + note finder)
4. Create branch: `git checkout -b feature/key-master`
5. Start building the theory engine (pure functions, no UI risk)
6. Once solid, build NoteFinderExercise
7. Play it. Iterate. Ship.

## Questions?

Each feature spec (`note-finder/`, `key-builder/`, etc.) is detailed but self-contained. They answer:
- **What** does this exercise teach?
- **How** does it work (flow, modes, difficulty)?
- **Why** is it valuable?
- **Where** does it fit architecturally?
- **How much** code (estimate)?
- **What's** the validation logic?
- **How** does it integrate with existing systems?

Start with the feature you want to build. The spec walks you through it.

## Success Looks Like

- Users report better real-world fretboard fluency
- Users can think in terms of "keys" and "functions" instead of "shapes"
- Daily active users increase (more reason to practice)
- Skill progression feels satisfying (not too easy, not frustrating)
- App feels like a "complete" music theory trainer, not just pentatonic shapes

---

**Status**: All specs written, ready to build. Phase 1 (theory engine) is the critical path. Everything else waits for that.

Build it. Ship it. Iterate. 🎸
