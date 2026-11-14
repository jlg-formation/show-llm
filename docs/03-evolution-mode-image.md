# Évolution -- Mode « Image » (LLM multimodal)

> Statut : implémentée.

## Contexte

Le démonstrateur est utilisé en formation. Une fois le cycle d'inférence
d'un LLM textuel compris, les stagiaires demandent régulièrement :
« et pour les images, comment ça marche ? ».

## Besoin reformulé

Le formateur veut pouvoir, **en un clic**, afficher ce qui change quand
l'entrée du LLM est **une image accompagnée d'un texte**, sans quitter le
démonstrateur ni le présenter comme un second site.

- Le site reste **le même** : même layout, même plan global, même moteur
  d'inférence.
- Ce qui change, c'est **le scénario** : la timeline « plan de métro » est
  modifiée, avec des stations supplémentaires pour le traitement de
  l'image.
- Le mode Texte reste le parcours par défaut et **n'est pas alourdi**.
- Si la timeline devient longue, elle doit rester **utilisable par
  défilement** (barre latérale verticale).
- L'objectif est de donner une première intuition rigoureuse, pas
  d'exposer toutes les architectures multimodales.

## Objectif

Montrer simplement comment un LLM multimodal transforme une image en
éléments exploitables par le même Transformer que le texte.

## Périmètre

### Inclus

- Un bouton de bascule **Texte / Texte + image** dans le header.
- Un scénario « Image » dont la partie amont du pipeline est modifiée.
- Une image fixe, dessinée pour la démo (SVG embarqué, sans fichier
  raster).
- Une barre d'étapes latérale verticale et défilable.
- La suppression de la lecture automatique (voir ci-dessous).

### Exclus

- Téléversement d'une image par l'utilisateur.
- Comparaison « avec image / sans image » sur les logits.
- Génération d'image, vidéo, audio (la sortie reste du texte).
- Variantes d'architecture (fusion précoce, cross-attention).
- Réel encodeur visuel : tout est pédagogique et simplifié.

## Principe pédagogique

Un LLM multimodal ne « voit » pas l'image : il la convertit en une suite de
vecteurs **qui jouent le rôle d'embeddings de tokens**, puis les place dans
la séquence avec ceux du texte. À partir du Transformer, **rien ne change**.

Messages clés :

- l'image est découpée en **patches** (petits carrés de pixels) ;
- un **encodeur visuel** transforme chaque patch en vecteur ;
- un **projecteur** adapte ces vecteurs à l'espace d'embeddings du LLM ;
- ces « tokens image » **n'ont pas d'identifiant de vocabulaire** (ils ne
  viennent pas de la table d'embeddings) ;
- ils sont **assemblés avec les tokens du texte** dans une même séquence ;
- une image coûte **beaucoup de tokens** (centaines) ;
- à partir du Transformer, le pipeline est **identique** au mode texte ;
- l'image n'est traitée **qu'une seule fois** : la boucle d'inférence ne
  la ré-encode pas ;
- chaque fois qu'un vecteur apparaît, on donne sa **longueur réelle** sur
  des modèles open weight (embeddings, logits, encodeurs visuels,
  projecteurs) ; les valeurs affichées restent tronquées à 6 nombres.

## Valeurs de référence (grille de patches)

On s'aligne sur la littérature (Vision Transformer, ViT-B/16) :

- image d'entrée : **224 × 224 pixels** ;
- patch : **16 × 16 pixels** ;
- grille : **14 × 14 patches**, soit **196 patches** ;
- un patch contient 16 × 16 pixels × 3 couleurs (RGB) = **768 valeurs**.

Dans la démo, la grille de 14 × 14 patches est **réellement dessinée** sur
l'image. Les vecteurs affichés restent symboliques (quelques
dimensions). Pour éviter toute confusion, la démo ne manipule qu'une
seule taille de patch (16 × 16 pixels) ; une note indique seulement que
dans la littérature on rencontre différentes tailles de patch (14 × 14,
16 × 16, etc.).

## Scénario pédagogique

- **Image** : un chat endormi sur un canapé (dessin SVG simple).
- **Texte** : « Où dort le chat ? Le chat dort sur le ». La question est
  suivie du début de la réponse, ce qui prolonge naturellement le prompt
  du mode Texte (« Le chat dort sur le »).
- **Sortie** : les mêmes candidats que le mode Texte (canapé, fauteuil,
  lit, tapis, rebord, hélicoptère, porte-avions) et les mêmes paramètres
  moteur. La sortie n'est pas le sujet de cette évolution.

## Bouton de bascule

- Emplacement : header, à côté des contrôles de lecture.
- Forme : contrôle segmenté à deux états, **Texte** (défaut) et
  **Texte + image** (avec une icône image).
- Basculer :
  - revient à la première étape ;
  - remplace les stations de la timeline et met à jour le plan global.
- Utilisable en un clic, sans menu.

## Timeline : stations du mode Image

Règles :

- une station = une idée ;
- la station « Prompt » est **en première position dans les deux modes** ;
- les stations du texte (Tokenisation, Embeddings) restent **à leur place
  habituelle** : seules des stations sont **insérées** avant le
  Transformer ;
- les stations propres à l'image sont **identifiables visuellement** (icône
  ou couleur) ;
- les stations du Transformer jusqu'à la Fin sont **communes** aux deux
  modes.

| #   | Station                   | Statut                                 |
| --- | ------------------------- | -------------------------------------- |
| 1   | Prompt (image + texte)    | adaptée                                |
| 2   | Tokenisation (texte seul) | identique, sur la question seule       |
| 3   | Embeddings (texte seul)   | identique, sur la question seule       |
| 4   | **Patches**               | nouvelle (image)                       |
| 5   | **Encodeur visuel**       | nouvelle (image)                       |
| 6   | **Tokens image**          | nouvelle (image)                       |
| 7   | **Séquence**              | nouvelle (image + texte)               |
| 8   | Transformer               | identique, note sur l'attention        |
| 9   | Logits                    | identique                              |
| 10  | Top-k                     | identique                              |
| 11  | Softmax                   | identique                              |
| 12  | Top-p                     | identique                              |
| 13  | Probabilités              | identique                              |
| 14  | Choix                     | identique                              |
| 15  | Nouveau prompt            | identique                              |
| 16  | Boucle                    | identique, note : image non ré-encodée |
| 17  | Fin                       | identique                              |

Le mode Texte conserve ses 13 stations actuelles.

### Contenu des stations propres au mode Image

1. **Prompt (image + texte)** : l'image et la question côte à côte.
2. **Patches** : l'image 224 × 224 avec la grille 14 × 14 superposée ;
   un patch mis en évidence, avec ses 16 × 16 pixels et leurs valeurs RGB
   (768 valeurs).
3. **Encodeur visuel** : chaque patch donne un vecteur de quelques valeurs
   symboliques, présenté comme les embeddings du texte (196 vecteurs, dont
   quelques-uns affichés).
4. **Tokens image** : le projecteur aligne ces vecteurs sur l'espace du
   LLM. Insister visuellement : **pas d'identifiant `#id`**, contrairement
   aux tokens texte. Montrer les meta tokens (tokens spéciaux) délimitant
   l'image.
5. **Séquence** : une seule ligne composée de [meta token début] [tokens
   image] [meta token fin] [tokens texte]. Les deux origines sont distinguées
   par la couleur. Les 196 tokens image sont abrégés (quelques-uns + « … »
   - compteur).

## Barre d'étapes latérale (timeline verticale)

La timeline passe de 13 à 17 stations en mode Image : trop long pour
un header horizontal. Elle est déplacée dans une **barre latérale
gauche**, où les stations sont empilées verticalement.

- Largeur **fixe et étroite**, non repliable (desktop only).
- Toujours le plan de ligne de métro : stations reliées par un trait
  vertical, titres de station inchangés.
- Défilement **vertical** si la liste dépasse la hauteur disponible.
- La station active est **toujours ramenée dans la vue** (centrage
  automatique).
- À la bascule de mode, la barre **revient en haut**.
- Un indice visuel (dégradé sur les bords haut / bas) signale que du
  contenu existe hors de la vue.
- Le header ne contient plus que le site-id, la bascule de mode, les
  boutons précédent / suivant et le compteur d'étapes (« n / 17 »).

## Suppression de la lecture automatique

Le bouton lecture / pause, tout à droite du header, n'est pas utilisé en
formation : la navigation se fait par les stations de la timeline et par
les boutons précédent / suivant. La **lecture automatique est supprimée**
de l'application, dans les deux modes.

- Le bouton lecture / pause disparaît du header.
- Il n'existe plus de défilement automatique des étapes : la progression
  est toujours manuelle (clic sur une station, précédent, suivant).
- Restent dans les contrôles : précédent, suivant, compteur « n / N ».
- Cette suppression simplifie la bascule de mode : plus de lecture à
  arrêter.

Impacts prévus (à l'implémentation) :

- composant `Controls` : retrait du bouton lecture / pause ;
- `store` : retrait de `play`, `pause`, `togglePlay`, du minuteur et de
  `AUTOPLAY_INTERVAL` ; `nextStep` ne s'arrête plus via `pause()` ;
- `AppState` et `INITIAL_STATE` : retrait du champ `playing` ;
- `docs/02-architecture-demonstrateur-llm.md` : retirer « lecture
  automatique » et « pause » des fonctionnalités de la barre temporelle et
  du header ;
- `docs/01-specifications-demonstrateur-llm.md` : le « mode automatique »
  des évolutions possibles n'est plus d'actualité.

## Plan global (panneau droit)

- Mode Texte : inchangé.
- Mode Image : une **branche image** s'ajoute en amont du Transformer :
  `Image → Patches → Encodeur visuel → Projecteur`, qui rejoint la branche
  texte `Prompt → Tokenisation → Embeddings` avant le Transformer.
- La suite (Transformer, logits, moteur, boucle, EOS) est inchangée.
- La phase active est mise en évidence comme aujourd'hui.

## Impact technique (haut niveau)

À détailler dans une phase d'architecture.

- **Notion de scénario** : un scénario = liste ordonnée d'étapes + données
  - définition du schéma. Deux scénarios : `text` (existant) et `image`.
- **État** : ajout d'un identifiant de mode dans l'état global. La liste
  d'étapes active en est dérivée (aujourd'hui `STEPS` est une constante
  importée directement par plusieurs composants).
- **Types** : `StepId` et `SchematicNodeId` étendus avec les nouvelles
  étapes et boîtes.
- **Rendu des étapes** : nouveaux renderers pour les stations propres à
  l'image ; les autres sont réutilisés.
- **Schéma SVG** : boîtes et flèches dépendant du mode (branche image).
- **Données** : image SVG, grille 14 × 14, vecteurs symboliques, tokens du
  texte de la question.
- **Timeline / Controls** : reconstruits au changement de mode.
- **Aucune dépendance nouvelle** : toujours front-end only.

## Contraintes pédagogiques (rappel)

- Une étape = une idée.
- Vocabulaire correct : patch, encodeur visuel, projecteur, token image.
- Valeurs simplifiées et signalées comme telles.
- Le mode Texte reste le parcours par défaut.

## Impacts sur la documentation existante

- `docs/01-specifications-demonstrateur-llm.md` : le mode Image est
  référencé dans les évolutions.
- `docs/02-architecture-demonstrateur-llm.md` : le mode Image et la
  timeline défilable sont référencés dans les évolutions ; la notion de
  scénario sera décrite une fois implémentée.
- `AGENTS.md` : pointe vers cette spécification ; la liste des étapes et la
  description du store / du schéma seront mises à jour à l'implémentation.

## Décisions prises

- Question du mode Image : « Où dort le chat ? Le chat dort sur le ».
- Grille de patches : 14 × 14 (image 224 px, patch 16 px, ViT-B/16).
- Bascule : contrôle segmenté « Texte » / « Texte + image ».
- « Prompt » en première position dans les deux modes ; stations image
  insérées avant le Transformer.
- Barre d'étapes latérale gauche, verticale, défilable.
- Lecture automatique et bouton lecture / pause supprimés.
