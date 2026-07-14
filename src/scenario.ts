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
    id: "temperature",
    label: "Température",
    title: "6a. Moteur d'inférence : température",
    idea: "Le moteur d'inférence applique la température pour accentuer ou lisser les écarts entre logits.",
    schematicNode: "engine"
  },
  {
    id: "topk-topp",
    label: "Top-k / Top-p",
    title: "6b. Moteur d'inférence : filtres",
    idea: "Des filtres (top-k, top-p…) restreignent les candidats retenus.",
    schematicNode: "engine"
  },
  {
    id: "softmax",
    label: "Softmax",
    title: "6c. Moteur d'inférence : Softmax",
    idea: "Un unique Softmax transforme les logits filtrés en probabilités qui somment à 1.",
    schematicNode: "engine"
  },
  {
    id: "probabilities",
    label: "Probabilités",
    title: "7. Visualisation des probabilités",
    idea: "Les tokens cohérents ont une forte probabilité ; les surprenants (forte perplexité) une probabilité minuscule.",
    schematicNode: "probabilities"
  },
  {
    id: "sampling",
    label: "Choix",
    title: "8. Choix du prochain token",
    idea: "Le moteur échantillonne un token — pas forcément le plus probable.",
    schematicNode: "engine"
  },
  {
    id: "append-token",
    label: "Nouveau prompt",
    title: "9. Construction de la nouvelle phrase",
    idea: "Le token choisi est ajouté au prompt, qui grandit d'un token.",
    schematicNode: "output"
  },
  {
    id: "loop",
    label: "Boucle",
    title: "10. Boucle d'inférence",
    idea: "Le cycle recommence avec le nouveau prompt, token après token.",
    schematicNode: "prompt"
  },
  {
    id: "eos",
    label: "Fin",
    title: "11. Fin de génération",
    idea: "La génération s'arrête sur un token de fin (EOS) ou une autre condition d'arrêt.",
    schematicNode: "output"
  }
];
