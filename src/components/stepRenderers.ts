import { h } from "../dom";
import type { AppState, StepId } from "../types";
import { computedCandidates } from "../store";
import { formatProbability } from "../engine";

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
      return renderTransformer();
    case "logits":
      return renderLogits(state);
    case "temperature":
      return renderTemperature(state);
    case "topk-topp":
      return renderTopKP(state);
    case "softmax":
      return renderSoftmax();
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
  }
}

function wrap(children: (Node | string)[]): HTMLElement {
  return h("div", { class: "flex flex-col gap-6" }, children);
}

function card(children: (Node | string)[], extra = ""): HTMLElement {
  return h(
    "div",
    {
      class: `anim-item rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm ${extra}`
    },
    children
  );
}

function renderPrompt(state: AppState): HTMLElement {
  return wrap([
    card([
      h("p", { class: "mb-2 text-sm text-[var(--color-muted)]" }, [
        "Le prompt fourni au modèle :"
      ]),
      h("p", { class: "text-2xl font-semibold text-[var(--color-ink)]" }, [
        `« ${state.prompt} »`
      ])
    ])
  ]);
}

function renderTokenize(state: AppState): HTMLElement {
  const chips = state.tokens.map((t) =>
    h(
      "div",
      {
        class:
          "anim-item flex flex-col items-center rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-3 py-2"
      },
      [
        h("span", { class: "font-mono text-lg font-semibold" }, [
          t.text.trim() === "" ? "␣" : t.text
        ]),
        h("span", { class: "mt-1 text-xs text-[var(--color-muted)]" }, [
          `#${t.id}`
        ])
      ]
    )
  );
  return wrap([
    card([
      h("p", { class: "mb-3 text-sm text-[var(--color-muted)]" }, [
        "La phrase est découpée en tokens, chacun avec un identifiant :"
      ]),
      h("div", { class: "flex flex-wrap gap-2" }, chips)
    ])
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
            "w-12 shrink-0 text-right font-mono text-sm text-[var(--color-ink)]"
        },
        [emb.tokenText.trim() || "␣"]
      ),
      h(
        "span",
        {
          class:
            "w-16 shrink-0 text-right font-mono text-xs text-[var(--color-muted)]"
        },
        [token ? `#${token.id}` : ""]
      ),
      h("span", { class: "text-[var(--color-muted)]" }, ["→"]),
      h("div", { class: "flex items-center gap-1 font-mono text-sm" }, [
        h("span", { class: "text-[var(--color-muted)]" }, ["["]),
        ...emb.values.map((v, i) =>
          h("span", { class: "tabular-nums text-[var(--color-ink)]" }, [
            `${v >= 0 ? " " : ""}${v.toFixed(2)}${
              i < emb.values.length - 1 ? "," : ""
            }`
          ])
        ),
        h("span", { class: "text-[var(--color-muted)]" }, ["]"])
      ])
    ]);
  });
  return wrap([
    card([
      h("p", { class: "mb-3 text-sm text-[var(--color-muted)]" }, [
        "Chaque token est lu dans une table d'embeddings et devient un vecteur. Représentation simplifiée (6 dimensions au lieu de plusieurs milliers) :"
      ]),
      h("div", { class: "flex flex-col gap-2" }, rows)
    ])
  ]);
}

function renderTransformer(): HTMLElement {
  const layers = Array.from({ length: 4 }, (_, i) =>
    h(
      "div",
      {
        class:
          "anim-item rounded-md border border-slate-500 bg-slate-800 px-4 py-2 text-center text-sm font-medium text-slate-100"
      },
      [`Couche ${i + 1}`]
    )
  );
  return wrap([
    card(
      [
        h("p", { class: "mb-3 text-sm text-slate-300" }, [
          "Les embeddings traversent le Transformer — une boîte noire à plusieurs couches. On ne montre pas l'intérieur (attention, feed-forward…)."
        ]),
        h("div", { class: "flex flex-col gap-2" }, layers)
      ],
      "!bg-slate-900 !border-slate-700 text-slate-100"
    )
  ]);
}

function renderLogits(state: AppState): HTMLElement {
  const maxAbs = Math.max(...state.candidates.map((c) => Math.abs(c.logit)));
  const bars = state.candidates.map((c) =>
    h("div", { class: "anim-item flex items-center gap-3" }, [
      h("span", { class: "w-28 shrink-0 text-sm" }, [c.text]),
      h("div", { class: "relative h-5 flex-1 rounded bg-slate-100" }, [
        (() => {
          const bar = h("div", {
            class: "absolute top-0 h-5 rounded"
          });
          const w = (Math.abs(c.logit) / maxAbs) * 50;
          bar.style.width = `${w}%`;
          bar.style.left = c.logit >= 0 ? "50%" : `${50 - w}%`;
          bar.style.background =
            c.logit >= 0 ? "var(--color-accent)" : "var(--color-active)";
          return bar;
        })()
      ]),
      h("span", { class: "w-14 shrink-0 text-right font-mono text-sm" }, [
        c.logit.toFixed(1)
      ])
    ])
  );
  return wrap([
    card([
      h("p", { class: "mb-1 text-sm text-[var(--color-muted)]" }, [
        "Le modèle produit un logit (score brut) pour chaque token du vocabulaire — environ "
      ]),
      h("p", { class: "mb-3 text-sm font-semibold text-[var(--color-ink)]" }, [
        `${state.vocabSize.toLocaleString("fr-FR")} tokens.`
      ]),
      h("p", { class: "mb-3 text-xs text-[var(--color-muted)]" }, [
        "Les logits peuvent être positifs ou négatifs. Ce ne sont pas des probabilités. Aperçu de quelques tokens :"
      ]),
      h("div", { class: "flex flex-col gap-2" }, bars)
    ])
  ]);
}

function renderTemperature(state: AppState): HTMLElement {
  return wrap([
    card([
      h("p", { class: "mb-3 text-sm text-[var(--color-muted)]" }, [
        "Le moteur d'inférence divise chaque logit par la température T. Une température basse accentue les écarts (choix sûr), une température haute les lisse (plus de diversité)."
      ]),
      h("div", { class: "anim-item flex items-baseline gap-2" }, [
        h("span", { class: "text-sm text-[var(--color-muted)]" }, [
          "Température T ="
        ]),
        h("span", { class: "text-3xl font-bold text-[var(--color-accent)]" }, [
          state.params.temperature.toString()
        ])
      ])
    ])
  ]);
}

function renderTopKP(state: AppState): HTMLElement {
  return wrap([
    card([
      h("p", { class: "mb-3 text-sm text-[var(--color-muted)]" }, [
        "Des filtres restreignent l'ensemble des candidats avant le tirage :"
      ]),
      h("ul", { class: "flex flex-col gap-2 text-sm" }, [
        h("li", { class: "anim-item" }, [
          `top-k = ${state.params.topK} : on ne garde que les k tokens les plus probables.`
        ]),
        h("li", { class: "anim-item" }, [
          `top-p = ${state.params.topP} : on garde les tokens jusqu'à cumuler ${Math.round(
            state.params.topP * 100
          )} % de la masse de probabilité.`
        ])
      ])
    ])
  ]);
}

function renderSoftmax(): HTMLElement {
  return wrap([
    card([
      h("p", { class: "mb-3 text-sm text-[var(--color-muted)]" }, [
        "Un unique Softmax transforme les logits filtrés en probabilités qui somment à 1 :"
      ]),
      h(
        "div",
        {
          class:
            "anim-item rounded-lg bg-slate-50 p-4 text-center font-mono text-sm"
        },
        ["p(i) = exp(logit(i) / T) / Σ exp(logit(j) / T)"]
      )
    ])
  ]);
}

function probabilityList(highlightChosen: string | null): HTMLElement {
  const cands = computedCandidates();
  const max = cands[0]?.probability ?? 1;
  const rows = cands.map((c) =>
    h(
      "div",
      {
        class: `anim-item flex items-center gap-3 rounded-lg px-2 py-1 ${
          highlightChosen === c.text
            ? "bg-[var(--color-active-soft)] ring-2 ring-[var(--color-active)]"
            : ""
        }`
      },
      [
        h(
          "span",
          {
            class: `w-28 shrink-0 text-sm ${
              c.surprising ? "text-[var(--color-muted)] italic" : ""
            }`
          },
          [c.text]
        ),
        h("div", { class: "h-5 flex-1 rounded bg-slate-100" }, [
          (() => {
            const bar = h("div", { class: "h-5 rounded" });
            bar.style.width = `${Math.max((c.probability / max) * 100, 1)}%`;
            bar.style.background = c.surprising
              ? "var(--color-muted)"
              : "var(--color-accent)";
            return bar;
          })()
        ]),
        h("span", { class: "w-20 shrink-0 text-right font-mono text-sm" }, [
          formatProbability(c.probability)
        ])
      ]
    )
  );
  return h("div", { class: "flex flex-col gap-1.5" }, rows);
}

function renderProbabilities(): HTMLElement {
  return wrap([
    card([
      h("p", { class: "mb-3 text-sm text-[var(--color-muted)]" }, [
        "Les tokens cohérents ont une forte probabilité ; les tokens surprenants (forte perplexité) une probabilité minuscule — mais tout le vocabulaire est évalué."
      ]),
      probabilityList(null)
    ])
  ]);
}

function renderSampling(state: AppState): HTMLElement {
  const chosen = state.chosenToken ?? computedCandidates()[0]?.text ?? "";
  return wrap([
    card([
      h("p", { class: "mb-3 text-sm text-[var(--color-muted)]" }, [
        "Le moteur échantillonne un token selon ces probabilités — pas forcément le plus probable."
      ]),
      probabilityList(chosen),
      h("p", { class: "anim-item mt-4 text-center text-lg" }, [
        "Token choisi : ",
        h("strong", { class: "text-[var(--color-active)]" }, [`« ${chosen} »`])
      ])
    ])
  ]);
}

function renderAppend(state: AppState): HTMLElement {
  const chosen = state.chosenToken ?? computedCandidates()[0]?.text ?? "";
  return wrap([
    card([
      h("p", { class: "mb-3 text-sm text-[var(--color-muted)]" }, [
        "Le token choisi est ajouté au prompt, qui grandit d'un token :"
      ]),
      h("p", { class: "anim-item text-xl" }, [
        `« ${state.prompt} `,
        h("span", { class: "font-bold text-[var(--color-active)]" }, [chosen]),
        " »"
      ])
    ])
  ]);
}

function renderLoop(state: AppState): HTMLElement {
  const chosen = state.chosenToken ?? computedCandidates()[0]?.text ?? "";
  return wrap([
    card([
      h("p", { class: "mb-3 text-sm text-[var(--color-muted)]" }, [
        "Le cycle recommence avec le nouveau prompt. Chaque itération produit un token de plus."
      ]),
      h(
        "p",
        {
          class:
            "anim-item rounded-lg bg-slate-50 p-3 text-center font-mono text-xs"
        },
        [
          "Prompt → Tokens → Embeddings → Transformer → Logits → Moteur → Probabilités → Choix → Prompt…"
        ]
      ),
      h("p", { class: "anim-item text-center text-sm" }, [
        `Prochain tour avec : « ${state.prompt} ${chosen} »`
      ])
    ])
  ]);
}

function renderEos(): HTMLElement {
  return wrap([
    card([
      h("p", { class: "mb-3 text-sm text-[var(--color-muted)]" }, [
        "La génération s'arrête lorsqu'un token de fin (EOS) est tiré, ou selon une autre condition d'arrêt (longueur maximale…)."
      ]),
      h(
        "div",
        {
          class:
            "anim-item flex items-center justify-center rounded-lg border-2 border-dashed border-[var(--color-active)] bg-[var(--color-active-soft)] py-6 text-xl font-bold text-[var(--color-active)]"
        },
        ["⟨EOS⟩ — fin de génération"]
      )
    ])
  ]);
}
