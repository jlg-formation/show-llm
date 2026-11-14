# show-llm — Agent Instructions

**Demonstrateur pédagogique** illustrant le cycle complet d'inférence d'un LLM, step by step, à destination d'un public non spécialiste.

See full spec: [docs/01-specifications-demonstrateur-llm.md](docs/01-specifications-demonstrateur-llm.md)  
See full architecture: [docs/02-architecture-demonstrateur-llm.md](docs/02-architecture-demonstrateur-llm.md)

Project documentation lives in `docs/`.  
Mode "Texte + image" (multimodal LLM), implemented: [docs/03-evolution-mode-image.md](docs/03-evolution-mode-image.md).

---

## Stack

- **Vite 6** + **TypeScript** (strict) — no framework, no SSR, no backend
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (no `tailwind.config.js`)
- **Motion** (`motion` npm package) for animations — NOT Framer Motion
- **SVG** for the schematic panel (data-driven layout in `SchematicPanel.ts`)
- Deployed to GitHub Pages at `https://jlg-formation.github.io/show-llm/`

## Commands

```bash
mise install     # installs Bun (version pinned in mise.toml)
bun install      # install dependencies (bun.lock)
bun run dev      # http://localhost:5173/show-llm/
bun run build    # tsc && vite build → dist/
bun run preview  # preview built dist/
```

No test suite configured.

## Architecture

### State management

`src/state.ts` — custom pub/sub `Store<T>` (no Redux, no Zustand).  
`src/store.ts` — singleton `store` + actions (`nextStep`, `prevStep`, `goToStep`, `setMode`). No autoplay: navigation is always manual.  
All components call `store.subscribe(listener)` to re-render reactively.

### Modes

`AppState.mode` is `"text"` (default) or `"image"` (text + image). `setMode()` swaps prompt/tokens/embeddings and goes back to step 0. Components that depend on the step list (Timeline, Controls, StepPanel, SchematicPanel) rebuild when the mode changes.

### Step pipeline

`src/scenario.ts` — `stepsFor(mode): StepMeta[]`: 13 steps in text mode, 17 in image mode (4 image steps inserted before `transformer`, flagged `imageOnly`).  
`src/data.ts` — `INITIAL_STATE` with fixed prompt `"Le chat dort sur le"`, tokens, embeddings, logits candidates; `IMAGE_PROMPT_DATA` and `IMAGE_DEMO` (224 px image, 16 px patches, 14×14 grid) for image mode.  
`src/types.ts` — all domain types (`StepId`, `StepMeta`, `Mode`, `Token`, `Embedding`, `Candidate`, `EngineParams`, `ImageDemo`, `AppState`).

Text-mode steps (in order): `prompt → tokenize → embeddings → transformer → logits → topk → softmax → topp → probabilities → sampling → append-token → loop → eos`

Image mode inserts `patches → vision-encoder → image-tokens → sequence` after `embeddings`.

### Components (all vanilla TS, return `HTMLElement`)

| File                               | Role                                                         |
| ---------------------------------- | ------------------------------------------------------------ |
| `src/app.ts`                       | Shell grid (header / 3-col main / footer), mounts components |
| `src/components/Timeline.ts`       | Left sidebar: vertical "metro line" navigator (scrollable)   |
| `src/components/Controls.ts`       | Prev/next buttons + step counter                             |
| `src/components/ModeToggle.ts`     | Text / Text + image switch                                   |
| `src/components/catImage.ts`       | SVG demo image, patch grid and patch zoom                    |
| `src/components/StepPanel.ts`      | Left panel: step title, idea, detail                         |
| `src/components/stepRenderers.ts`  | Per-step content renderers (one per `StepId`)                |
| `src/components/SchematicPanel.ts` | Right SVG schematic (BOXES + CONTAINERS data-driven)         |
| `src/dom.ts`                       | `h()` and `svgEl()` helpers, `clear()`                       |
| `src/animation.ts`                 | `animateIn()`, `animateTitle()` using Motion                 |
| `src/engine.ts`                    | `softmaxWithTemperature()`, `formatProbability()`            |

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
- **`bun run build`**: runs `tsc` first, then `vite build`. Fix TypeScript errors before investigating Vite build errors.
- **Deployment**: `.github/workflows/deploy.yml` uses `actions/deploy-pages@v4`. `bun.lock` is required (`bun install --frozen-lockfile`); Bun is installed in CI via `jdx/mise-action` from `mise.toml`. Push to `main` triggers auto-deploy.

## SchematicPanel SVG specifics

- `viewBox="0 0 400 H"` with `H=760` (text) or `864` (image), `CENTER_X=190`; the SVG is scaled to fit the panel (no scroll)
- Shapes: `"io"` (parallelogram) for inputs/outputs; `"rect"` for processing nodes
- Dashed container "Moteur d'inférence" wraps nested container "LLM · modèle"
- Dashed loop arrow on the right side
- Layout is data-driven per mode (`textLayout()` / `imageLayout()` returning boxes, containers and edges) — do not hardcode coordinates elsewhere; the SVG is rebuilt on mode change
- Image mode: text branch on the left, image branch (violet, `image: true`) on the right, merging in the `sequence` box
