# Architecture logicielle -- Démonstrateur pédagogique LLM

## Objectif

Créer une application **front-end only**, déployable sur **GitHub
Pages**, illustrant le fonctionnement d'un LLM au travers d'animations
interactives.

## Technologies retenues

- HTML5
- CSS3
- TypeScript
- SVG (schéma principal)
- Motion (animations)
- Vite (build)

Aucun backend. Aucune API. Aucun stockage serveur.

## Architecture

```text
index.html
│
└── main.ts
    │
    ├── scene.ts
    ├── timeline.ts
    ├── animation.ts
    ├── state.ts
    └── components/
        ├── PromptPanel
        ├── TokenPanel
        ├── EmbeddingPanel
        ├── LogitPanel
        ├── ProbabilityPanel
        ├── ExplanationPanel
        └── Timeline
```

## Schéma principal

Le pipeline est dessiné en SVG.

Le SVG contient uniquement : - boîtes - flèches - flux - halos -
éléments graphiques

Les données (texte, tokens, embeddings, probabilités...) sont rendues en
HTML afin de faciliter leur mise à jour.

## Animation

Chaque étape est pilotée par un scénario.

Exemple :

```ts
[
  "prompt",
  "tokenize",
  "embeddings",
  "transformer",
  "logits",
  "temperature",
  "softmax",
  "sampling",
  "append-token",
  "loop"
];
```

Les animations sont découplées du contenu.

## Barre temporelle

Une barre de progression représente toutes les étapes.

    ○────○────○────○────○────○────○────○

Fonctionnalités : - clic sur une étape ; - animation avant ou arrière
jusqu'à cette étape ; - lecture automatique ; - pause ; - étape
précédente/suivante.

Le formateur peut ainsi naviguer librement pendant son explication.

## État global

Un état unique contient notamment : - prompt courant ; - tokens ; -
embeddings (version pédagogique) ; - logits ; - probabilités ; -
paramètres (température, top-p, top-k...) ; - étape courante.

Tous les composants observent cet état.

## Layout UX

### Structure générale

Le layout est de type **entête / corps / pied** occupant toute la
hauteur de la fenêtre. **Aucun scroll global** : la page ne défile
jamais dans son ensemble.

```text
┌─────────────────────────────────────────────┐
│ HEADER : timeline (plan de ligne de métro)   │  hauteur fixe
├──────────────────────┬──────────────────────┤
│                      │                      │
│  BODY GAUCHE         │  BODY DROITE         │  hauteur flexible
│  étape en cours      │  plan global         │
│  (scrollable)        │  (scrollable si      │
│                      │   nécessaire)        │
│                      │                      │
├──────────────────────┴──────────────────────┤
│ FOOTER : @JLG Consulting 2026 — GitHub       │  hauteur fixe
└─────────────────────────────────────────────┘
```

Mise en œuvre recommandée : conteneur racine en `display: grid`
(ou `flex` colonne) avec `height: 100vh` et
`grid-template-rows: auto 1fr auto`. Le corps utilise deux colonnes
(`grid-template-columns: 1fr 1fr`).

### Header — Timeline

- Affiche le **site-id** « Show LLM » (titre / logo de l'application).
- Affiche la ligne de la timeline **façon plan de ligne de métro**
  (stations = étapes reliées par un trait).
- La timeline peut être **scrollable horizontalement** (un _slider_,
  façon site Netflix) lorsque les étapes dépassent la largeur
  disponible.
- Hauteur fixe, toujours visible.
- Reprend les fonctionnalités de la barre temporelle (clic sur une
  étape, lecture, pause, étape précédente/suivante).

### Body — deux panneaux

L'écran est séparé en deux colonnes (gauche et droite).

**Gauche — étape en cours**

- Montre le détail visuel de l'**étape courante** uniquement.
- Le contenu **change au fur et à mesure des étapes**.
- Zone **scrollable** verticalement (défilement interne au panneau).

**Droite — plan global**

- Montre un **plan global du moteur, du LLM et des phases**.
- Met en évidence la phase active et **reflète les modifications** au
  fil de la progression (l'étape en cours est signalée sur le plan).
- Zone **scrollable si nécessaire** (défilement interne au panneau,
  uniquement si le contenu dépasse la hauteur disponible).

### Footer

- Contenu : `@JLG Consulting 2026` — avec un lien vers le dépôt GitHub
  <https://github.com/jlg-formation/show-llm>.
- Hauteur fixe, **toujours visible** (jamais masqué par le scroll des
  panneaux).

## Principes UX

- une seule idée nouvelle par étape ;
- animations fluides mais sobres ;
- thème clair ;
- desktop only ;
- aucune surcharge visuelle.

## Déploiement

Application statique générée par Vite.

Déploiement cible : - GitHub Pages.

## Évolutions envisagées

- mode Débutant / Expert ;
- vitesse d'animation réglable ;
- exemples de prompts interchangeables ;
- export en mode présentation plein écran ;
- prise en charge d'autres démonstrations (tool calling, RAG, etc.)
  basées sur le même moteur d'animation.
