import type { AppState, Candidate, Embedding, Token } from "./types";

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
  { text: " le", id: 402 }
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
  { tokenText: " le", values: [0.14, -0.4, 0.83, -0.18, 0.08, 0.6] }
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
  { text: "porte-avions", logit: -5.1, probability: 0, surprising: true }
];

/** ~200 000 pour les modèles OpenAI récents (tokenizer o200k_base). */
const VOCAB_SIZE = 200_000;

export const INITIAL_STATE: AppState = {
  prompt: PROMPT,
  tokens: TOKENS,
  embeddings: EMBEDDINGS,
  candidates: CANDIDATES,
  params: {
    temperature: 0.8,
    topK: 40,
    topP: 0.9
  },
  vocabSize: VOCAB_SIZE,
  chosenToken: null,
  stepIndex: 0,
  playing: false
};
