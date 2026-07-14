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
    clamped >= samplingIndex ? (computedCandidates()[0]?.text ?? null) : null;
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
