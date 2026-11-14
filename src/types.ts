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
  | "eos"
  // Étapes propres au mode « Texte + image ».
  | "patches"
  | "vision-encoder"
  | "image-tokens"
  | "sequence";

/** Mode d'entrée du LLM : texte seul ou texte + image. */
export type Mode = "text" | "image";

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
  /** Station propre au traitement de l'image (signalée dans la timeline). */
  imageOnly?: boolean;
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
  | "end"
  | "patches"
  | "vision-encoder"
  | "projector"
  | "sequence";

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

/** Vecteurs symboliques d'un patch avant et après le projecteur. */
export interface ImagePatchSample {
  row: number;
  col: number;
  /** Sortie de l'encodeur visuel. */
  encoded: number[];
  /** Sortie du projecteur (espace d'embeddings du LLM). */
  projected: number[];
}

/** Données pédagogiques de l'image de démonstration. */
export interface ImageDemo {
  /** Côté de l'image, en pixels. */
  size: number;
  /** Côté d'un patch, en pixels. */
  patchSize: number;
  /** Nombre de patches par côté. */
  grid: number;
  /** Patch mis en évidence (zoom sur ses pixels). */
  focusPatch: { row: number; col: number };
  /** Longueur d'un vecteur en sortie de l'encodeur visuel (exemple). */
  encoderDim: number;
  /** Longueur d'un embedding du LLM, cible du projecteur (exemple). */
  llmDim: number;
  /** Quelques pixels du patch mis en évidence. */
  pixels: { label: string; rgb: [number, number, number] }[];
  samples: ImagePatchSample[];
}

/** Dimensions réelles d'un LLM open weight. */
export interface OpenModel {
  name: string;
  layers: number;
  /** Longueur d'un embedding (dimension cachée du modèle). */
  embeddingDim: number;
  /** Taille du vocabulaire = longueur du vecteur de logits. */
  vocabSize: number;
}

/** Paramètres du moteur d'inférence. */
export interface EngineParams {
  temperature: number;
  topK: number;
  topP: number;
}

/** État global unique observé par tous les composants. */
export interface AppState {
  /** Mode d'entrée : texte seul ou texte + image. */
  mode: Mode;
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
}
