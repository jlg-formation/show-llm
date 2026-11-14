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
  "loop",
];
```

Les animations sont découplées du contenu.

## Barre temporelle

Une barre de progression représente toutes les étapes. Elle est
verticale et placée dans une barre latérale gauche.

    ○
    │
    ○
    │
    ○

Fonctionnalités : - clic sur une étape ; - animation avant ou arrière
jusqu'à cette étape ; - étape précédente/suivante. Il n'y a pas de lecture
automatique : la progression est toujours manuelle.

Le formateur peut ainsi naviguer librement pendant son explication.

## État global

Un état unique contient notamment : - prompt courant ; - tokens ; -
embeddings (version pédagogique) ; - logits ; - probabilités ; -
paramètres (température, top-p, top-k...) ; - mode d'entrée (texte ou
texte + image) ; - étape courante.

Tous les composants observent cet état.

## Layout UX

### Structure générale

Le layout est de type **entête / corps / pied** occupant toute la
hauteur de la fenêtre. **Aucun scroll global** : la page ne défile
jamais dans son ensemble.

```text
+----------------------------------------------------------+
| HEADER : site-id | bascule de mode | prec./suiv. | n/N   |  hauteur fixe
+---------+-------------------------+----------------------+
| ETAPES  | BODY CENTRE             | BODY DROITE          |  hauteur flexible
| (metro  | etape en cours          | plan global          |
| vertical| (scrollable)            | (sans scroll,        |
| scroll.)|                         |  tient a l'ecran)    |
+---------+-------------------------+----------------------+
| FOOTER : @JLG Consulting 2026 - GitHub                   |  hauteur fixe
+----------------------------------------------------------+
```

Mise en œuvre recommandée : conteneur racine en `display: grid`
(ou `flex` colonne) avec `height: 100vh` et
`grid-template-rows: auto 1fr auto`. Le corps utilise trois colonnes
(`grid-template-columns: 13rem 1fr 24rem`) : le panneau d'étape prend la
largeur restante, le plan global (mis à l'échelle par hauteur) reste étroit.

### Header

- Affiche le **site-id** « Show LLM » (titre / logo de l'application).
- Porte la **bascule de mode** Texte / Texte + image (voir
  [03-evolution-mode-image.md](03-evolution-mode-image.md)).
- Porte les boutons **précédent / suivant** et le compteur d'étapes.
- Hauteur fixe, toujours visible.

### Body — trois panneaux

**Gauche — barre d'étapes**

- Ligne de la timeline **façon plan de ligne de métro**, verticale
  (stations = étapes reliées par un trait).
- Largeur fixe et étroite, non repliable (desktop only).
- Zone **scrollable** verticalement si les étapes dépassent la hauteur
  disponible ; l'étape active est ramenée dans la vue.
- Clic sur une station pour accéder à l'étape.

**Centre — étape en cours**

- Montre le détail visuel de l'**étape courante** uniquement.
- Le contenu **change au fur et à mesure des étapes**.
- Zone **scrollable** verticalement (défilement interne au panneau).

**Droite — plan global**

- Montre un **plan global du moteur, du LLM et des phases**.
- Met en évidence la phase active et **reflète les modifications** au
  fil de la progression (l'étape en cours est signalée sur le plan).
- **Pas de scroll** : le plan est mis à l'échelle (SVG `viewBox`) pour
  tenir entièrement dans la hauteur et la largeur du panneau, dans les
  deux modes.

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
- mode « Texte + image » (LLM multimodal) avec un scénario dédié et une
  timeline défilable : voir
  [03-evolution-mode-image.md](03-evolution-mode-image.md) ;
- prise en charge d'autres démonstrations (tool calling, RAG, etc.)
  basées sur le même moteur d'animation.
