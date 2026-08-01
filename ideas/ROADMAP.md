# Guitar Key Master Trainer — Implementation Roadmap

Phased approach to building the Key Master feature suite. Each phase builds on the previous one.

## Phase 1: Foundation (4–6 weeks)

**Goal**: Build core infrastructure that all other features will depend on.

### 1.1 Theory Engine (`src/features/theory/`)
- [ ] `notes.ts` — note naming, indices, enharmonics
- [ ] `scales.ts` — build scales from intervals
- [ ] `intervals.ts` — calculate intervals, consonance
- [ ] `chords.ts` — build chords, validate voicings
- [ ] `functions.ts` — diatonic chord functions (I–vii°)
- [ ] `fretboard.ts` — map notes to fret positions

**Deliverable**: Pure logic, zero UI. Should be 100% testable. ~600 lines.

**Why first**: Everything else depends on this. Once solid, feature development gets fast.

### 1.2 Extend Zustand Store
- [ ] Add skills: `notes`, `keys`, `diatonicChords`, `intervals`
- [ ] Add analytics: `noteAccuracy`, `keyAccuracy`, `chordAccuracy`, `intervalAccuracy`
- [ ] Add voicing tracking: which chord voicings user has played
- [ ] Persist to localStorage (already implemented)

**Deliverable**: Extensible skill & metrics system. ~40 lines.

### 1.3 Extend Fretboard Component
- [ ] Add `incorrect: FretPosition[]` prop (red highlight)
- [ ] Add `correct: FretPosition[]` prop (green highlight)
- [ ] Add click handler: `onFretClick?: (string, fret) => void`
- [ ] Add visual states: `clickState: 'neutral' | 'hover' | 'correct' | 'incorrect'`
- [ ] Add constraint visualization: highlight allowed regions

**Deliverable**: Reusable fretboard for all interactive exercises. ~80 lines.

### 1.4 Tests
- [ ] Unit tests for theory engine (scales, chords, intervals, functions)
- [ ] Fretboard position calculations
- [ ] Validation logic

**Deliverable**: Confidence in core logic. ~200 lines of test code.

**Phase 1 Total**: ~920 lines of code, 4–6 weeks if done carefully.

---

## Phase 2: Note Finder (2–3 weeks)

**Goal**: First complete exercise. Teaches fretboard fluency, lowest complexity.

### 2.1 NoteFinderExercise Component
- [ ] Exercise state (target note, correct positions, user selections)
- [ ] Display target note (text + audio)
- [ ] Handle fret clicks, validate correctness
- [ ] Show accuracy % and response time
- [ ] Difficulty gates (E string only → A string → full neck)

**Deliverable**: Playable exercise. ~200 lines.

### 2.2 Session Generator Integration
- [ ] Add 'note-finder' to `ExerciseInstance` type
- [ ] Add `generateNoteFinder()` helper
- [ ] Weight weak notes higher based on `noteAccuracy`
- [ ] Skill gates: limit scope based on `skills.notes`

**Deliverable**: Sessions can include note-finder exercises. ~40 lines.

### 2.3 Skill Adaptation
- [ ] Update `computeUpdatedSkills()` to adjust `skills.notes`
- [ ] Update `noteAccuracy` tracking for each note
- [ ] Test that weak notes are prioritized

**Deliverable**: Adaptive difficulty for note finder. ~20 lines.

### 2.4 Manual Testing
- [ ] Play through a note-finder session
- [ ] Verify fretboard interaction works
- [ ] Check skill progression is sensible

**Phase 2 Total**: ~260 lines of code, 2–3 weeks.

**User should play ~10–20 sessions of note finder before moving to Phase 3.**

---

## Phase 3: Key Builder (3–4 weeks)

**Goal**: Teach scale construction. Bridge to chord functions.

### 3.1 KeyBuilderExercise Component
- [ ] Scale-only mode (text input or select buttons)
- [ ] Validate scale input
- [ ] Show missing/extra notes
- [ ] Display scale on fretboard (optional)

**Deliverable**: Can build scales. ~250 lines.

### 3.2 Session Generator Integration
- [ ] Add 'key-builder' to exercise types
- [ ] Gate by `skills.keys >= 3` (has completed note finder)
- [ ] Start with white keys, progress to all keys
- [ ] Weight weak keys higher

**Deliverable**: Sessions can include key-builder exercises. ~40 lines.

### 3.3 Skill Adaptation
- [ ] Track `skills.keys` from 1–10
- [ ] Track per-key accuracy in `keyAccuracy`
- [ ] Bias future sessions toward weak keys

**Deliverable**: Key builder difficulty adapts. ~20 lines.

### 3.4 Optional: Voicing Mode
- [ ] Allow user to click fretboard to voice scale notes
- [ ] Show multiple voicings of same scale
- [ ] Higher difficulty unlock

**Deliverable**: Voice scales on fretboard. ~100 lines (optional, can defer).

**Phase 3 Total**: ~310 lines (+ 100 optional), 3–4 weeks.

**User should complete ~15 key-builder sessions before Phase 4.**

---

## Phase 4: Diatonic Chords (3–4 weeks)

**Goal**: Teach chord functions in keys. Functional harmony.

### 4.1 DiatonicChordExercise Component
- [ ] Multiple modes: name chord, voice chord, identify from voicing
- [ ] Text input with auto-complete for chord names
- [ ] Fretboard interaction for voicing mode
- [ ] Feedback explaining the role (\"V is the dominant\", etc.)

**Deliverable**: Can train diatonic chords. ~250 lines.

### 4.2 Session Generator Integration
- [ ] Gate by `skills.diatonicChords >= 1` (can read key builder results)
- [ ] Weight difficult chords (vii°, ii in minor) higher
- [ ] Vary key difficulty based on `skills.keys`

**Deliverable**: Sessions include diatonic chord exercises. ~40 lines.

### 4.3 Skill Adaptation
- [ ] Track `skills.diatonicChords` from 1–10
- [ ] Track accuracy per chord function
- [ ] Track accuracy per key

**Deliverable**: Diatonic chord difficulty adapts. ~20 lines.

### 4.4 Optional: Progression Mode
- [ ] Build simple progressions (I–IV–V–I, vi–IV–I–V, etc.)
- [ ] Show voice leading quality
- [ ] Higher unlock

**Deliverable**: Chord progression training. ~100 lines (optional, defer).

**Phase 4 Total**: ~310 lines (+ 100 optional), 3–4 weeks.

---

## Phase 5: Interval Trainer (2–3 weeks)

**Goal**: Visual + aural interval recognition.

### 5.1 IntervalExercise Component
- [ ] Display root note prominently
- [ ] Show interval type (M3, P5, tritone, etc.)
- [ ] Highlight correct/incorrect selections
- [ ] Color-code intervals consistently

**Deliverable**: Can train intervals. ~200 lines.

### 5.2 Fretboard Enhancement
- [ ] Color-code intervals (P5 = blue, M3 = green, tritone = red)
- [ ] Show geometric pattern (same interval always looks same)

**Deliverable**: Intervals visually distinguished. ~40 lines.

### 5.3 Session Generator Integration
- [ ] Gate by `skills.intervals >= 1`
- [ ] Weight hard intervals (tritone, m6) higher

**Deliverable**: Sessions include interval exercises. ~30 lines.

### 5.4 Skill Adaptation
- [ ] Track `skills.intervals` from 1–10
- [ ] Track per-interval accuracy

**Deliverable**: Interval difficulty adapts. ~15 lines.

**Phase 5 Total**: ~285 lines, 2–3 weeks.

---

## Phase 6: Position Constraints (3–4 weeks)

**Goal**: Train thinking within position limits. Real-world fretboard mastery.

### 6.1 PositionConstraintExercise Component
- [ ] Show allowed fret range and strings visually
- [ ] Validate voicings fit within constraints
- [ ] Suggest alternative voicings if possible

**Deliverable**: Can train in positions. ~250 lines.

### 6.2 Fretboard Constraints UI
- [ ] Highlight allowed region
- [ ] Gray out forbidden frets
- [ ] Real-time validation feedback

**Deliverable**: Clear constraint visualization. ~60 lines.

### 6.3 Session Generator Integration
- [ ] Gate by `skills.fretboard >= 5` (solid fundamentals)
- [ ] Rotate through weak positions

**Deliverable**: Sessions include position training. ~40 lines.

### 6.4 Skill Adaptation
- [ ] Track per-position mastery
- [ ] Bias toward weak positions
- [ ] Enable position-shift training later

**Deliverable**: Position-specific skills tracked. ~25 lines.

**Phase 6 Total**: ~375 lines, 3–4 weeks.

---

## Phase 7: Random Recall Drill (2–3 weeks)

**Goal**: Instant knowledge recall. Mental library builder.

### 7.1 RecallDrillExercise Component
- [ ] Multiple choice mode (easiest)
- [ ] Text input mode (medium)
- [ ] Rapid buttons mode (hard)
- [ ] Timer + feedback

**Deliverable**: Can run recall drills. ~200 lines.

### 7.2 Question Generation
- [ ] Chord function questions
- [ ] Scale degree questions
- [ ] Relative key questions
- [ ] Interval identification (optional)

**Deliverable**: Endless question variety. ~80 lines (in theory engine).

### 7.3 Session Generator Integration
- [ ] Gate by `skills.diatonicChords >= 2` (baseline knowledge)
- [ ] Vary difficulty by key restriction

**Deliverable**: Sessions include recall drills. ~30 lines.

### 7.4 Gamification
- [ ] Streak tracking
- [ ] Speed PBs
- [ ] Per-type accuracy breakdown

**Deliverable**: Motivating metrics. ~50 lines.

**Phase 7 Total**: ~360 lines, 2–3 weeks.

---

## Phase 8: Polish & Analytics (2 weeks)

**Goal**: Make it feel great.

### 8.1 Visual Polish
- [ ] Animations for correct/incorrect feedback
- [ ] Loading states for exercises
- [ ] Success screens
- [ ] Progress visualizations

**Deliverable**: Smooth, delightful UX. ~100 lines.

### 8.2 Analytics Dashboard
- [ ] Show skills heatmap (1–10 for each skill)
- [ ] Show weak notes / weak keys / weak intervals
- [ ] Show history: recent exercises, trends
- [ ] Show personal stats: total exercises, streaks, etc.

**Deliverable**: Understand your progress. ~150 lines.

### 8.3 Testing & Bug Fixes
- [ ] Manual testing across all exercise types
- [ ] Edge cases (invalid chords, out-of-range notes)
- [ ] Mobile responsiveness (fretboard interaction)

**Deliverable**: Production-ready. ~TBD.

**Phase 8 Total**: ~250 lines, 2 weeks.

---

## Total Estimate

```
Phase 1 (Foundation)        920 lines    4–6 weeks
Phase 2 (Note Finder)       260 lines    2–3 weeks
Phase 3 (Key Builder)       310 lines    3–4 weeks
Phase 4 (Diatonic Chords)   310 lines    3–4 weeks
Phase 5 (Intervals)         285 lines    2–3 weeks
Phase 6 (Position)          375 lines    3–4 weeks
Phase 7 (Recall Drill)      360 lines    2–3 weeks
Phase 8 (Polish)            250 lines    2 weeks

TOTAL: ~3,270 lines    ~22–30 weeks
```

(Estimate assumes parallel work on components during independent phases.)

---

## Implementation Tips

### 1. Do Phase 1 last
Actually, **start with Phase 2 (Note Finder)** using a minimal theory engine, then extract Phase 1 when patterns emerge. Build what you need, not what you predict.

### 2. Test interactively
Build each exercise and **play it yourself** before moving on. You'll find UX issues and bugs that tests miss.

### 3. Watch skill progression
As you add exercises, keep an eye on whether:
- Skills increase reasonably (not too fast, not stalled)
- Users feel motivated by progression
- Difficulty curves feel right

Adjust session generator weights based on playtesting.

### 4. Ship phases incrementally
Don't wait until Phase 8 to ship Phase 1. After Phase 2, deploy Note Finder as a standalone feature. Get real users playing. Iterate.

### 5. Reuse relentlessly
Every exercise should use:
- Same Fretboard component (with extensions)
- Same theory engine (no duplicated logic)
- Same session/skill system
- Same feedback patterns

No custom UI per exercise type. Keep it consistent.

### 6. Build a test suite for theory engine early
This is your foundation. Every bug in scales.ts breaks 5 features. Test it to death.

---

## Success Criteria

**MVP (Phases 1–3)**
- [ ] Note Finder is addictive and teaches fretboard fluency
- [ ] Key Builder teaches scale construction
- [ ] Users stay for 20+ minutes per session
- [ ] Skill progression feels right (not too easy, not frustrating)

**Full Release (All Phases)**
- [ ] All 6 exercise types are polished
- [ ] Analytics dashboard shows clear progress
- [ ] 5+ skills tracked independently
- [ ] Users report better real-world fretboard fluency
- [ ] Daily active sessions stay high (retention)

---

## Future Opportunities (Beyond Roadmap)

Once the core system is solid:

- **Chord progressions**: \"Play I–IV–V–I in C, with good voice leading\"
- **Melody writing**: \"Compose a melody using the C major pentatonic scale\"
- **CAGED integration**: Train each shape systematically
- **Backing tracks**: Play over real chord progressions
- **Ear training**: Remove fretboard, train aural recognition
- **Song deconstruction**: Learn real songs via Key Master concepts
- **Multiplayer**: Compete on recall drills, speed challenges
- **AI coaching**: \"You're struggling with F# major, let's focus there\"

Start with the roadmap. Ship features. Get feedback. Then decide what comes next.

---

## Questions to Resolve

1. **Visual language**: How to make skill progression feel clear? Radar chart? Bars? Numbers?
2. **Difficulty balance**: What makes something feel easy vs. hard? Test with users.
3. **Session length**: Aim for 10 min? 20 min? 60 min? Watch user behavior.
4. **Audio feedback**: How much is helpful vs. annoying? Iterate based on playtesting.
5. **Onboarding**: How do new users learn what each exercise does? In-app tutorial? Tooltips?

Build the roadmap, then answer these through playtesting.

---

## Getting Started

Next steps:

1. Pick a phase to start (recommend Phase 1 + Phase 2)
2. Create branch: `feature/key-master`
3. Build the theory engine first (pure logic, no UI risk)
4. Then build NoteFinderExercise (simplest UI, tests everything)
5. Play it. Enjoy it. Iterate.

This is a large project, but each phase is self-contained. You can ship Phase 2 while still building Phase 3. Ship early, ship often.

Good luck! 🎸
