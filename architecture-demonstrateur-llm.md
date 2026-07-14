# Architecture logicielle -- Démonstrateur pédagogique LLM

## Objectif

Créer une application **front-end only**, déployable sur **GitHub
Pages**, illustrant le fonctionnement d'un LLM au travers d'animations
interactives.

## Technologies retenues

-   HTML5
-   CSS3
-   TypeScript
-   SVG (schéma principal)
-   Motion (animations)
-   Vite (build)

Aucun backend. Aucune API. Aucun stockage serveur.

## Architecture

``` text
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

``` ts
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
]
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

## Principes UX

-   une seule idée nouvelle par étape ;
-   animations fluides mais sobres ;
-   thème clair ;
-   responsive ;
-   aucune surcharge visuelle.

## Déploiement

Application statique générée par Vite.

Déploiement cible : - GitHub Pages.

## Évolutions envisagées

-   mode Débutant / Expert ;
-   vitesse d'animation réglable ;
-   exemples de prompts interchangeables ;
-   export en mode présentation plein écran ;
-   prise en charge d'autres démonstrations (tool calling, RAG, etc.)
    basées sur le même moteur d'animation.
