import type { Candidate } from "./types";

/**
 * Calcul pédagogique des probabilités à partir des logits.
 * Softmax avec température : p_i = exp(logit_i / T) / Σ exp(logit_j / T)
 */
export function softmaxWithTemperature(
  candidates: Candidate[],
  temperature: number
): Candidate[] {
  const t = Math.max(temperature, 1e-6);
  const scaled = candidates.map((c) => c.logit / t);
  const max = Math.max(...scaled);
  const exps = scaled.map((s) => Math.exp(s - max));
  const sum = exps.reduce((acc, e) => acc + e, 0);
  return candidates.map((c, i) => ({
    ...c,
    probability: exps[i] / sum
  }));
}

/** Formate une probabilité en pourcentage lisible. */
export function formatProbability(p: number): string {
  if (p < 0.001) return "< 0,1 %";
  return `${(p * 100).toLocaleString("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })} %`;
}
