# AGENTS.md — Lucid Brand Strategy Tool

## What is this?
Lucid is a browser-based brand strategy tool for small creative agencies (2–15 people) and freelance creative directors. It has an AI partner called Lucy who provides Guide/Challenge/Co-create feedback styled as a senior brand strategist.

## Architecture

```
src/
  app/
    page.tsx           ← App shell, router, shared project state
    layout.tsx         ← Root layout with font imports
  lib/
    tokens.js          ← Design system (colors, shadows, easing, fonts)
    lucy.js            ← AI logic (system prompts, API calls, fallbacks)
  components/
    ui.jsx             ← Shared UI components
  modules/
    Dashboard.jsx      ← Project list, Lucy greeting
    Discovery.jsx      ← Client brief → questions → gap analysis
    BrandPersonality.jsx ← 9 writing prompts, Spark/Keep interaction
    TensionPairs.jsx   ← Toggle selection, selected float to top
    CoreValues.jsx     ← Value cards with Lucy refine
    ToneOfVoice.jsx    ← TX-6 fader sliders
    USPs.jsx           ← Write → Lucy expands → lead/supporting
    Manifesto.jsx      ← Lucy drafts → redline → notes → rewrite
    Summary.jsx        ← Accordion cards, copy buttons, celebration
```

## Design System

### Colors (defined in `lib/tokens.js`)
- Body: `#E8E3DA` — main canvas
- Panel: `#DDD8CE` — header, footer
- Recess: `#D2CEC4` — input backgrounds
- Card: `#EEEAE2` — elevated surfaces
- Accent: `#D4734A` — terracotta, actions, Lucy's thinking state
- Text: `#3D3830` — primary text
- Screen: `#1E1B17` — Lucy's dark world (exclusively hers)
- LCD: `#7A9A7A` — Lucy's idle text
- LCD Bright: `#A0C8A0` — Lucy's success/approval text
- LCD Dim: `#2E3A2E` — Lucy's muted text

### Fonts
- **Inter** — all UI text
- **DotGothic16** — Lucy's pixel screens (always at multiples of 16px, scaled with transform)
- **Silkscreen** — pixel labels (rarely used)

### Easing
- `cubic-bezier(0.22, 1, 0.36, 1)` — all animations

### Key Principles
- **Lucy's dark screen is exclusively hers** — no other UI element uses `#1E1B17` background
- **Every long AI operation gets cinematic treatment** — full dark screen takeover with step messages
- **Notes accumulate before triggering a rewrite** — not immediate
- **⌘+Enter** is the universal "done, move forward" shortcut
- **No Tailwind** — all styles are inline using design tokens
- **No generic SaaS patterns** — this should feel like Teenage Engineering designed a strategy tool

## Component Conventions

### Use shared components from `components/ui.jsx`:
- `TransportBtn` — the gradient machined button. Use this, never write custom buttons.
- `LucyMini` — compact Lucy status display for footers
- `LucyScreen` — full interactive Lucy screen with hover grid
- `PixelIcon` — 5x5 pixel grid icon renderer
- `Cinematic` — dark screen loading transition
- `Header` — app header with LUCID badge
- `PageShell` — viewport wrapper
- `ScrollArea` — scrollable content area
- `Canvas` — centered content (560px max-width)

### Module pattern:
Each module receives `onComplete` and `onBack` props from the shell. Call `onComplete(data)` when the module is done to pass data to the next module and navigate forward.

## Lucy's Character
Lucy is a senior brand strategist and creative director. She is:
- Opinionated — she has a point of view
- Warm but direct — never passive-aggressive
- Writes with craft — every word chosen
- Challenges weak thinking — doesn't accept vague answers
- Never uses: "leverage", "synergy", "innovative", bullet points in prose, corporate language

## What NOT to Do
- Don't use Tailwind classes — use `colors`, `S`, or inline styles from tokens
- Don't use generic UI libraries (shadcn, etc.) — everything is custom
- Don't mimic Lucy's dark screen for non-Lucy elements
- Don't use loading spinners — use Cinematic transitions
- Don't write corporate copy — Lucy speaks like a person, not a brand guidelines PDF
- Don't add bullet points in manifesto or brand prose output
- Don't use `localStorage` — use the project state in the app shell (persistence via database later)

## AI Integration
Lucy's AI calls go through `lib/lucy.js`. In development, API calls may timeout and fallbacks kick in. In production, connect to the Anthropic API with proper auth. The system prompt and all AI functions are centralized in this file.

## Tech Stack
- Next.js 15 (App Router)
- TypeScript
- React 19
- No CSS framework — inline styles with design tokens
- Anthropic API for Lucy's AI
