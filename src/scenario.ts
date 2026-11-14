import type { Mode, StepId, StepMeta } from "./types";

/**
 * Étapes du mode Texte : liste ordonnée du pipeline d'inférence.
 * Une étape = une idée nouvelle.
 */
const TEXT_STEPS: StepMeta[] = [
  {
    id: "prompt",
    label: "Prompt",
    title: "1. Saisie du prompt",
    idea: "Tout commence par une phrase fournie au modèle : le prompt.",
    schematicNode: "prompt",
  },
  {
    id: "tokenize",
    label: "Tokenisation",
    title: "2. Tokenisation",
    idea: "La phrase est découpée en tokens, chacun associé à un identifiant numérique.",
    schematicNode: "tokenizer",
  },
  {
    id: "embeddings",
    label: "Embeddings",
    title: "3. Embeddings",
    idea: "Chaque token est converti en vecteur (embedding) lu dans une table.",
    schematicNode: "embeddings",
  },
  {
    id: "transformer",
    label: "Transformer",
    title: "4. Entrée dans le modèle",
    idea: "Les embeddings traversent le Transformer, une boîte noire à plusieurs couches.",
    schematicNode: "transformer",
  },
  {
    id: "logits",
    label: "Logits",
    title: "5. Sortie du modèle : les logits",
    idea: "Le modèle produit un logit (score brut) pour CHAQUE token du vocabulaire, pas des probabilités.",
    schematicNode: "logits",
  },
  {
    id: "topk",
    label: "Top-k",
    title: "6a. Moteur d'inférence : Top-k (sur les logits)",
    idea: "On classe les logits et on ne garde que les k tokens ayant les scores les plus élevés. Tout le reste est écarté.",
    schematicNode: "engine",
  },
  {
    id: "softmax",
    label: "Softmax",
    title: "6b. Moteur d'inférence : Softmax (avec température)",
    idea: "Sur les candidats restants, la température ajuste les écarts puis un unique Softmax les transforme en probabilités.",
    schematicNode: "engine",
  },
  {
    id: "topp",
    label: "Top-p",
    title: "6c. Moteur d'inférence : Top-p (+ renormalisation)",
    idea: "On garde juste assez de tokens pour cumuler p % de la masse, puis on renormalise leurs probabilités.",
    schematicNode: "engine",
  },
  {
    id: "probabilities",
    label: "Probabilités",
    title: "6d. Moteur d'inférence : probabilités finales",
    idea: "Les tokens cohérents ont une forte probabilité ; les surprenants (forte perplexité) une probabilité minuscule.",
    schematicNode: "engine",
  },
  {
    id: "sampling",
    label: "Choix",
    title: "7. Choix du prochain token",
    idea: "Le moteur échantillonne un token — pas forcément le plus probable.",
    schematicNode: "probabilities",
  },
  {
    id: "append-token",
    label: "Nouveau prompt",
    title: "8. Construction de la nouvelle phrase",
    idea: "Le token choisi est ajouté au prompt, qui grandit d'un token.",
    schematicNode: "output",
  },
  {
    id: "loop",
    label: "Boucle",
    title: "9. Boucle d'inférence",
    idea: "Le cycle recommence avec le nouveau prompt, token après token.",
    schematicNode: "prompt",
  },
  {
    id: "eos",
    label: "Fin",
    title: "10. Fin de génération",
    idea: "La génération s'arrête sur un token de fin (EOS) ou une autre condition d'arrêt.",
    schematicNode: "end",
  },
];

function textStep(id: StepId): StepMeta {
  const step = TEXT_STEPS.find((s) => s.id === id);
  if (!step) throw new Error(`Étape inconnue : ${id}`);
  return step;
}

/**
 * Étapes du mode Texte + image : les étapes d'image sont insérées avant le
 * Transformer, tout le reste est réutilisé du mode Texte.
 */
const IMAGE_STEPS: StepMeta[] = [
  {
    ...textStep("prompt"),
    title: "1. Saisie du prompt (image + texte)",
    idea: "Le LLM reçoit une image accompagnée d'une question : le prompt est maintenant multimodal.",
  },
  {
    ...textStep("tokenize"),
    title: "2. Tokenisation (texte seul)",
    idea: "Seule la question est tokenisée en tokens. L'image suit un chemin différent.",
  },
  {
    ...textStep("embeddings"),
    title: "3. Embeddings (texte seul)",
    idea: "Chaque token de la question est converti en vecteur (embedding) lu dans une table.",
  },
  {
    id: "patches",
    label: "Patches",
    title: "3a. Image : découpage en patches",
    idea: "L'image est une grille de pixels, découpée en petits carrés : les patches.",
    schematicNode: "patches",
    imageOnly: true,
  },
  {
    id: "vision-encoder",
    label: "Encodeur visuel",
    title: "3b. Image : encodeur visuel",
    idea: "Un encodeur visuel transforme chaque patch en un vecteur.",
    schematicNode: "vision-encoder",
    imageOnly: true,
  },
  {
    id: "image-tokens",
    label: "Tokens image",
    title: "3c. Image : projecteur et tokens image",
    idea: "Un projecteur adapte ces vecteurs à l'espace du LLM : ce sont les tokens image, sans identifiant de vocabulaire.",
    schematicNode: "projector",
    imageOnly: true,
  },
  {
    id: "sequence",
    label: "Séquence",
    title: "3d. Assemblage de la séquence",
    idea: "Tokens image et tokens texte sont mis bout à bout dans une seule séquence.",
    schematicNode: "sequence",
    imageOnly: true,
  },
  {
    ...textStep("transformer"),
    idea: "Image et texte traversent le même Transformer, une boîte noire à plusieurs couches.",
  },
  textStep("logits"),
  textStep("topk"),
  textStep("softmax"),
  textStep("topp"),
  textStep("probabilities"),
  textStep("sampling"),
  textStep("append-token"),
  {
    ...textStep("loop"),
    idea: "Le cycle recommence avec le nouveau prompt ; l'image, déjà encodée, n'est pas retraitée.",
  },
  textStep("eos"),
];

/** Étapes du scénario correspondant au mode. */
export function stepsFor(mode: Mode): StepMeta[] {
  return mode === "image" ? IMAGE_STEPS : TEXT_STEPS;
}
