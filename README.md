# MathPulse

**An advanced, voice-enabled math tutor with Socratic guidance, a digital handwriting studio, autonomous diagram synthesis, adaptive quizzes and spaced-repetition flashcards.**

MathPulse is a single-page React application. Type, dictate **or photograph** any problem, and it classifies the discipline, builds a narrated step-by-step solution, draws the right interactive figure, writes the worked solution as digital ink, and turns the topic into practice questions and a flashcard deck.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve the production build
```

No backend, no API keys. Every solution, diagram, quiz and flashcard is generated client-side.

> The first `dev`/`build` run copies the OCR runtime (Tesseract worker, WASM core and the English model) from `node_modules` into `public/ocr/`. Those files are git-ignored and regenerated automatically by the `predev`/`prebuild` hooks.

---

## The six workspaces

| Tab | What it does |
| --- | --- |
| **AI Solver & Voice** | Conversational audio player with karaoke word-by-word highlighting. Each step is narrated with a real-world analogy (car speedometer for derivatives, odometers for integrals), plus a synced auto-diagram and topic detector. |
| **Socratic Mode** | Swaps direct answers for guided questions. Choose a reasoning step, submit it, and the tutor nudges you forward; a hint channel, discovery map and answer vault keep the answer hidden until you get there. |
| **Handwriting Studio** | Renders the same solution as tablet-style ink notes on ruled paper: given, numbered steps, amber margin hints and an underlined final answer. Four ink colours, three paper toggles, focus mode and print-to-PDF export. |
| **Auto-Diagram View** | Picks a visual grammar from the mathematics — tangent/derivative, Riemann accumulation, level curves, intersecting constraints, normal distribution or angle geometry — and plots the *actual* function and bounds of the current problem. Every figure is draggable/slider-driven with live algebra readouts. |
| **Summary & Quiz Hub** | Structured summary notes (theorem, core formula, takeaways, terminology), a three-variation "explore similar examples" drawer, "How You Can Be Tested" traps, an adaptive practice arena with scoring analytics, and a mastery checklist. |
| **Flashcards** | One-click deck generation from the session, 3-D flip cards, SM-2 style scheduling with Again/Hard/Good/Easy ratings, per-card intervals and a session progress rail. |

Header actions: **Toggle Voice**, **Export Handwritten PDF** (print dialog → *Save as PDF*), **New Session** (clears the workspace and opens a fresh composer).

---

## Import a question from an image

Every composer has **Import image** and **Screenshot** actions, plus drag-and-drop and clipboard paste (⌘/Ctrl + V) anywhere on the composer card.

1. **Source** — upload, drag, paste, take a photo (`capture="environment"`) or capture the screen with `getDisplayMedia`.
2. **Crop** — a draggable, resizable crop box with rule-of-thirds guides frames exactly the question you want read, so a page of exercises becomes one problem.
3. **Check** — on-device OCR (Tesseract.js) extracts the text, a math cleanup pass repairs `x2 → x²`, stray dashes and question numbering, the topic detector shows the discipline and confidence, and you can fix any symbol before pressing **Solve & narrate**.

The cropped image never leaves the browser, and the solved session keeps a thumbnail labelled *Question from image* so you can see what was read.

## How the tutor thinks

`src/lib/classify.js` is a small deterministic "solution engine":

1. **Normalise** the prompt (superscripts → `^n`, unicode minus, stripped wrappers).
2. **Extract** the expression (`f(x) = …`, `d/dx[…]`, `∫…dx`, systems of equations).
3. **Score** every discipline on strong/weak keywords, concept phrases and expression shape, then return a confidence in the 88–97% band; an exact fingerprint match returns 97%.
4. **Build the session**:
   - authored exemplars are used when the expression fingerprint matches exactly;
   - otherwise a generated skeleton is filled in, and a small polynomial engine computes real derivatives, antiderivatives, definite-integral values (F(b) − F(a)) and 2×2 linear systems (Cramer's rule);
   - concept-only prompts ("teach me derivatives") get a full walkthrough instead of a fake answer.
5. Everything downstream — narration, diagrams, handwriting, summary, quiz, flashcards — is derived from that one session object.

Because of this, prompts like these all resolve correctly:

- `Find the derivative of f(x) = 3x² + 2x at x = 1` → `f′(x) = 6x + 2 · f′(1) = 8`
- `Integrate 2x from 0 to 3` → `∫₀³ 2x dx = 9` (and the area diagram plots `y = 2x` with area 9)
- `Find the antiderivative of 6x²` → `∫ 6x² dx = 2x³ + C`
- `Solve x + y = 5 and x − y = 1` → `x = 3, y = 2`

Unrecognised prompts fall back to the nearest discipline exemplar with an adaptive skeleton, and the confidence badge honestly reports that it is a generated lesson.

---

## Voice

- Uses the Web Speech API (`speechSynthesis`) with a hand-picked voice preference list and a boundary-event-driven karaoke highlight that stays in sync with the spoken audio.
- When a browser exposes no system voices, the player degrades to silent karaoke at reading pace and says so in the UI.
- Voice input in the composer uses `SpeechRecognition` when available.
- Narration auto-advances step by step; every step also has replay/seek controls and words are clickable.

## Keyboard shortcuts

- **Space** — flip the current flashcard
- **1 / 2 / 3 / 4** — rate a revealed card (Again / Hard / Good / Easy)
- **⌘/Ctrl + Enter** — solve the prompt in the composer
- **⌘/Ctrl + V** — paste a screenshot into the image importer
- **Esc** — close the image importer

## Design system

Deep Obsidian `#070a12` canvas, glassmorphic `#0f172a` cards.

| Token | Hex | Used for |
| --- | --- | --- |
| Cyber Violet | `#8b5cf6` | voice, math core, primary actions |
| Neon Emerald | `#10b981` | correct answers, success |
| Electric Cyan | `#06b6d4` | diagrams, ink studio |
| Electric Amber | `#f59e0b` | analogies, hints, Socratic |
| Neon Rose | `#f43f5e` | traps, warnings, errors |

JetBrains Mono for formulas and metadata, Inter for UI, Caveat/Kalam for handwriting. Fonts are bundled locally via `@fontsource` (latin subsets only) — no external font requests at runtime.

## Stack

React 18 · Vite 5 · Tailwind CSS 3 · Lucide React · `@fontsource` · Web Speech API · hand-built SVG charts.

All diagrams are plain SVG with pointer events — no charting dependency.

## Accessibility & responsiveness

- Keyboard-focusable controls with `focus-ring` styling, labelled icon buttons, `aria-current` on navigation, `aria-pressed` on toggles.
- Responsive from 320 px up: bottom tab bar on mobile, sticky status header, single-column card stacks, print stylesheet for the handwritten sheet.
- Reduced-motion friendly: animations are CSS-only and non-essential.

## Project layout

```
src/
  App.jsx                 session state, solving, toasts, PDF export
  components/
    Header.jsx            brand, status badge, tabs, quick actions, mobile nav
    VoiceTutor.jsx        player, karaoke transcript, timeline, analogy, topic detector
    SocraticMode.jsx      guided questions, hints, discovery map, answer vault
    HandwritingView.jsx   ink sheet, controls, print/focus mode
    AutoDiagram.jsx       diagram selection, vocabulary, trigger log
    SummaryHub.jsx        notes, examples drawer, traps, mastery
    PracticeArena.jsx     adaptive quiz, scoring analytics
    FlashcardHub.jsx      deck, flip cards, SM-2 ratings
    diagrams/             six interactive SVG figures
    ui.jsx                Card, Button, Badge, Drawer, SectionHeader, toggles…
  lib/
    classify.js           topic detection + solution builder
    ocr.js                on-device OCR, crop and screen-capture helpers
    generateQuiz.js       adaptive question generation
    appContext.jsx        app state, tabs, toasts
  hooks/                  narration + voice input
  data/                   authored problems and Socratic scripts
scripts/copy-ocr-assets.mjs   copies Tesseract runtime into public/ocr at build time
```

---

Built as a self-contained demonstration of a voice-first, Socratic math tutor: every control works, nothing is a placeholder.
