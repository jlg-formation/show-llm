# show-llm — Agent Instructions

**Demonstrateur pédagogique** illustrant le cycle complet d'inférence d'un LLM, step by step, à destination d'un public non spécialiste.

See full spec: [01-specifications-demonstrateur-llm.md](01-specifications-demonstrateur-llm.md)  
See full architecture: [02-architecture-demonstrateur-llm.md](02-architecture-demonstrateur-llm.md)

---

## Stack

- **Vite 6** + **TypeScript** (strict) — no framework, no SSR, no backend
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (no `tailwind.config.js`)
- **Motion** (`motion` npm package) for animations — NOT Framer Motion
- **SVG** for the schematic panel (data-driven layout in `SchematicPanel.ts`)
- Deployed to GitHub Pages at `https://jlg-formation.github.io/show-llm/`

## Commands

```bash
npm run dev      # http://localhost:5173/show-llm/
npm run build    # tsc && vite build → dist/
npm run preview  # preview built dist/
```

No test suite configured.

## Architecture

### State management

`src/state.ts` — custom pub/sub `Store<T>` (no Redux, no Zustand).  
`src/store.ts` — singleton `store` + actions (`play`, `pause`, `nextStep`, `prevStep`, `goToStep`, `togglePlay`).  
All components call `store.subscribe(listener)` to re-render reactively.

### Step pipeline

`src/scenario.ts` — `STEPS: StepMeta[]` (13 steps, one per LLM pipeline stage).  
`src/data.ts` — `INITIAL_STATE` with fixed prompt `"Le chat dort sur le"`, tokens, embeddings, logits candidates.  
`src/types.ts` — all domain types (`StepId`, `StepMeta`, `Token`, `Embedding`, `Candidate`, `EngineParams`, `AppState`).

Pipeline steps (in order): `prompt → tokenize → embeddings → transformer → logits → topk → softmax → topp → probabilities → sampling → append-token → loop → eos`

### Components (all vanilla TS, return `HTMLElement`)

| File                               | Role                                                       |
| ---------------------------------- | ---------------------------------------------------------- |
| `src/app.ts`                       | Shell grid (header / main / footer), mounts all components |
| `src/components/Timeline.ts`       | Top "metro line" navigator                                 |
| `src/components/Controls.ts`       | Play/pause/prev/next buttons                               |
| `src/components/StepPanel.ts`      | Left panel: step title, idea, detail                       |
| `src/components/stepRenderers.ts`  | Per-step content renderers (one per `StepId`)              |
| `src/components/SchematicPanel.ts` | Right SVG schematic (BOXES + CONTAINERS data-driven)       |
| `src/dom.ts`                       | `h()` and `svgEl()` helpers, `clear()`                     |
| `src/animation.ts`                 | `animateIn()`, `animateTitle()` using Motion               |
| `src/engine.ts`                    | `softmaxWithTemperature()`, `formatProbability()`          |

### Computed values (derived from store state on demand)

- `computedCandidates()` — softmax over all candidates (used in steps 6a/6b/6c)
- `computedFinalCandidates()` — top-k → top-p → renormalized (step 6c result, drives step 7+)
- `chosenToken` — set in store when `stepIndex ≥ samplingIndex`

## Key Conventions

- **DOM helpers**: always use `h(tag, props, ...children)` from `src/dom.ts` — do NOT use `document.createElement` directly
- **SVG elements**: use `svgEl(tag, attrs)` from `src/dom.ts`
- **Alias**: `@` maps to `/src` (configured in `vite.config.ts`)
- **Base path**: always `/show-llm/` — required for assets and routing on GitHub Pages
- **Language**: code comments and variable names in English or French (mixed, existing convention); UI labels in **French**

## Pitfalls

- **Motion `animate()`**: pass `Array.from(NodeList)` (not NodeList directly), use native CSS props (`opacity`, `y`, `x`). Do NOT pass `transform` as a string or use `easing` as a string — TypeScript will pick the wrong overload.
- **Tailwind v4**: no `tailwind.config.js`. Configuration via CSS `@theme` blocks in `src/style.css`.
- **`npm run build`**: runs `tsc` first, then `vite build`. Fix TypeScript errors before investigating Vite build errors.
- **Deployment**: `.github/workflows/deploy.yml` uses `actions/deploy-pages@v4`. `package-lock.json` is required (`npm ci`). Push to `main` triggers auto-deploy.

## SchematicPanel SVG specifics

- `viewBox="0 0 400 700"`, `CENTER_X=190`
- Shapes: `"io"` (parallelogram) for inputs/outputs; `"rect"` for processing nodes
- Dashed container "Moteur d'inférence" wraps nested container "LLM · modèle"
- Dashed loop arrow on the right side
- Layout fully data-driven via `BOXES` and `CONTAINERS` arrays — do not hardcode coordinates
