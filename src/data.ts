import type { AppState, Candidate, Embedding, ImageDemo, Token } from "./types";

/**
 * Données figées du scénario pédagogique.
 * Prompt : « Le chat dort sur le »
 */

const PROMPT = "Le chat dort sur le";

const TOKENS: Token[] = [
  { text: "Le", id: 2374 },
  { text: " chat", id: 15821 },
  { text: " dort", id: 40192 },
  { text: " sur", id: 1290 },
  { text: " le", id: 402 },
];

/**
 * Embeddings pédagogiques : quelques dimensions symboliques seulement
 * (les vrais embeddings ont des centaines/milliers de dimensions).
 */
const EMBEDDINGS: Embedding[] = [
  { tokenText: "Le", values: [0.12, -0.44, 0.87, -0.21, 0.05, 0.63] },
  { tokenText: " chat", values: [0.91, 0.34, -0.15, 0.72, -0.58, 0.11] },
  { tokenText: " dort", values: [-0.33, 0.68, 0.24, -0.79, 0.41, -0.5] },
  { tokenText: " sur", values: [0.05, -0.12, 0.55, 0.31, -0.22, 0.44] },
  { tokenText: " le", values: [0.14, -0.4, 0.83, -0.18, 0.08, 0.6] },
];

/**
 * Candidats de sortie avec leurs logits bruts.
 * Les probabilités sont calculées à l'exécution (Softmax) — voir engine.ts.
 * On inclut des candidats cohérents et des candidats surprenants
 * (forte perplexité) pour montrer que tout le vocabulaire est évalué.
 */
const CANDIDATES: Candidate[] = [
  { text: "canapé", logit: 8.2, probability: 0, surprising: false },
  { text: "fauteuil", logit: 7.1, probability: 0, surprising: false },
  { text: "lit", logit: 6.8, probability: 0, surprising: false },
  { text: "tapis", logit: 6.3, probability: 0, surprising: false },
  { text: "rebord", logit: 4.9, probability: 0, surprising: false },
  { text: "hélicoptère", logit: -3.4, probability: 0, surprising: true },
  { text: "porte-avions", logit: -5.1, probability: 0, surprising: true },
];

/** ~200 000 pour les modèles OpenAI récents (tokenizer o200k_base). */
const VOCAB_SIZE = 200_000;

/** Données d'entrée propres à un mode (prompt, tokens, embeddings). */
export interface PromptData {
  prompt: string;
  tokens: Token[];
  embeddings: Embedding[];
}

export const TEXT_PROMPT_DATA: PromptData = {
  prompt: PROMPT,
  tokens: TOKENS,
  embeddings: EMBEDDINGS,
};

/** Mode image : la question suivie du début de la réponse. */
const IMAGE_PROMPT = "Où dort le chat ? Le chat dort sur le";

const IMAGE_TOKENS: Token[] = [
  { text: "Où", id: 6211 },
  { text: " dort", id: 40192 },
  { text: " le", id: 402 },
  { text: " chat", id: 15821 },
  { text: " ?", id: 1031 },
  { text: " Le", id: 3187 },
  { text: " chat", id: 15821 },
  { text: " dort", id: 40192 },
  { text: " sur", id: 1290 },
  { text: " le", id: 402 },
];

const EXTRA_EMBEDDINGS: Embedding[] = [
  { tokenText: "Où", values: [-0.52, 0.19, -0.31, 0.66, 0.08, -0.27] },
  { tokenText: " ?", values: [0.02, 0.09, -0.11, 0.04, 0.15, -0.06] },
  { tokenText: " Le", values: [0.1, -0.41, 0.85, -0.2, 0.06, 0.61] },
];

const IMAGE_EMBEDDINGS: Embedding[] = IMAGE_TOKENS.map((t) => {
  const known = [...EMBEDDINGS, ...EXTRA_EMBEDDINGS].find(
    (e) => e.tokenText === t.text,
  );
  return known ?? { tokenText: t.text, values: [] };
});

export const IMAGE_PROMPT_DATA: PromptData = {
  prompt: IMAGE_PROMPT,
  tokens: IMAGE_TOKENS,
  embeddings: IMAGE_EMBEDDINGS,
};

/**
 * Image de démonstration (ViT-B/16) : 224 px, patches de 16 px,
 * soit une grille de 14 × 14 = 196 patches. Les vecteurs sont symboliques.
 */
export const IMAGE_DEMO: ImageDemo = {
  size: 224,
  patchSize: 16,
  grid: 14,
  focusPatch: { row: 8, col: 9 },
  pixels: [
    { label: "fourrure", rgb: [232, 160, 76] },
    { label: "museau", rgb: [228, 138, 138] },
    { label: "paupière", rgb: [59, 42, 32] },
  ],
  samples: [
    {
      row: 0,
      col: 0,
      encoded: [-0.21, 0.55, 0.08, -0.47, 0.12, 0.3],
      projected: [0.33, -0.12, 0.61, 0.09, -0.4, 0.25],
    },
    {
      row: 8,
      col: 9,
      encoded: [0.64, -0.32, 0.19, 0.71, -0.58, 0.07],
      projected: [0.52, 0.41, -0.27, 0.15, 0.66, -0.3],
    },
    {
      row: 9,
      col: 4,
      encoded: [0.58, 0.12, -0.44, 0.36, -0.09, 0.52],
      projected: [-0.18, 0.47, 0.35, -0.62, 0.21, 0.14],
    },
    {
      row: 10,
      col: 2,
      encoded: [-0.49, 0.27, 0.63, -0.11, 0.4, -0.35],
      projected: [0.07, -0.54, 0.28, 0.44, -0.16, 0.59],
    },
  ],
};

export const INITIAL_STATE: AppState = {
  mode: "text",
  ...TEXT_PROMPT_DATA,
  candidates: CANDIDATES,
  params: {
    temperature: 0.8,
    topK: 40,
    topP: 0.9,
  },
  vocabSize: VOCAB_SIZE,
  chosenToken: null,
  stepIndex: 0,
};
