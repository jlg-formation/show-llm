// Types du domaine — démonstrateur pédagogique LLM

/** Identifiant d'une étape du pipeline d'inférence. */
export type StepId =
  | "prompt"
  | "tokenize"
  | "embeddings"
  | "transformer"
  | "logits"
  | "topk"
  | "softmax"
  | "topp"
  | "probabilities"
  | "sampling"
  | "append-token"
  | "loop"
  | "eos";

/** Métadonnées d'une étape (affichées dans la timeline et les panneaux). */
export interface StepMeta {
  id: StepId;
  /** Libellé court (station de la timeline). */
  label: string;
  /** Titre affiché dans le panneau gauche. */
  title: string;
  /** Une seule idée nouvelle par étape. */
  idea: string;
  /** Phase du plan global mise en évidence (id de boîte SVG). */
  schematicNode: SchematicNodeId;
}

/** Identifiant d'une boîte du schéma SVG (plan global). */
export type SchematicNodeId =
  | "prompt"
  | "tokenizer"
  | "embeddings"
  | "transformer"
  | "logits"
  | "engine"
  | "probabilities"
  | "output"
  | "end";

/** Un token issu de la tokenisation. */
export interface Token {
  /** Texte affiché du token (peut inclure une espace de tête). */
  text: string;
  /** Identifiant numérique du token dans le vocabulaire. */
  id: number;
}

/** Représentation pédagogique d'un embedding (quelques dimensions symboliques). */
export interface Embedding {
  tokenText: string;
  /** Valeurs normalisées entre -1 et 1 pour la visualisation. */
  values: number[];
}

/** Un candidat de token de sortie avec son logit, sa probabilité, etc. */
export interface Candidate {
  text: string;
  /** Score brut produit par le Transformer (peut être négatif). */
  logit: number;
  /** Probabilité après Softmax (0..1), calculée à l'exécution. */
  probability: number;
  /** Candidat cohérent (faible perplexité) ou surprenant (forte perplexité). */
  surprising: boolean;
}

/** Paramètres du moteur d'inférence. */
export interface EngineParams {
  temperature: number;
  topK: number;
  topP: number;
}

/** État global unique observé par tous les composants. */
export interface AppState {
  prompt: string;
  tokens: Token[];
  embeddings: Embedding[];
  candidates: Candidate[];
  params: EngineParams;
  vocabSize: number;
  /** Token choisi par l'échantillonnage. */
  chosenToken: string | null;
  /** Index de l'étape courante dans la liste STEPS. */
  stepIndex: number;
  /** Lecture automatique en cours. */
  playing: boolean;
}
