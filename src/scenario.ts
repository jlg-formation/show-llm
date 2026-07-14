import type { StepMeta } from "./types";

/**
 * Liste ordonnée des étapes du pipeline d'inférence.
 * Une étape = une idée nouvelle.
 */
export const STEPS: StepMeta[] = [
  {
    id: "prompt",
    label: "Prompt",
    title: "1. Saisie du prompt",
    idea: "Tout commence par une phrase fournie au modèle : le prompt.",
    schematicNode: "prompt"
  },
  {
    id: "tokenize",
    label: "Tokenisation",
    title: "2. Tokenisation",
    idea: "La phrase est découpée en tokens, chacun associé à un identifiant numérique.",
    schematicNode: "tokenizer"
  },
  {
    id: "embeddings",
    label: "Embeddings",
    title: "3. Embeddings",
    idea: "Chaque token est converti en vecteur (embedding) lu dans une table.",
    schematicNode: "embeddings"
  },
  {
    id: "transformer",
    label: "Transformer",
    title: "4. Entrée dans le modèle",
    idea: "Les embeddings traversent le Transformer, une boîte noire à plusieurs couches.",
    schematicNode: "transformer"
  },
  {
    id: "logits",
    label: "Logits",
    title: "5. Sortie du modèle : les logits",
    idea: "Le modèle produit un logit (score brut) pour CHAQUE token du vocabulaire, pas des probabilités.",
    schematicNode: "logits"
  },
  {
    id: "topk",
    label: "Top-k",
    title: "6a. Moteur d'inférence : Top-k (sur les logits)",
    idea: "On classe les logits et on ne garde que les k tokens ayant les scores les plus élevés. Tout le reste est écarté.",
    schematicNode: "engine"
  },
  {
    id: "softmax",
    label: "Softmax",
    title: "6b. Moteur d'inférence : Softmax (avec température)",
    idea: "Sur les candidats restants, la température ajuste les écarts puis un unique Softmax les transforme en probabilités.",
    schematicNode: "engine"
  },
  {
    id: "topp",
    label: "Top-p",
    title: "6c. Moteur d'inférence : Top-p (+ renormalisation)",
    idea: "On garde juste assez de tokens pour cumuler p % de la masse, puis on renormalise leurs probabilités.",
    schematicNode: "engine"
  },
  {
    id: "probabilities",
    label: "Probabilités",
    title: "6d. Moteur d'inférence : probabilités finales",
    idea: "Les tokens cohérents ont une forte probabilité ; les surprenants (forte perplexité) une probabilité minuscule.",
    schematicNode: "engine"
  },
  {
    id: "sampling",
    label: "Choix",
    title: "7. Choix du prochain token",
    idea: "Le moteur échantillonne un token — pas forcément le plus probable.",
    schematicNode: "probabilities"
  },
  {
    id: "append-token",
    label: "Nouveau prompt",
    title: "8. Construction de la nouvelle phrase",
    idea: "Le token choisi est ajouté au prompt, qui grandit d'un token.",
    schematicNode: "output"
  },
  {
    id: "loop",
    label: "Boucle",
    title: "9. Boucle d'inférence",
    idea: "Le cycle recommence avec le nouveau prompt, token après token.",
    schematicNode: "prompt"
  },
  {
    id: "eos",
    label: "Fin",
    title: "10. Fin de génération",
    idea: "La génération s'arrête sur un token de fin (EOS) ou une autre condition d'arrêt.",
    schematicNode: "end"
  }
];
