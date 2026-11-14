import { Store } from "./state";
import { IMAGE_PROMPT_DATA, INITIAL_STATE, TEXT_PROMPT_DATA } from "./data";
import { stepsFor } from "./scenario";
import { softmaxWithTemperature } from "./engine";
import type { AppState, Mode } from "./types";

/** Instance unique du store global. */
export const store = new Store<AppState>(INITIAL_STATE);

/** Va à une étape précise (bornée sur la liste des étapes du mode). */
export function goToStep(index: number): void {
  const steps = stepsFor(store.get().mode);
  const clamped = Math.max(0, Math.min(steps.length - 1, index));
  // Le token est « choisi » dès que l'on atteint l'étape d'échantillonnage.
  const samplingIndex = steps.findIndex((s) => s.id === "sampling");
  const chosenToken =
    clamped >= samplingIndex
      ? (computedFinalCandidates()[0]?.text ?? null)
      : null;
  store.set({ stepIndex: clamped, chosenToken });
}

/** Étape suivante. */
export function nextStep(): void {
  goToStep(store.get().stepIndex + 1);
}

/** Étape précédente. */
export function prevStep(): void {
  goToStep(store.get().stepIndex - 1);
}

/** Change de mode d'entrée et revient à la première étape. */
export function setMode(mode: Mode): void {
  if (store.get().mode === mode) return;
  const data = mode === "image" ? IMAGE_PROMPT_DATA : TEXT_PROMPT_DATA;
  store.set({ mode, ...data, stepIndex: 0, chosenToken: null });
}

/**
 * Probabilités dérivées de l'état courant (logits + température).
 * Calculées à la demande pour rester cohérentes avec les paramètres.
 */
export function computedCandidates() {
  const { candidates, params } = store.get();
  return softmaxWithTemperature(candidates, params.temperature).sort(
    (a, b) => b.probability - a.probability,
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
