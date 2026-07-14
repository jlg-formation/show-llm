# Spécifications -- Démonstrateur pédagogique du fonctionnement d'un LLM

## Objectif

Créer un démonstrateur visuel destiné à un public non spécialiste
expliquant le cycle complet de génération d'un LLM, de manière simple,
fidèle et interactive.

## Fonctionnalités à illustrer

### 1. Saisie du prompt

-   Afficher une phrase simple, par exemple : « Le chat dort sur le ».

### 2. Tokenisation

-   Montrtrer la transformation de la phrase en une suite de tokens.
-   Afficher les identifiants des tokens ainsi que leur représentation
    textuelle.

### 3. Transformation en embeddings

-   Montrer que chaque token est converti en embedding.
-   Représenter visuellement les embeddings (sans afficher des centaines
    de nombres).
-   Expliquer qu'ils sont obtenus par lecture dans une table
    d'embeddings.

### 4. Entrée dans le modèle

-   Les embeddings sont transmis au Transformer.
-   Le Transformer est représenté comme une boîte noire composée de
    plusieurs couches.
-   Les détails internes (attention, QKV, feed-forward...) ne sont pas
    montrés.

### 5. Sortie du modèle

-   Insister sur le fait que **le modèle ne produit pas directement des
    probabilités**.
-   Le modèle produit un vecteur de **logits (scores bruts)**.
-   Expliquer simplement qu'il existe un logit pour **chaque token du
    vocabulaire** (environ 200 000 pour les modèles OpenAI récents
    utilisant le tokenizer `o200k_base`, valeur indicative).
-   Les logits peuvent être positifs ou négatifs et ne sont pas des
    probabilités.

### 6. Rôle du moteur d'inférence

Le moteur d'inférence est clairement distingué du modèle.

À partir des logits, il : - applique la température ; - applique
éventuellement des filtres (top-k, top-p, min-p, pénalités...) ; -
calcule les probabilités via un unique Softmax ; - choisit le prochain
token (qui n'est pas forcément le plus probable).

Le schéma pédagogique est :

Transformer → Logits → Température → Top-k / Top-p → Softmax →
Probabilités → Choix du token

### 7. Visualisation des probabilités

-   Afficher les tokens les plus probables avec leur probabilité.
-   Utiliser des exemples parlants :
    -   canapé
    -   fauteuil
    -   lit
    -   tapis
-   Afficher aussi quelques tokens très improbables afin de montrer que
    tout le vocabulaire est évalué :
    -   hélicoptère
    -   porte-avions
-   Mettre en évidence la notion de **perplexité** : les propositions
    cohérentes ont une forte probabilité, les propositions surprenantes
    (forte perplexité) une probabilité très faible.

### 8. Construction de la nouvelle phrase

-   Ajouter le token sélectionné au prompt.
-   Afficher immédiatement le nouveau prompt.

### 9. Boucle d'inférence

Répéter visuellement le cycle complet :

Prompt → Tokenisation → Embeddings → Transformer → Logits → Température
→ Top-k / Top-p → Softmax → Probabilités → Choix → Nouveau prompt

### 10. Fin de génération

-   Arrêt sur le token EOS (ou autre condition d'arrêt).

## Contraintes pédagogiques

-   Une étape = une idée.
-   Schéma très visuel et animé.
-   Employer les termes techniques corrects (« logit », « embedding », «
    token ») en les expliquant simplement.
-   Insister sur la séparation entre :
    -   le modèle (Transformer) ;
    -   le moteur d'inférence.

## Évolutions possibles

-   Mode pas-à-pas et mode automatique.
-   Mise en évidence du token généré à chaque itération.
-   Affichage optionnel des paramètres (température, top-p, top-k...).
-   Mode « Débutant » et mode « Expert » avec davantage de détails
    techniques.
