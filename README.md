# Guitar Trainer

A web-based guitar practice app focused on fretboard knowledge and pentatonic scales. No account needed — progress is saved locally in your browser.

**Live app:** https://dimagimburg.github.io/self-guitar-improver/

## What it does

**Daily Session** — generates a 30-minute practice session tailored to your skill level. Each session mixes:
- Fretboard note recognition (find all positions, string-focused, or rolling Q&A)
- Pentatonic scale drilling (ascending, descending, alternating, target note)
- Pentatonic position transitions between CAGED box shapes

The app tracks how you rate each exercise (easy / medium / hard) and gradually adjusts difficulty across sessions.

**Free Practice** — jump directly into any exercise type without starting a full session.

**Scale Map** — visualise all 5 pentatonic boxes for any key on a single full-neck fretboard, with per-box toggles and note labels.

**Fretboard Canvas** — an empty interactive fretboard where you click to place and remove coloured dots. Includes a theory reference panel showing the notes for any chord (Major, Minor, Power) or scale (Major, Natural Minor, Pentatonic Minor, Pentatonic Major) in any key.

## Running locally

```bash
npm install
npm run dev
```

## Tech

React + TypeScript + Vite, Tailwind CSS, Zustand, Web Audio API.
