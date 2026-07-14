import { Store } from "./state";
import { INITIAL_STATE } from "./data";
import { STEPS } from "./scenario";
import { softmaxWithTemperature } from "./engine";
import type { AppState } from "./types";

/** Instance unique du store global. */
export const store = new Store<AppState>(INITIAL_STATE);

let playTimer: ReturnType<typeof setInterval> | null = null;

/** Durée d'une étape en lecture automatique (ms). */
const AUTOPLAY_INTERVAL = 2600;

/** Va à une étape précise (bornée sur la liste des étapes). */
export function goToStep(index: number): void {
  const clamped = Math.max(0, Math.min(STEPS.length - 1, index));
  // Le token est « choisi » dès que l'on atteint l'étape d'échantillonnage.
  const samplingIndex = STEPS.findIndex((s) => s.id === "sampling");
  const chosenToken =
    clamped >= samplingIndex
      ? (computedFinalCandidates()[0]?.text ?? null)
      : null;
  store.set({ stepIndex: clamped, chosenToken });
}

/** Étape suivante. */
export function nextStep(): void {
  const { stepIndex } = store.get();
  if (stepIndex >= STEPS.length - 1) {
    pause();
    return;
  }
  goToStep(stepIndex + 1);
}

/** Étape précédente. */
export function prevStep(): void {
  goToStep(store.get().stepIndex - 1);
}

/** Lecture automatique. */
export function play(): void {
  if (store.get().playing) return;
  store.set({ playing: true });
  playTimer = setInterval(() => {
    const { stepIndex } = store.get();
    if (stepIndex >= STEPS.length - 1) {
      pause();
      return;
    }
    nextStep();
  }, AUTOPLAY_INTERVAL);
}

/** Pause de la lecture automatique. */
export function pause(): void {
  if (playTimer) {
    clearInterval(playTimer);
    playTimer = null;
  }
  store.set({ playing: false });
}

/** Bascule lecture / pause. */
export function togglePlay(): void {
  if (store.get().playing) pause();
  else play();
}

/**
 * Probabilités dérivées de l'état courant (logits + température).
 * Calculées à la demande pour rester cohérentes avec les paramètres.
 */
export function computedCandidates() {
  const { candidates, params } = store.get();
  return softmaxWithTemperature(candidates, params.temperature).sort(
    (a, b) => b.probability - a.probability
  );
}

/**
 * Candidats FINAUX du moteur d'inférence : résultat de l'étape 6c.
 * On applique successivement top-k, top-p, puis on renormalise la masse
 * de probabilité des tokens survivants afin qu'elle somme de nouveau à 1.
 * C'est cette distribution qui est visualisée (étape 7) puis échantillonnée.
 */
export function computedFinalCandidates() {
  const { params } = store.get();
  // Top-k : on ne garde que les k tokens aux plus fortes probabilités.
  const afterTopK = computedCandidates().slice(0, params.topK);

  // Top-p : on garde les tokens tant que la masse cumulée AVANT eux
  // n'a pas atteint le seuil p.
  let cum = 0;
  const kept = afterTopK.filter((c) => {
    const keep = cum < params.topP;
    cum += c.probability;
    return keep;
  });

  // Renormalisation sur la masse conservée.
  const keptMass = kept.reduce((acc, c) => acc + c.probability, 0) || 1;
  return kept.map((c) => ({ ...c, probability: c.probability / keptMass }));
}
