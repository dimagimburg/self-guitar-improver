# Random Recall Drill — Exercise Spec

Rapid-fire prompts to build instant musical reflexes. Pure knowledge recall, no fretboard interaction.

**Why valuable**: Trains the mental library. \"What's the V chord in Bb?\" should be instant recall, not a calculation.

## Exercise Variants

### RecallDrillExerciseConfig
```ts
interface RecallDrillExerciseConfig {
  // Question types
  questionTypes: QuestionType[]
  
  // Speed settings
  perQuestionMs: number          // e.g., 4000ms = 4 sec per question
  totalQuestions: number         // e.g., 12 questions
  
  // Scope
  keyRestriction?: string[]      // e.g., ['C', 'G', 'D', 'A', 'E'] (5 sharps or fewer)
  
  // Feedback style
  feedbackImmediate?: boolean    // Show answer immediately vs. after all questions
}

type QuestionType = 
  | 'chord-function'     // \"vi in G major?\" → \"Em\"
  | 'relative-key'       // \"Relative minor of D major?\" → \"B minor\"
  | 'scale-degree'       // \"7th of E major?\" → \"D#\"
  | 'interval-name'      // \"Semitones between G and B?\" → \"4\" or \"Major 3rd\"
  | 'diatonic-chord'     // \"iii in F major?\" → \"Am\"
  | 'chord-in-key'       // \"Is Db major in G major?\" → \"No\"
```

## Exercise Modes

### Mode 1: Multiple Choice (Easiest)
```
1. Show: \"What is the IV chord in A major?\"
2. Options: [D major] [E major] [F# major] [G major]
3. User clicks answer
4. Immediate feedback: ✓ or ✗
5. Next question
```

### Mode 2: Text Input (Medium)
```
1. Show: \"vi in D major?\"
2. User types: \"bm\" or \"b minor\" or \"Bm\"
3. System normalizes and validates
4. Feedback: \"✓ B minor is correct!\"
5. Next question
```

### Mode 3: Rapid Buttons (Hard)
```
1. Question: \"Relative minor of C major?\"
2. Options: [Am] [Em] [Dm] [Gm]
3. 3 seconds to answer
4. Auto-advance on answer or timeout
5. Rapid-fire: 15 questions in 45 seconds (3 sec each)
```

## Data Model

### Questions Database

```ts
// Generate questions dynamically from theory engine

interface DrillQuestion {
  questionText: string
  answer: string                    // Expected answer
  alternatives?: string[]           // Valid alternatives (\"D major\" = \"D\" = \"Dm\")
  questionType: QuestionType
  key?: string                      // e.g., \"G major\"
  difficulty: 1 | 2 | 3            // 1=easy, 2=medium, 3=hard
}

// Question generators using theory engine
function generateChordFunctionQuestion(root: string, keyType: 'major' | 'minor'): DrillQuestion {
  const func = randomChordFunction()  // 'I', 'ii', etc.
  const chords = getDiatonicChords(root, keyType)
  const chord = chords[func]
  
  return {
    questionText: `${func} chord in ${root} ${keyType}?`,
    answer: chord.root,
    alternatives: [
      chord.root,
      `${chord.root} ${chord.quality === 'minor' ? 'minor' : 'major'}`,
      // Handle enharmonic spellings if needed
    ],
    questionType: 'chord-function',
    key: `${root} ${keyType}`,
    difficulty: func === 'vii°' ? 3 : 2,  // Diminished chords are harder
  }
}

function generateScaleDegreeQuestion(root: string, keyType: 'major' | 'minor'): DrillQuestion {
  const degree = randomBetween(1, 7)
  const scale = buildScale(root, keyType === 'major' ? 'major' : 'naturalMinor')
  const note = scale[degree - 1]
  
  return {
    questionText: `${degree}th note of ${root} ${keyType}?`,
    answer: note,
    alternatives: [note, displayNote(note), `Scale degree ${degree}`],
    questionType: 'scale-degree',
    key: `${root} ${keyType}`,
    difficulty: degree === 7 ? 2 : 1,  // Leading tone is less intuitive
  }
}

function generateRelativeKeyQuestion(): DrillQuestion {
  const majorKey = randomKey()
  const majorScale = buildScale(majorKey, 'major')
  const relativeMinor = majorScale[5]  // 6th scale degree
  
  return {
    questionText: `Relative minor of ${majorKey} major?`,
    answer: relativeMinor,
    alternatives: [relativeMinor, `${relativeMinor} minor`],
    questionType: 'relative-key',
    difficulty: 2,
  }
}
```

### ExerciseInstance
```ts
interface ExerciseInstance {
  type: 'recall-drill'
  config: RecallDrillExerciseConfig
  questions?: DrillQuestion[]  // Pre-generated or lazy-generate during exercise
}
```

### Result Tracking
```ts
metrics?: {
  exerciseType: 'recall-drill'
  
  // Overall stats
  totalQuestions: 12
  correctAnswers: 10
  accuracy: 0.833  // 83.3%
  totalTimeMs: 32000
  avgResponseTimeMs: 2667
  
  // Per-question type breakdown
  byType: {
    'chord-function': { correct: 7, total: 8, avgTimeMs: 2100 },
    'scale-degree': { correct: 3, total: 3, avgTimeMs: 1500 },
    'relative-key': { correct: 0, total: 1, avgTimeMs: 4500 },
  }
  
  // Weak areas
  slowestResponses?: ['relative-key']
  mostMissed?: ['vii° in G major']
}
```

## Difficulty Progression (Skill 1–10)

| Skill | Questions | Mode | Time | Notes |
|-------|-----------|------|------|-------|
| 1–2 | scale-degree, simple chords | Multiple choice | 10 sec | Major keys only |
| 3–4 | All diatonic chords | Multiple choice | 6 sec | Major keys |
| 5–6 | Add relative keys, intervals | Text input | 5 sec | Minor keys too |
| 7–8 | Add difficult questions (vii°, tritones) | Rapid buttons | 4 sec | No repeats in session |
| 9–10 | All question types mixed | Rapid buttons | 3 sec | Streaks tracked |

## UI Needed

### New Component: RecallDrillExercise
```tsx
interface RecallDrillExerciseProps {
  instance: ExerciseInstance
  onComplete: (rating: 'easy' | 'medium' | 'hard' | 'skipped') => void
}
```

### Sub-component: QuestionDisplay
```tsx
// Large, clear question text
// Animated entrance
// Auto-highlight if hovering over buttons
```

### Sub-component: AnswerInput (varies by mode)
```tsx
// MultipleChoice: radio buttons / large buttons
// TextInput: text field with auto-complete
// RapidButtons: 4 large buttons, timer countdown
```

### Sub-component: FeedbackBar
```tsx
// Show correct answer if user got it wrong
// Show streaks (e.g., \"3 in a row!\")
// Show time taken
// Progress (e.g., \"Question 7 of 12\")
```

## Integration Points

### Session Generator
```ts
// Add recall-drill only to sessions for skill >= 5 (requires baseline knowledge)
if (skills.diatonicChords >= 2 || skills.keys >= 3) {
  exercises.push({
    type: 'recall-drill',
    config: {
      questionTypes: ['chord-function', 'scale-degree'],
      perQuestionMs: 6000,
      totalQuestions: 8,
      keyRestriction: skills.diatonicChords >= 8 ? undefined : ['C', 'G', 'D', 'A', 'E', 'F'],
    }
  })
}
```

### Skill Adaptation
```ts
// Recall drill scores map to overall comprehension
// If user struggles with recall, boost fretboard/theory exercises
// If user nails recall, can skip to higher-level exercises

if (drillScore < 0.6) {
  // User doesn't understand fundamentals; go back to basics
  nextSession.type = 'key-builder'  // Rebuild foundations
} else if (drillScore === 1.0) {
  // User is ready for advanced stuff
  nextSession.includePositionConstraints = true
}
```

### Analytics
```ts
// Track which question types are weakest
const byType = result.metrics.byType
const weakestType = Object.entries(byType)
  .sort(([_, a], [__, b]) => (a.correct / a.total) - (b.correct / b.total))
  [0]

// Next session can focus on weak area
// E.g., if 'relative-key' is weak, add more relative-key questions
```

## Validation Logic

```ts
function normalizeAnswer(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-g#b♯♭]/gi, '')  // Remove special chars
}

function isAnswerCorrect(userInput: string, question: DrillQuestion): boolean {
  const normalized = normalizeAnswer(userInput)
  const acceptableAnswers = question.alternatives.map(normalizeAnswer)
  return acceptableAnswers.includes(normalized)
}
```

## Feedback Examples

| Scenario | Feedback |
|----------|----------|
| Correct fast | \"✓ D major! (1.2 sec)\" |
| Correct slow | \"✓ Correct, but slow. Keep drilling to build speed!\" |
| Wrong | \"✗ You said E major. The IV chord in A is D major.\" |
| Streak | \"🔥 5 in a row!\" |
| Speed PB | \"⚡ Personal best: 2.8 sec avg!\" |

## Audio Integration

- Optional: play the target chord after showing the answer
- Reinforces audio + recall connection
- \"Here's what D major sounds like...\"

## Streaks & Gamification

```ts
// Track streak in session
streak: 0
maxStreak: 0

// After each correct answer
streak++
maxStreak = Math.max(maxStreak, streak)

// After each wrong answer
streak = 0

// Milestone bonuses (if gamifying)
if (streak === 3) celebrationAnimation()
if (maxStreak > previousMaxStreak) showPB()
```

## Spaced Repetition Strategy

Prioritize in future drills:
1. Question types with low accuracy
2. Chord functions user struggles with (vii°, ii in minor)
3. Keys with many accidentals (B major, F# major, Gb major)
4. Slower responses (even if correct)

## Code Estimate

- **RecallDrillExercise.tsx** — main component (~200 lines)
- **QuestionDisplay.tsx** — question UI (~80 lines)
- **AnswerInput.tsx** — input variants (~100 lines)
- **FeedbackBar.tsx** — progress + feedback (~60 lines)
- **Question generators** — in theory engine (~80 lines)
- **Session generator** — add recall-drill type (~30 lines)

Total: ~550 lines. Low–Medium risk (mostly UI, uses theory engine heavily).

## Future: Streaming Mode

\"Endless recall drill\" — keep playing until user quits, with difficulty dynamically adjusting based on performance.

## Future: Leaderboard

Track personal stats:
- Fastest avg response time
- Longest streak
- Most questions correct in one session
- Accuracy per question type

Build motivation through friendly competition with oneself.
