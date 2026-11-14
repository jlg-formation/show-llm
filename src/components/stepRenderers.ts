import { h, svgEl } from "../dom";
import type { AppState, StepId } from "../types";
import { computedCandidates, computedFinalCandidates } from "../store";
import { formatProbability } from "../engine";
import {
  IMAGE_DEMO,
  META_TOKENS_HARMONY,
  META_TOKENS_IMAGE,
  META_TOKENS_O200K,
  OPEN_MODELS,
  PROJECTORS,
  VISION_ENCODERS,
} from "../data";
import { createCatImage, createPatchView } from "./catImage";

/**
 * Renderers du panneau gauche : chaque étape produit un contenu HTML
 * spécifique. Les éléments animables portent la classe `anim-item`.
 */
export function renderStepContent(step: StepId, state: AppState): HTMLElement {
  switch (step) {
    case "prompt":
      return renderPrompt(state);
    case "tokenize":
      return renderTokenize(state);
    case "embeddings":
      return renderEmbeddings(state);
    case "transformer":
      return renderTransformer(state);
    case "logits":
      return renderLogits(state);
    case "topk":
      return renderTopK(state);
    case "softmax":
      return renderSoftmax(state);
    case "topp":
      return renderTopP(state);
    case "probabilities":
      return renderProbabilities();
    case "sampling":
      return renderSampling(state);
    case "append-token":
      return renderAppend(state);
    case "loop":
      return renderLoop(state);
    case "eos":
      return renderEos();
    case "patches":
      return renderPatches();
    case "vision-encoder":
      return renderVisionEncoder();
    case "image-tokens":
      return renderImageTokens();
    case "sequence":
      return renderSequence(state);
  }
}

function wrap(children: (Node | string)[]): HTMLElement {
  return h("div", { class: "flex flex-col gap-6" }, children);
}

function card(children: (Node | string)[], extra = ""): HTMLElement {
  return h(
    "div",
    {
      class: `anim-item rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm ${extra}`,
    },
    children,
  );
}

function renderPrompt(state: AppState): HTMLElement {
  if (state.mode === "image") {
    return wrap([
      card([
        h("p", { class: "mb-3 text-sm text-[var(--color-muted)]" }, [
          "Le prompt fourni au modèle : une image et du texte.",
        ]),
        h("div", { class: "flex flex-wrap items-center gap-6" }, [
          h(
            "div",
            {
              class:
                "w-56 max-w-full shrink-0 overflow-hidden rounded-lg border border-[var(--color-border)]",
            },
            [createCatImage()],
          ),
          h("p", { class: "text-2xl font-semibold text-[var(--color-ink)]" }, [
            `« ${state.prompt} »`,
          ]),
        ]),
      ]),
    ]);
  }
  return wrap([
    card([
      h("p", { class: "mb-2 text-sm text-[var(--color-muted)]" }, [
        "Le prompt fourni au modèle :",
      ]),
      h("p", { class: "text-2xl font-semibold text-[var(--color-ink)]" }, [
        `« ${state.prompt} »`,
      ]),
    ]),
  ]);
}

function renderTokenize(state: AppState): HTMLElement {
  const chips = state.tokens.map((t) =>
    h(
      "div",
      {
        class:
          "anim-item flex flex-col items-center rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-3 py-2",
      },
      [
        h("span", { class: "font-mono text-lg font-semibold" }, [
          t.text.trim() === "" ? "␣" : t.text,
        ]),
        h("span", { class: "mt-1 text-xs text-[var(--color-muted)]" }, [
          `#${t.id}`,
        ]),
      ],
    ),
  );
  return wrap([
    card([
      h("p", { class: "mb-3 text-sm text-[var(--color-muted)]" }, [
        "La phrase est découpée en tokens, chacun avec un identifiant :",
      ]),
      h("div", { class: "flex flex-wrap gap-2" }, chips),
      h("p", { class: "anim-item mt-3 text-xs font-semibold text-[var(--color-muted)]" }, [
        "Les identifiants (#…) des tokens de cette phrase sont fictifs, choisis pour l'exemple. Ce ne sont pas ceux d'un vrai tokenizer.",
      ]),
      h("p", { class: "anim-item mt-2 text-sm" }, [
        "Pour voir de vrais tokenizers en action, rendez-vous sur ",
        h(
          "a",
          {
            class: "font-semibold text-[var(--color-accent)] hover:underline",
            href: "https://jlg-formation.github.io/tokenizer/",
            target: "_blank",
            rel: "noopener noreferrer",
          },
          ["jlg-formation.github.io/tokenizer"],
        ),
        ".",
      ]),
    ]),
    card([
      h("p", { class: "text-sm text-[var(--color-muted)]" }, [
        "Un tokenizer contient aussi des meta tokens : des tokens spéciaux qui ne sont pas du texte mais structurent la séquence (fin de texte, début de message, début d'image…).",
      ]),
      refList(
        "o200k_base (tokenizer OpenAI) : ~200 000 tokens de texte + 2 meta tokens :",
        META_TOKENS_O200K,
      ),
      refList(
        "o200k_harmony (variante de gpt-oss), meta tokens de conversation :",
        META_TOKENS_HARMONY,
      ),
      ...(state.mode === "image"
        ? [
            refList(
              "Meta tokens d'image, sur quelques VLM open weight :",
              META_TOKENS_IMAGE,
            ),
            h("p", { class: "anim-item mt-2 text-xs text-[var(--color-muted)]" }, [
              "o200k_base ne définit pas de meta token d'image ; comment GPT-4o délimite ses images n'est pas public. Chaque modèle open weight a les siens.",
            ]),
          ]
        : []),
    ]),
  ]);
}

function renderEmbeddings(state: AppState): HTMLElement {
  const rows = state.embeddings.map((emb) => {
    const token = state.tokens.find((t) => t.text === emb.tokenText);
    return h("div", { class: "anim-item flex items-center gap-2" }, [
      h(
        "span",
        {
          class:
            "w-12 shrink-0 text-right font-mono text-sm text-[var(--color-ink)]",
        },
        [emb.tokenText.trim() || "␣"],
      ),
      h(
        "span",
        {
          class:
            "w-16 shrink-0 text-right font-mono text-xs text-[var(--color-muted)]",
        },
        [token ? `#${token.id}` : ""],
      ),
      h("span", { class: "text-[var(--color-muted)]" }, ["→"]),
      h("div", { class: "flex items-center gap-1 font-mono text-sm" }, [
        h("span", { class: "text-[var(--color-muted)]" }, ["["]),
        ...emb.values.map((v) =>
          h("span", { class: "tabular-nums text-[var(--color-ink)]" }, [
            `${v >= 0 ? " " : ""}${v.toFixed(2)},`,
          ]),
        ),
        h(
          "span",
          {
            class: "text-[var(--color-muted)]",
            title:
              "Les vrais embeddings ont des centaines/milliers de dimensions",
          },
          ["…"],
        ),
        h("span", { class: "text-[var(--color-muted)]" }, ["]"]),
      ]),
    ]);
  });
  return wrap([
    card([
      h("p", { class: "mb-3 text-sm text-[var(--color-muted)]" }, [
        "Chaque token est lu dans une table d'embeddings et devient un vecteur. Représentation simplifiée (6 nombres ici, des milliers en vrai) ; identifiants de token fictifs :",
      ]),
      h("div", { class: "flex flex-col gap-2" }, rows),
      refList(
        "Longueur réelle d'un embedding, sur quelques LLM open weight :",
        OPEN_MODELS.map((m) => [m.name, `${fmt(m.embeddingDim)} nombres`]),
      ),
    ]),
  ]);
}

function renderTransformer(state: AppState): HTMLElement {
  const layerBox = (label: string) =>
    h(
      "div",
      {
        class:
          "anim-item rounded-md border border-slate-500 bg-slate-800 px-4 py-2 text-center text-sm font-medium text-slate-100",
      },
      [label],
    );
  const ellipsis = h(
    "div",
    {
      class:
        "anim-item text-center text-2xl font-bold leading-none text-slate-400",
      title: "De nombreuses couches identiques s'enchaînent (des dizaines)",
    },
    ["⋮"],
  );
  const layers = [
    layerBox("Couche 1"),
    layerBox("Couche 2"),
    ellipsis,
    layerBox("Couche N"),
  ];
  return wrap([
    card(
      [
        h("p", { class: "mb-3 text-sm text-slate-300" }, [
          "Les embeddings traversent le Transformer — une boîte noire à plusieurs couches. On ne montre pas l'intérieur (attention, feed-forward…).",
        ]),
        h("div", { class: "flex flex-col gap-2" }, layers),
        ...(state.mode === "image"
          ? [
              h("p", { class: "anim-item mt-4 text-sm text-slate-300" }, [
                "La séquence contient des tokens image ET des tokens texte : grâce à l'attention, chaque token du texte peut « regarder » les tokens image.",
              ]),
            ]
          : []),
        h("p", { class: "mt-4 mb-1 text-xs font-semibold text-slate-400" }, [
          "Couches et longueur des vecteurs sur quelques LLM open weight (la longueur reste la même d'une couche à l'autre) :",
        ]),
        h(
          "ul",
          { class: "flex flex-col gap-0.5 text-xs text-slate-300" },
          OPEN_MODELS.map((m) =>
            h("li", { class: "flex items-baseline gap-2" }, [
              h("span", { class: "font-mono text-slate-100" }, [m.name]),
              h("span", { class: "text-slate-400" }, ["→"]),
              h("span", {}, [
                `${m.layers} couches · vecteurs de ${fmt(m.embeddingDim)} nombres`,
              ]),
            ]),
          ),
        ),
      ],
      "!bg-slate-900 !border-slate-700 text-slate-100",
    ),
  ]);
}

function renderLogits(state: AppState): HTMLElement {
  const maxAbs = Math.max(...state.candidates.map((c) => Math.abs(c.logit)));
  const bars: HTMLElement[] = [];
  state.candidates.forEach((c, i) => {
    const prev = state.candidates[i - 1];
    if (prev && prev.logit >= 0 && c.logit < 0) {
      bars.push(
        h(
          "div",
          {
            class:
              "anim-item flex items-center gap-3 text-2xl font-bold leading-none text-[var(--color-muted)]",
            title: "Tous les autres tokens du vocabulaire sont aussi évalués",
          },
          [
            h("span", { class: "w-28 shrink-0" }, [""]),
            h("span", { class: "flex-1 text-center" }, ["⋯"]),
          ],
        ),
      );
    }
    bars.push(
      h("div", { class: "anim-item flex items-center gap-3" }, [
        h("span", { class: "w-28 shrink-0 text-sm" }, [c.text]),
        h("div", { class: "relative h-5 flex-1 rounded bg-slate-100" }, [
          (() => {
            const bar = h("div", {
              class: "absolute top-0 h-5 rounded",
            });
            const w = (Math.abs(c.logit) / maxAbs) * 50;
            bar.style.width = `${w}%`;
            bar.style.left = c.logit >= 0 ? "50%" : `${50 - w}%`;
            bar.style.background =
              c.logit >= 0 ? "var(--color-accent)" : "var(--color-active)";
            return bar;
          })(),
        ]),
        h("span", { class: "w-14 shrink-0 text-right font-mono text-sm" }, [
          c.logit.toFixed(1),
        ]),
      ]),
    );
  });
  return wrap([
    card([
      h("p", { class: "mb-1 text-sm text-[var(--color-muted)]" }, [
        "Le modèle produit un logit (score brut) pour chaque token du vocabulaire — environ ",
      ]),
      h("p", { class: "mb-3 text-sm font-semibold text-[var(--color-ink)]" }, [
        `${state.vocabSize.toLocaleString("fr-FR")} tokens.`,
      ]),
      h("p", { class: "mb-3 text-xs text-[var(--color-muted)]" }, [
        "Les logits peuvent être positifs ou négatifs. Ce ne sont pas des probabilités. Aperçu de quelques tokens :",
      ]),
      h("div", { class: "flex flex-col gap-2" }, bars),
      refList(
        "Le vecteur de logits a une longueur égale à la taille du vocabulaire :",
        OPEN_MODELS.filter((m) => m.name !== "gpt-oss-120b").map((m) => [
          m.name,
          `${fmt(m.vocabSize)} logits`,
        ]),
      ),
    ]),
  ]);
}

function renderTopK(state: AppState): HTMLElement {
  const topK = state.params.topK;
  // Sur cette démo pédagogique, on montre les quelques tokens visibles,
  // triés par logit décroissant (top-k s'applique AVANT le softmax).
  const sorted = [...state.candidates].sort((a, b) => b.logit - a.logit);
  const maxLogit = Math.max(...sorted.map((c) => Math.abs(c.logit)));

  const rows = sorted.map((c, i) => {
    const kept = i < topK;
    return h(
      "div",
      {
        class: `anim-item flex items-center gap-3 ${kept ? "" : "opacity-40"}`,
      },
      [
        h("span", { class: "w-6 shrink-0 text-center text-sm" }, [
          kept ? "✓" : "✕",
        ]),
        h("span", { class: "w-24 shrink-0 text-sm" }, [c.text]),
        h("div", { class: "relative h-4 flex-1 rounded bg-slate-100" }, [
          (() => {
            const bar = h("div", { class: "absolute top-0 h-4 rounded" });
            bar.style.width = `${(Math.abs(c.logit) / maxLogit) * 100}%`;
            bar.style.left = "0";
            bar.style.background = kept
              ? "var(--color-accent)"
              : "var(--color-muted)";
            return bar;
          })(),
        ]),
        h("span", { class: "w-12 shrink-0 text-right font-mono text-xs" }, [
          c.logit.toFixed(1),
        ]),
      ],
    );
  });

  return wrap([
    card([
      h("div", { class: "anim-item mb-2 flex items-center gap-2" }, [
        h(
          "span",
          {
            class:
              "rounded bg-[var(--color-accent-soft)] px-2 py-0.5 font-mono text-sm font-semibold text-[var(--color-accent)]",
          },
          [`top-k = ${topK}`],
        ),
        h("span", { class: "text-sm font-medium text-[var(--color-ink)]" }, [
          "garder les k tokens aux logits les plus élevés",
        ]),
      ]),
      h("p", { class: "anim-item mb-4 text-sm text-[var(--color-muted)]" }, [
        "Premier filtre du moteur, appliqué directement sur les logits (avant tout calcul de probabilité). On classe tout le vocabulaire par score décroissant et on ne conserve que les k premiers ; tout le reste est écarté d'un coup.",
      ]),
      // Entonnoir visuel : vocabulaire -> k
      h(
        "div",
        { class: "anim-item mb-4 flex items-center justify-center gap-3" },
        [
          h(
            "div",
            {
              class:
                "flex h-14 flex-col items-center justify-center rounded-lg bg-slate-100 px-4",
            },
            [
              h(
                "span",
                {
                  class:
                    "font-mono text-base font-bold text-[var(--color-ink)]",
                },
                [state.vocabSize.toLocaleString("fr-FR")],
              ),
              h("span", { class: "text-xs text-[var(--color-muted)]" }, [
                "logits",
              ]),
            ],
          ),
          h("span", { class: "text-2xl text-[var(--color-muted)]" }, ["⟶"]),
          h(
            "div",
            {
              class:
                "flex h-14 flex-col items-center justify-center rounded-lg bg-[var(--color-accent-soft)] px-4",
            },
            [
              h(
                "span",
                {
                  class:
                    "font-mono text-base font-bold text-[var(--color-accent)]",
                },
                [`${topK}`],
              ),
              h("span", { class: "text-xs text-[var(--color-muted)]" }, [
                "candidats",
              ]),
            ],
          ),
        ],
      ),
      h("p", { class: "anim-item mb-2 text-xs text-[var(--color-muted)]" }, [
        `Sur nos tokens d'exemple, tous survivent (moins de ${topK} candidats) :`,
      ]),
      h("div", { class: "flex flex-col gap-2" }, rows),
    ]),
  ]);
}

function renderTopP(state: AppState): HTMLElement {
  const cands = computedCandidates();
  const total = cands.reduce((acc, c) => acc + c.probability, 0) || 1;
  const topP = state.params.topP;

  // --- Répartition cumulée pour top-p ---
  let cum = 0;
  const segments = cands.map((c) => {
    const frac = c.probability / total;
    const startCum = cum;
    cum += frac;
    // On garde le token si la masse AVANT lui n'a pas encore atteint le seuil.
    const keptByP = startCum < topP;
    return { c, frac, startCum, keptByP };
  });
  const keptCount = segments.filter((s) => s.keptByP).length;
  // Renormalisation : les probabilités des tokens gardés somment de nouveau à 1.
  const keptMass =
    segments.filter((s) => s.keptByP).reduce((acc, s) => acc + s.frac, 0) || 1;

  // --- Donut SVG illustrant la masse de probabilité (top-p) ---
  const R = 52;
  const C = 2 * Math.PI * R;
  const arcs = segments.map((s) => {
    const arc = svgEl("circle", {
      cx: 70,
      cy: 70,
      r: R,
      fill: "none",
      "stroke-width": 22,
      stroke: s.keptByP ? "var(--color-accent)" : "#cbd5e1",
      "stroke-dasharray": `${s.frac * C} ${C - s.frac * C}`,
      "stroke-dashoffset": `${-s.startCum * C}`,
    });
    (arc as SVGElement).style.transition = "stroke 0.3s";
    return arc;
  });
  const pctText = svgEl("text", {
    x: 70,
    y: 64,
    "text-anchor": "middle",
    "font-size": 20,
    "font-weight": "700",
    fill: "var(--color-accent)",
  });
  pctText.textContent = `${Math.round(topP * 100)} %`;
  const labelText = svgEl("text", {
    x: 70,
    y: 84,
    "text-anchor": "middle",
    "font-size": 11,
    fill: "var(--color-muted)",
  });
  labelText.textContent = "top-p";
  const donut = svgEl(
    "svg",
    { viewBox: "0 0 140 140", width: 180, height: 180 },
    [
      svgEl("circle", {
        cx: 70,
        cy: 70,
        r: R,
        fill: "none",
        "stroke-width": 22,
        stroke: "#eef2f7",
      }),
      ...arcs,
      pctText,
      labelText,
    ],
  );
  // Rotation pour démarrer en haut.
  arcs.forEach((a) => {
    a.setAttribute("transform", "rotate(-90 70 70)");
  });
  donut
    .querySelectorAll("circle")
    .forEach((c) => c.setAttribute("transform", "rotate(-90 70 70)"));

  const header = h(
    "div",
    {
      class:
        "anim-item flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-muted)]",
    },
    [
      h("span", { class: "inline-block h-3 w-3 shrink-0" }, []),
      h("span", { class: "w-24 shrink-0" }, ["token"]),
      h("span", { class: "w-16 shrink-0 text-right" }, ["prob."]),
      h("span", { class: "w-16 shrink-0 text-right" }, ["cumul"]),
      h("span", { class: "flex-1" }, ["résultat"]),
    ],
  );

  const legend = h("div", { class: "flex flex-col gap-1.5 text-sm" }, [
    header,
    ...segments.map((s) => {
      const cumIncl = s.startCum + s.frac;
      // Ligne qui fait franchir le seuil top-p (dernier token gardé).
      const crosses = s.startCum < topP && cumIncl >= topP;
      return h(
        "div",
        {
          class: `anim-item flex items-center gap-2 ${
            s.keptByP ? "" : "opacity-50"
          }`,
        },
        [
          (() => {
            const dot = h("span", {
              class: "inline-block h-3 w-3 shrink-0 rounded-full",
            });
            dot.style.background = s.keptByP
              ? "var(--color-accent)"
              : "#cbd5e1";
            return dot;
          })(),
          h("span", { class: "w-24 shrink-0" }, [s.c.text]),
          h("span", { class: "w-16 shrink-0 text-right font-mono text-xs" }, [
            formatProbability(s.c.probability),
          ]),
          h(
            "span",
            {
              class: `w-16 shrink-0 text-right font-mono text-xs ${
                crosses
                  ? "font-bold text-[var(--color-accent)]"
                  : "text-[var(--color-muted)]"
              }`,
            },
            [`Σ ${Math.round(cumIncl * 100)} %`],
          ),
          h("span", { class: "flex-1 text-xs text-[var(--color-muted)]" }, [
            s.keptByP ? `→ ${formatProbability(s.frac / keptMass)}` : "écarté",
          ]),
        ],
      );
    }),
  ]);

  return wrap([
    card([
      h("div", { class: "anim-item mb-2 flex items-center gap-2" }, [
        h(
          "span",
          {
            class:
              "rounded bg-[var(--color-accent-soft)] px-2 py-0.5 font-mono text-sm font-semibold text-[var(--color-accent)]",
          },
          [`top-p = ${topP}`],
        ),
        h("span", { class: "text-sm font-medium text-[var(--color-ink)]" }, [
          "garder juste assez de tokens pour cumuler p %",
        ]),
      ]),
      h("p", { class: "anim-item mb-3 text-sm text-[var(--color-muted)]" }, [
        `Second filtre, appliqué cette fois sur les probabilités du Softmax. On ajoute les tokens du plus probable au moins probable jusqu'à atteindre ${Math.round(
          topP * 100,
        )} % de la masse. Ici, ${keptCount} token${
          keptCount > 1 ? "s" : ""
        } suffisent, puis on renormalise (dernière colonne → nouvelle probabilité).`,
      ]),
      h("div", { class: "anim-item flex flex-wrap items-center gap-6" }, [
        donut,
        h("div", { class: "min-w-[240px] flex-1" }, [legend]),
      ]),
    ]),
  ]);
}

function renderSoftmax(state: AppState): HTMLElement {
  const cands = computedCandidates();
  const maxProb = cands[0]?.probability ?? 1;
  const bars: HTMLElement[] = [];
  cands.forEach((c, i) => {
    const prev = cands[i - 1];
    if (prev && prev.logit >= 0 && c.logit < 0) {
      bars.push(
        h(
          "div",
          {
            class:
              "anim-item flex items-center gap-3 text-2xl font-bold leading-none text-[var(--color-muted)]",
            title: "Tous les autres tokens du vocabulaire sont aussi évalués",
          },
          [
            h("span", { class: "w-28 shrink-0" }, [""]),
            h("span", { class: "flex-1 text-center" }, ["⋯"]),
          ],
        ),
      );
    }
    bars.push(
      h("div", { class: "anim-item flex items-center gap-3" }, [
        h(
          "span",
          {
            class: `w-28 shrink-0 text-sm ${
              c.surprising ? "text-[var(--color-muted)] italic" : ""
            }`,
          },
          [c.text],
        ),
        h(
          "span",
          {
            class:
              "w-12 shrink-0 text-right font-mono text-xs text-[var(--color-muted)]",
          },
          [c.logit.toFixed(1)],
        ),
        h("span", { class: "text-[var(--color-muted)]" }, ["→"]),
        h("div", { class: "h-5 flex-1 rounded bg-slate-100" }, [
          (() => {
            const bar = h("div", { class: "h-5 rounded" });
            bar.style.width = `${Math.max((c.probability / maxProb) * 100, 1)}%`;
            bar.style.background = c.surprising
              ? "var(--color-muted)"
              : "var(--color-accent)";
            return bar;
          })(),
        ]),
        h("span", { class: "w-20 shrink-0 text-right font-mono text-sm" }, [
          formatProbability(c.probability),
        ]),
      ]),
    );
  });
  return wrap([
    card([
      h("p", { class: "mb-3 text-sm text-[var(--color-muted)]" }, [
        "Sur les candidats retenus par le top-k, le moteur divise chaque logit par la température T (une T basse accentue les écarts, une T haute les lisse), puis un unique Softmax transforme le tout en probabilités qui somment à 1. Formule générale :",
      ]),
      h("div", { class: "anim-item mb-3 flex items-baseline gap-2" }, [
        h("span", { class: "text-sm text-[var(--color-muted)]" }, [
          "Température T =",
        ]),
        h("span", { class: "text-2xl font-bold text-[var(--color-accent)]" }, [
          state.params.temperature.toLocaleString("fr-FR"),
        ]),
      ]),
      (() => {
        const box = h("div", {
          class: "anim-item rounded-lg bg-slate-50 p-2 text-center",
        });
        box.innerHTML = `
          <math display="block" style="font-size:1.25rem">
            <msub><mi>p</mi><mi>i</mi></msub>
            <mo>=</mo>
            <mfrac>
              <mrow>
                <msup>
                  <mi>e</mi>
                  <mrow><msub><mi>logit</mi><mi>i</mi></msub><mo>/</mo><mi>T</mi></mrow>
                </msup>
              </mrow>
              <mrow>
                <munderover>
                  <mo>&#x2211;</mo>
                  <mrow><mi>j</mi><mo>=</mo><mn>1</mn></mrow>
                  <mi>N</mi>
                </munderover>
                <msup>
                  <mi>e</mi>
                  <mrow><msub><mi>logit</mi><mi>j</mi></msub><mo>/</mo><mi>T</mi></mrow>
                </msup>
              </mrow>
            </mfrac>
          </math>`;
        return box;
      })(),
      h("p", { class: "mb-2 mt-3 text-xs text-[var(--color-muted)]" }, [
        `Appliqué à chaque logit (T = ${state.params.temperature.toLocaleString(
          "fr-FR",
        )}), on obtient la probabilité de chaque token :`,
      ]),
      h("div", { class: "flex flex-col gap-2" }, bars),
    ]),
  ]);
}

function probabilityList(highlightChosen: string | null): HTMLElement {
  // Résultat de l'étape 6c : tokens conservés (top-k + top-p) et renormalisés.
  const cands = computedFinalCandidates();
  const max = cands[0]?.probability ?? 1;
  const rows = cands.map((c) =>
    h(
      "div",
      {
        class: `anim-item flex items-center gap-3 rounded-lg px-2 py-1 ${
          highlightChosen === c.text
            ? "bg-[var(--color-active-soft)] ring-2 ring-[var(--color-active)]"
            : ""
        }`,
      },
      [
        h(
          "span",
          {
            class: `w-28 shrink-0 text-sm ${
              c.surprising ? "text-[var(--color-muted)] italic" : ""
            }`,
          },
          [c.text],
        ),
        h("div", { class: "h-5 flex-1 rounded bg-slate-100" }, [
          (() => {
            const bar = h("div", { class: "h-5 rounded" });
            bar.style.width = `${Math.max((c.probability / max) * 100, 1)}%`;
            bar.style.background = c.surprising
              ? "var(--color-muted)"
              : "var(--color-accent)";
            return bar;
          })(),
        ]),
        h("span", { class: "w-20 shrink-0 text-right font-mono text-sm" }, [
          formatProbability(c.probability),
        ]),
      ],
    ),
  );
  return h("div", { class: "flex flex-col gap-1.5" }, rows);
}

function renderProbabilities(): HTMLElement {
  const kept = computedFinalCandidates().length;
  return wrap([
    card([
      h("p", { class: "mb-3 text-sm text-[var(--color-muted)]" }, [
        `Voici la distribution finale issue de l'étape 6c : seuls les ${kept} token${
          kept > 1 ? "s" : ""
        } retenus par top-k puis top-p subsistent, avec leurs probabilités renormalisées (somme = 100 %). C'est sur cette distribution que se fera l'échantillonnage.`,
      ]),
      probabilityList(null),
    ]),
  ]);
}

function renderSampling(state: AppState): HTMLElement {
  const chosen = state.chosenToken ?? computedFinalCandidates()[0]?.text ?? "";
  return wrap([
    card([
      h("p", { class: "mb-3 text-sm text-[var(--color-muted)]" }, [
        "Le moteur échantillonne un token selon ces probabilités — pas forcément le plus probable.",
      ]),
      probabilityList(chosen),
      h("p", { class: "anim-item mt-4 text-center text-lg" }, [
        "Token choisi : ",
        h("strong", { class: "text-[var(--color-active)]" }, [`« ${chosen} »`]),
      ]),
    ]),
  ]);
}

function renderAppend(state: AppState): HTMLElement {
  const chosen = state.chosenToken ?? computedFinalCandidates()[0]?.text ?? "";
  return wrap([
    card([
      h("p", { class: "mb-3 text-sm text-[var(--color-muted)]" }, [
        "Le token choisi est ajouté au prompt, qui grandit d'un token :",
      ]),
      h("p", { class: "anim-item text-xl" }, [
        `« ${state.prompt} `,
        h("span", { class: "font-bold text-[var(--color-active)]" }, [chosen]),
        " »",
      ]),
    ]),
  ]);
}

function renderLoop(state: AppState): HTMLElement {
  const chosen = state.chosenToken ?? computedFinalCandidates()[0]?.text ?? "";
  return wrap([
    card([
      h("p", { class: "mb-3 text-sm text-[var(--color-muted)]" }, [
        "Le cycle recommence avec le nouveau prompt. Chaque itération produit un token de plus.",
      ]),
      h(
        "p",
        {
          class:
            "anim-item rounded-lg bg-slate-50 p-3 text-center font-mono text-xs",
        },
        [
          "Prompt → Tokens → Embeddings → Transformer → Logits → Moteur → Probabilités → Choix → Prompt…",
        ],
      ),
      h("p", { class: "anim-item text-center text-sm" }, [
        `Prochain tour avec : « ${state.prompt} ${chosen} »`,
      ]),
      ...(state.mode === "image"
        ? [
            h(
              "p",
              {
                class:
                  "anim-item mt-3 rounded-lg bg-[var(--color-image-soft)] p-3 text-sm text-[var(--color-image)]",
              },
              [
                "🖼️ L'image a été encodée une seule fois : ses tokens image restent dans la séquence, seul le nouveau token texte est traité à chaque tour.",
              ],
            ),
          ]
        : []),
    ]),
  ]);
}

function renderEos(): HTMLElement {
  return wrap([
    card([
      h("p", { class: "mb-3 text-sm text-[var(--color-muted)]" }, [
        "La génération s'arrête lorsqu'un token de fin (EOS) est tiré, ou selon une autre condition d'arrêt (longueur maximale…).",
      ]),
      h(
        "div",
        {
          class:
            "anim-item flex items-center justify-center rounded-lg border-2 border-dashed border-[var(--color-active)] bg-[var(--color-active-soft)] py-6 text-xl font-bold text-[var(--color-active)]",
        },
        ["⟨EOS⟩ — fin de génération"],
      ),
    ]),
  ]);
}

// --- Étapes propres au mode « Texte + image » ---

const IMAGE_CHIP =
  "border-[var(--color-image)] bg-[var(--color-image-soft)] text-[var(--color-image)]";

function fmt(n: number): string {
  return n.toLocaleString("fr-FR");
}

/** Liste de référence : « nom → valeur » sur deux colonnes. */
function refList(title: string, rows: string[][]): HTMLElement {
  return h("div", { class: "anim-item mt-4" }, [
    h("p", { class: "mb-1 text-xs font-semibold text-[var(--color-muted)]" }, [
      title,
    ]),
    h(
      "ul",
      { class: "grid grid-cols-2 gap-x-6 gap-y-0.5 text-xs" },
      rows.map(([name, value]) =>
        h("li", { class: "flex items-baseline gap-2" }, [
          h("span", { class: "font-mono text-[var(--color-ink)]" }, [name]),
          h("span", { class: "text-[var(--color-muted)]" }, ["→"]),
          h("span", {}, [value]),
        ]),
      ),
    ),
  ]);
}

function dimBadge(value: string, label: string, image = false): HTMLElement {
  return h(
    "div",
    {
      class: `flex flex-col items-center rounded-lg border px-3 py-1.5 ${
        image
          ? IMAGE_CHIP
          : "border-[var(--color-border)] bg-slate-100 text-[var(--color-ink)]"
      }`,
    },
    [
      h("span", { class: "font-mono text-base font-bold" }, [value]),
      h("span", { class: "text-xs text-[var(--color-muted)]" }, [label]),
    ],
  );
}

/** Entrée → traitement → sortie, avec les longueurs de vecteur. */
function dimFlow(from: HTMLElement, via: string, to: HTMLElement): HTMLElement {
  const arrow = () =>
    h("span", { class: "text-xl text-[var(--color-muted)]" }, ["⟶"]);
  return h("div", { class: "anim-item mb-3 flex flex-wrap items-center gap-3" }, [
    from,
    arrow(),
    h(
      "span",
      {
        class:
          "rounded-md border border-dashed border-slate-400 px-2 py-1 text-xs text-[var(--color-muted)]",
      },
      [via],
    ),
    arrow(),
    to,
  ]);
}

function vectorView(values: number[], image = false): HTMLElement {
  return h("div", { class: "flex items-center gap-1 font-mono text-sm" }, [
    h("span", { class: "text-[var(--color-muted)]" }, ["["]),
    ...values.map((v) =>
      h(
        "span",
        {
          class: `tabular-nums ${
            image ? "text-[var(--color-image)]" : "text-[var(--color-ink)]"
          }`,
        },
        [`${v >= 0 ? " " : ""}${v.toFixed(2)},`],
      ),
    ),
    h("span", { class: "text-[var(--color-muted)]" }, ["…"]),
    h("span", { class: "text-[var(--color-muted)]" }, ["]"]),
  ]);
}

function patchThumb(row: number, col: number): HTMLElement {
  return h(
    "div",
    {
      class:
        "h-12 w-12 shrink-0 overflow-hidden rounded border border-[var(--color-border)]",
    },
    [createPatchView(row, col)],
  );
}

/** Numérotation à partir de 1 (ligne, colonne), plus naturelle pour le public. */
function patchLabel(row: number, col: number): string {
  return `patch (${row + 1}, ${col + 1})`;
}

function renderPatches(): HTMLElement {
  const { size, patchSize, grid, focusPatch, pixels } = IMAGE_DEMO;
  const total = grid * grid;
  const pixelRows = pixels.map(({ label, rgb }) => {
    const swatch = h("span", {
      class:
        "inline-block h-4 w-4 shrink-0 rounded border border-[var(--color-border)]",
    });
    swatch.style.background = `rgb(${rgb.join(",")})`;
    return h("div", { class: "flex items-center gap-2 text-xs" }, [
      swatch,
      h("span", { class: "w-20 text-[var(--color-muted)]" }, [label]),
      h("span", { class: "font-mono" }, [`(${rgb.join(", ")})`]),
    ]);
  });
  const stat = (text: string, image = false) =>
    h(
      "span",
      {
        class: `rounded-lg border px-3 py-1.5 font-mono text-sm font-semibold ${
          image
            ? IMAGE_CHIP
            : "border-[var(--color-border)] bg-slate-100 text-[var(--color-ink)]"
        }`,
      },
      [text],
    );

  return wrap([
    card([
      h("p", { class: "mb-4 text-sm text-[var(--color-muted)]" }, [
        `Pour le modèle, l'image est une grille de ${size} × ${size} pixels, chacun décrit par 3 valeurs (rouge, vert, bleu). Elle est découpée en carrés de ${patchSize} × ${patchSize} pixels : les patches.`,
      ]),
      h("div", { class: "anim-item flex flex-wrap items-start gap-6" }, [
        h(
          "div",
          {
            class:
              "w-64 max-w-full shrink-0 overflow-hidden rounded-lg border border-[var(--color-border)]",
          },
          [createCatImage({ grid: true, highlight: focusPatch })],
        ),
        h("div", { class: "flex flex-col gap-3" }, [
          h(
            "div",
            {
              class:
                "h-40 w-40 overflow-hidden rounded-lg border-2 border-[var(--color-active)]",
            },
            [createPatchView(focusPatch.row, focusPatch.col, true)],
          ),
          h("p", { class: "text-xs font-semibold text-[var(--color-ink)]" }, [
            `Zoom sur un patch : ${patchSize} × ${patchSize} pixels`,
          ]),
          h("div", { class: "flex flex-col gap-1" }, pixelRows),
          h("p", { class: "text-xs text-[var(--color-muted)]" }, [
            `${patchSize} × ${patchSize} pixels × 3 couleurs (R, V, B) = ${patchSize * patchSize * 3} valeurs par patch`,
          ]),
        ]),
      ]),
      h("div", { class: "anim-item mt-5 flex flex-wrap items-center gap-3" }, [
        stat(`${size} × ${size} pixels`),
        h("span", { class: "text-xl text-[var(--color-muted)]" }, ["⟶"]),
        stat(`${grid} × ${grid} = ${total} patches`, true),
      ]),
      h("p", { class: "anim-item mt-3 text-xs text-[var(--color-muted)]" }, [
        `Ici : ${patchSize} × ${patchSize} pixels. Dans les VLM, les tailles les plus courantes sont 14 × 14 (CLIP, SigLIP, Qwen-VL) et 16 × 16 (ViT, Pixtral).`,
      ]),
    ]),
  ]);
}

function renderVisionEncoder(): HTMLElement {
  const { grid, samples, patchSize, encoderDim } = IMAGE_DEMO;
  const rows = samples.map((s) =>
    h("div", { class: "anim-item flex items-center gap-3" }, [
      patchThumb(s.row, s.col),
      h(
        "span",
        {
          class:
            "w-24 shrink-0 text-right font-mono text-xs text-[var(--color-muted)]",
        },
        [patchLabel(s.row, s.col)],
      ),
      h("span", { class: "text-[var(--color-muted)]" }, ["→"]),
      vectorView(s.encoded),
    ]),
  );
  return wrap([
    card([
      h("p", { class: "mb-3 text-sm text-[var(--color-muted)]" }, [
        "Chaque patch passe dans un encodeur visuel qui le transforme en un vecteur.",
      ]),
      dimFlow(
        dimBadge(fmt(patchSize * patchSize * 3), "valeurs de pixels"),
        "encodeur visuel",
        dimBadge(fmt(encoderDim), "nombres (vecteur)", true),
      ),
      h("p", { class: "mb-3 text-xs text-[var(--color-muted)]" }, [
        `Quelques patches d'exemple (ligne, colonne). Un vrai vecteur compte par exemple ${fmt(encoderDim)} nombres ; on n'en montre que 6 :`,
      ]),
      h("div", { class: "flex flex-col gap-3" }, rows),
      h("p", { class: "anim-item mt-4 text-sm font-semibold" }, [
        `Au total : ${grid * grid} patches → ${grid * grid} vecteurs.`,
      ]),
      h("p", { class: "anim-item mt-2 text-xs text-[var(--color-muted)]" }, [
        "Contrairement aux tokens texte, ce vecteur n'est pas lu dans une table : il est calculé par un réseau de neurones (l'encodeur visuel, souvent un ViT).",
      ]),
      refList(
        "Longueur du vecteur en sortie, sur quelques encodeurs visuels :",
        VISION_ENCODERS.map((e) => [e.name, `${fmt(e.dim)} nombres`]),
      ),
    ]),
  ]);
}

function renderImageTokens(): HTMLElement {
  const { samples, encoderDim, llmDim } = IMAGE_DEMO;
  const rows = samples.slice(0, 3).map((s) =>
    h("div", { class: "anim-item flex items-center gap-3" }, [
      patchThumb(s.row, s.col),
      h("div", { class: "flex flex-col gap-1" }, [
        h("div", { class: "flex items-center gap-2" }, [
          h(
            "span",
            { class: "w-28 shrink-0 text-xs text-[var(--color-muted)]" },
            [`encodeur · ${fmt(encoderDim)}`],
          ),
          vectorView(s.encoded),
        ]),
        h("div", { class: "flex items-center gap-2" }, [
          h(
            "span",
            { class: "w-28 shrink-0 text-xs text-[var(--color-image)]" },
            [`projeté · ${fmt(llmDim)}`],
          ),
          vectorView(s.projected, true),
        ]),
      ]),
    ]),
  );
  const chip = (top: string, bottom: string, image: boolean) =>
    h(
      "div",
      {
        class: `flex flex-col items-center rounded-lg border px-3 py-2 ${
          image
            ? IMAGE_CHIP
            : "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
        }`,
      },
      [
        h("span", { class: "font-mono text-lg font-semibold" }, [top]),
        h("span", { class: "mt-1 text-xs text-[var(--color-muted)]" }, [
          bottom,
        ]),
      ],
    );
  return wrap([
    card([
      h("p", { class: "mb-3 text-sm text-[var(--color-muted)]" }, [
        `Pourquoi projeter ? L'encodeur visuel et le LLM ont été conçus séparément : leurs vecteurs n'ont pas la même longueur. Le LLM n'accepte que des vecteurs de sa taille, la même que celle de ses embeddings de tokens texte. Le projecteur, un petit réseau (souvent 1 ou 2 couches linéaires), convertit chaque vecteur.`,
      ]),
      dimFlow(
        dimBadge(fmt(encoderDim), "nombres (encodeur)"),
        "projecteur",
        dimBadge(fmt(llmDim), "nombres (token image)", true),
      ),
      h(
        "p",
        {
          class: `anim-item mb-3 rounded-lg border px-3 py-2 text-sm font-semibold ${IMAGE_CHIP}`,
        },
        [
          `« Chaque patch est projeté séparément : 1 vecteur de patch → 1 token image. Ici, ${IMAGE_DEMO.grid * IMAGE_DEMO.grid} patches → ${IMAGE_DEMO.grid * IMAGE_DEMO.grid} tokens image. »`,
        ],
      ),
      h("p", { class: "mb-3 text-xs text-[var(--color-muted)]" }, [
        "Quelques patches d'exemple (6 premières valeurs de chaque vecteur) :",
      ]),
      h("div", { class: "flex flex-col gap-3" }, rows),
      h("p", { class: "anim-item mt-4 mb-2 text-sm font-semibold" }, [
        "Token texte ou token image ?",
      ]),
      h("div", { class: "anim-item flex flex-wrap items-center gap-4" }, [
        chip(" chat", "#15821 (fictif)", false),
        chip(
          patchLabel(samples[1].row, samples[1].col),
          "aucun identifiant",
          true,
        ),
      ]),
      h("p", { class: "anim-item mt-3 text-xs text-[var(--color-muted)]" }, [
        "Un token texte vient de la table d'embeddings via son identifiant. Un token image a la même forme qu'un embedding, mais ne correspond à aucun mot du vocabulaire.",
      ]),
      refList(
        "Longueur avant → après le projecteur, sur quelques VLM open weight :",
        PROJECTORS.map((p) => [
          p.name,
          `${fmt(p.from)} → ${fmt(p.to)} nombres`,
        ]),
      ),
    ]),
  ]);
}

function renderSequence(state: AppState): HTMLElement {
  const { grid, llmDim } = IMAGE_DEMO;
  const imageCount = grid * grid;
  const total = imageCount + 2 + state.tokens.length;
  const marker = (text: string) =>
    h(
      "div",
      {
        class:
          "anim-item rounded-lg border border-slate-400 bg-slate-200 px-2 py-1 font-mono text-sm text-slate-700",
      },
      [text],
    );
  const imageChip = (text: string) =>
    h(
      "div",
      {
        class: `anim-item rounded-lg border px-2 py-1 font-mono text-sm ${IMAGE_CHIP}`,
      },
      [text],
    );
  const textChips = state.tokens.map((t) =>
    h(
      "div",
      {
        class:
          "anim-item flex flex-col items-center rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-2 py-1",
      },
      [
        h("span", { class: "font-mono text-sm font-semibold" }, [
          t.text.trim() === "" ? "␣" : t.text,
        ]),
        h("span", { class: "text-[10px] text-[var(--color-muted)]" }, [
          `#${t.id}`,
        ]),
      ],
    ),
  );
  return wrap([
    card([
      h("p", { class: "mb-3 text-sm text-[var(--color-muted)]" }, [
        "Les tokens image sont encadrés par deux meta tokens (voir l'étape Tokenisation ; leur nom varie selon le modèle), suivis des tokens du texte : une seule séquence entre dans le Transformer.",
      ]),
      h("div", { class: "flex flex-wrap items-center gap-2" }, [
        marker("<img>"),
        imageChip("img 1"),
        imageChip("img 2"),
        imageChip("img 3"),
        imageChip(`⋯ ${imageCount} au total`),
        marker("</img>"),
        ...textChips,
      ]),
      h("p", { class: "anim-item mt-4 text-sm font-semibold" }, [
        `${imageCount} tokens image + 2 meta tokens + ${state.tokens.length} tokens texte = ${total} tokens`,
      ]),
      h("p", { class: "anim-item mt-1 text-xs text-[var(--color-muted)]" }, [
        "Identifiants des tokens texte fictifs.",
      ]),
      h("p", { class: "anim-item mt-2 text-sm" }, [
        `Chaque token est un vecteur de ${fmt(llmDim)} nombres : la séquence représente ${total} × ${fmt(llmDim)} = ${fmt(total * llmDim)} nombres.`,
      ]),
      h("p", { class: "anim-item mt-2 text-xs text-[var(--color-muted)]" }, [
        "Une image consomme beaucoup de contexte : ici ",
        `${imageCount} tokens contre ${state.tokens.length} pour toute la question.`,
      ]),
    ]),
  ]);
}
