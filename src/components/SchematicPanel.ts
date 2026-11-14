import { h, svgEl } from "../dom";
import { stepsFor } from "../scenario";
import { store } from "../store";
import type { Mode, SchematicNodeId } from "../types";

/** Forme visuelle d'une boîte (Gestalt : une forme = un rôle). */
type Shape = "io" | "process" | "terminal";

interface BoxDef {
  id: SchematicNodeId;
  label: string;
  sublabel?: string;
  shape: Shape;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Boîte de la branche image (teinte dédiée). */
  image?: boolean;
}

interface ContainerDef {
  label: string;
  variant: "engine" | "model";
  x: number;
  y: number;
  w: number;
  h: number;
  /** Libellé centré (évite les flèches verticales des branches). */
  centeredLabel?: boolean;
}

interface Edge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** Plan complet du schéma pour un mode (données pures, sans DOM). */
interface Layout {
  height: number;
  containers: ContainerDef[];
  /** Toutes les boîtes, y compris contrôle de flux. */
  boxes: BoxDef[];
  /** Flèches de la chaîne de calcul. */
  edges: Edge[];
  prompt: BoxDef;
  /** Dernière boîte de la chaîne (le token produit), avant la décision. */
  token: BoxDef;
  output: BoxDef;
  end: BoxDef;
  /** Losange de décision : le token produit est-il un token de fin (EOS) ? */
  decision: { cx: number; cy: number; hw: number; hh: number; label: string };
}

const CENTER_X = 190;
const IO_SKEW = 16;

/** Flèche verticale du bas d'une boîte vers le haut d'une autre. */
function vEdge(from: BoxDef, to: BoxDef, x = CENTER_X): Edge {
  return { x1: x, y1: from.y + from.h, x2: x, y2: to.y };
}

function box(def: BoxDef): BoxDef {
  return def;
}

// Mode Texte : chaîne linéaire. Le MOTEUR englobe le LLM.
function textLayout(): Layout {
  const pipeline: BoxDef[] = [
    box({
      id: "prompt",
      label: "Prompt",
      shape: "io",
      x: 80,
      y: 18,
      w: 220,
      h: 46,
    }),
    box({
      id: "tokenizer",
      label: "Tokenisation",
      shape: "process",
      x: 48,
      y: 122,
      w: 284,
      h: 46,
    }),
    box({
      id: "embeddings",
      label: "Embeddings",
      shape: "process",
      x: 64,
      y: 222,
      w: 252,
      h: 46,
    }),
    box({
      id: "transformer",
      label: "Transformer",
      sublabel: "boîte noire · N couches",
      shape: "process",
      x: 64,
      y: 288,
      w: 252,
      h: 54,
    }),
    box({
      id: "logits",
      label: "Logits",
      sublabel: "scores bruts",
      shape: "process",
      x: 64,
      y: 362,
      w: 252,
      h: 54,
    }),
    box({
      id: "engine",
      label: "Décodage",
      sublabel: "top-k · softmax/T · top-p · choix",
      shape: "process",
      x: 48,
      y: 454,
      w: 284,
      h: 54,
    }),
    box({
      id: "probabilities",
      label: "Token",
      shape: "io",
      x: 80,
      y: 528,
      w: 220,
      h: 46,
    }),
  ];
  const output = box({
    id: "output",
    label: "Nouveau prompt",
    shape: "io",
    x: 80,
    y: 696,
    w: 220,
    h: 46,
  });
  const end = box({
    id: "end",
    label: "Fin",
    shape: "terminal",
    x: 16,
    y: 610,
    w: 96,
    h: 44,
  });

  return {
    height: 760,
    containers: [
      {
        label: "Moteur d'inférence",
        variant: "engine",
        x: 18,
        y: 88,
        w: 344,
        h: 506,
      },
      {
        label: "LLM · modèle",
        variant: "model",
        x: 42,
        y: 190,
        w: 296,
        h: 242,
      },
    ],
    boxes: [...pipeline, output, end],
    edges: pipeline.slice(0, -1).map((b, i) => vEdge(b, pipeline[i + 1])),
    prompt: pipeline[0],
    token: pipeline[pipeline.length - 1],
    output,
    end,
    decision: { cx: CENTER_X, cy: 632, hw: 50, hh: 30, label: "EOS ?" },
  };
}

// Mode Texte + image : deux branches (texte à gauche, image à droite)
// qui fusionnent dans la séquence avant le Transformer.
function imageLayout(): Layout {
  const LEFT = 106;
  const RIGHT = 274;
  const BW = 140;
  const left = LEFT - BW / 2;
  const right = RIGHT - BW / 2;

  const prompt = box({
    id: "prompt",
    label: "Prompt",
    sublabel: "image + texte",
    shape: "io",
    x: 40,
    y: 18,
    w: 320,
    h: 46,
  });
  const tokenizer = box({
    id: "tokenizer",
    label: "Tokenisation",
    shape: "process",
    x: left,
    y: 122,
    w: BW,
    h: 46,
  });
  const embeddings = box({
    id: "embeddings",
    label: "Embeddings",
    shape: "process",
    x: left,
    y: 258,
    w: BW,
    h: 46,
  });
  const patches = box({
    id: "patches",
    label: "Patches",
    sublabel: "grille 14 × 14",
    shape: "process",
    x: right,
    y: 122,
    w: BW,
    h: 46,
    image: true,
  });
  const vision = box({
    id: "vision-encoder",
    label: "Encodeur visuel",
    sublabel: "1 vecteur / patch",
    shape: "process",
    x: right,
    y: 190,
    w: BW,
    h: 46,
    image: true,
  });
  const projector = box({
    id: "projector",
    label: "Projecteur",
    sublabel: "→ tokens image",
    shape: "process",
    x: right,
    y: 258,
    w: BW,
    h: 46,
    image: true,
  });
  const sequence = box({
    id: "sequence",
    label: "Séquence",
    sublabel: "tokens image + texte",
    shape: "process",
    x: 64,
    y: 326,
    w: 252,
    h: 46,
    image: true,
  });
  const transformer = box({
    id: "transformer",
    label: "Transformer",
    sublabel: "boîte noire · N couches",
    shape: "process",
    x: 64,
    y: 392,
    w: 252,
    h: 54,
  });
  const logits = box({
    id: "logits",
    label: "Logits",
    sublabel: "scores bruts",
    shape: "process",
    x: 64,
    y: 466,
    w: 252,
    h: 54,
  });
  const engine = box({
    id: "engine",
    label: "Décodage",
    sublabel: "top-k · softmax/T · top-p · choix",
    shape: "process",
    x: 48,
    y: 558,
    w: 284,
    h: 54,
  });
  const token = box({
    id: "probabilities",
    label: "Token",
    shape: "io",
    x: 80,
    y: 632,
    w: 220,
    h: 46,
  });
  const output = box({
    id: "output",
    label: "Nouveau prompt",
    shape: "io",
    x: 80,
    y: 800,
    w: 220,
    h: 46,
  });
  const end = box({
    id: "end",
    label: "Fin",
    shape: "terminal",
    x: 16,
    y: 714,
    w: 96,
    h: 44,
  });

  return {
    height: 864,
    containers: [
      {
        label: "Moteur d'inférence",
        variant: "engine",
        x: 18,
        y: 88,
        w: 344,
        h: 610,
        centeredLabel: true,
      },
      {
        label: "LLM · modèle",
        variant: "model",
        x: 24,
        y: 240,
        w: 332,
        h: 296,
        centeredLabel: true,
      },
    ],
    boxes: [
      prompt,
      tokenizer,
      patches,
      vision,
      embeddings,
      projector,
      sequence,
      transformer,
      logits,
      engine,
      token,
      output,
      end,
    ],
    edges: [
      vEdge(prompt, tokenizer, LEFT),
      vEdge(prompt, patches, RIGHT),
      vEdge(tokenizer, embeddings, LEFT),
      vEdge(patches, vision, RIGHT),
      vEdge(vision, projector, RIGHT),
      vEdge(embeddings, sequence, LEFT),
      vEdge(projector, sequence, RIGHT),
      vEdge(sequence, transformer),
      vEdge(transformer, logits),
      vEdge(logits, engine),
      vEdge(engine, token),
    ],
    prompt,
    token,
    output,
    end,
    decision: { cx: CENTER_X, cy: 736, hw: 50, hh: 30, label: "EOS ?" },
  };
}

function layoutFor(mode: Mode): Layout {
  return mode === "image" ? imageLayout() : textLayout();
}

/** Points d'un parallélogramme (forme des entrées / sorties). */
function parallelogramPoints(b: BoxDef): string {
  return [
    `${b.x + IO_SKEW},${b.y}`,
    `${b.x + b.w},${b.y}`,
    `${b.x + b.w - IO_SKEW},${b.y + b.h}`,
    `${b.x},${b.y + b.h}`,
  ].join(" ");
}

/** Petite étiquette de branche (« oui » / « non »). */
function branchLabel(x: number, y: number, text: string): SVGElement {
  const t = svgEl("text", {
    x,
    y,
    "text-anchor": "middle",
    "font-size": 10,
    "font-weight": 700,
    fill: "#64748b",
  });
  t.textContent = text;
  return t;
}

function arrowLine(e: Edge): SVGElement {
  return svgEl("line", {
    ...e,
    stroke: "#94a3b8",
    "stroke-width": 2,
    "marker-end": "url(#arrow)",
  });
}

/** Couleurs au repos d'une boîte. */
function baseColors(b: BoxDef): { fill: string; stroke: string } {
  if (b.image)
    return { fill: "var(--color-image-soft)", stroke: "var(--color-image)" };
  if (b.shape === "process") return { fill: "#ffffff", stroke: "#cbd5e1" };
  return { fill: "#e2e8f0", stroke: "#475569" };
}

interface BuiltSvg {
  svg: SVGElement;
  nodes: Map<
    SchematicNodeId,
    { shape: SVGElement; base: { fill: string; stroke: string } }
  >;
}

function buildSvg(mode: Mode): BuiltSvg {
  const layout = layoutFor(mode);
  const { prompt, token, output, end, decision } = layout;

  const svg = svgEl("svg", {
    viewBox: `0 0 400 ${layout.height}`,
    class: "h-full min-h-0 w-full",
    "aria-label": "Plan global du pipeline d'inférence",
  });

  // Marqueur de flèche.
  const defs = svgEl("defs");
  const marker = svgEl("marker", {
    id: "arrow",
    viewBox: "0 0 10 10",
    refX: 8,
    refY: 5,
    markerWidth: 7,
    markerHeight: 7,
    orient: "auto-start-reverse",
  });
  marker.append(svgEl("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: "#94a3b8" }));
  defs.append(marker);
  svg.append(defs);

  // --- Conteneurs (arrière-plan) : le moteur englobe le LLM imbriqué. ---
  for (const c of layout.containers) {
    const isEngine = c.variant === "engine";
    const rect = svgEl("rect", {
      x: c.x,
      y: c.y,
      width: c.w,
      height: c.h,
      rx: isEngine ? 16 : 12,
      fill: isEngine ? "var(--color-accent-soft)" : "#ffffff",
      "fill-opacity": isEngine ? 0.5 : 0.9,
      stroke: isEngine ? "var(--color-accent)" : "#475569",
      "stroke-width": isEngine ? 2 : 1.5,
      "stroke-dasharray": isEngine ? "6 4" : "4 3",
    });
    const label = svgEl("text", {
      x: c.centeredLabel ? c.x + c.w / 2 : c.x + 12,
      y: c.centeredLabel ? c.y + 14 : c.y + 17,
      "text-anchor": c.centeredLabel ? "middle" : "start",
      "font-size": 10,
      "font-weight": 700,
      "letter-spacing": "0.06em",
      fill: isEngine ? "var(--color-accent)" : "#475569",
    });
    label.textContent = c.label.toUpperCase();
    svg.append(rect, label);
  }

  // --- Flèches de la chaîne de calcul. ---
  for (const e of layout.edges) svg.append(arrowLine(e));

  // --- Losange de décision « EOS ? ». ---
  const { cx, cy, hw, hh } = decision;

  // Token → décision.
  svg.append(
    arrowLine({
      x1: CENTER_X,
      y1: token.y + token.h,
      x2: CENTER_X,
      y2: cy - hh,
    }),
  );

  // Décision --oui--> Fin (vers la gauche).
  svg.append(
    arrowLine({ x1: cx - hw, y1: cy, x2: end.x + end.w, y2: cy }),
    branchLabel((cx - hw + end.x + end.w) / 2, cy - 6, "oui"),
  );

  // Décision --non--> Nouveau prompt (vers le bas).
  svg.append(
    arrowLine({ x1: CENTER_X, y1: cy + hh, x2: CENTER_X, y2: output.y }),
    branchLabel(cx + 14, cy + hh + 16, "non"),
  );

  const diamond = svgEl("polygon", {
    points: `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`,
    fill: "#ffffff",
    stroke: "#475569",
    "stroke-width": 2,
  });
  const diamondLabel = svgEl("text", {
    x: cx,
    y: cy + 5,
    "text-anchor": "middle",
    "font-size": 14,
    "font-weight": 700,
    fill: "#1e293b",
  });
  diamondLabel.textContent = decision.label;
  svg.append(diamond, diamondLabel);

  // --- Flèche de bouclage (Nouveau prompt → Prompt) sur le côté droit. ---
  const yTop = prompt.y + prompt.h / 2;
  const yBottom = output.y + output.h / 2;
  const loopMidY = (yTop + yBottom) / 2;
  const loop = svgEl("path", {
    d: `M ${output.x + output.w - IO_SKEW / 2} ${yBottom} C 392 ${yBottom}, 392 ${yTop}, ${prompt.x + prompt.w - IO_SKEW / 2} ${yTop}`,
    fill: "none",
    stroke: "#cbd5e1",
    "stroke-width": 2,
    "stroke-dasharray": "5 4",
    "marker-end": "url(#arrow)",
  });
  const loopLabel = svgEl("text", {
    x: 388,
    y: loopMidY,
    "text-anchor": "middle",
    "font-size": 9,
    "font-weight": 700,
    fill: "#94a3b8",
    transform: `rotate(-90 388 ${loopMidY})`,
  });
  loopLabel.textContent = "BOUCLE";
  svg.append(loop, loopLabel);

  // --- Boîtes. ---
  const nodes: BuiltSvg["nodes"] = new Map();
  for (const b of layout.boxes) {
    const base = baseColors(b);
    const group = svgEl("g", { "data-node": b.id });
    let shape: SVGElement;
    if (b.shape === "io") {
      shape = svgEl("polygon", {
        points: parallelogramPoints(b),
        fill: base.fill,
        stroke: base.stroke,
        "stroke-width": 2,
        class: "schematic-shape",
      });
    } else {
      shape = svgEl("rect", {
        x: b.x,
        y: b.y,
        width: b.w,
        height: b.h,
        rx: b.shape === "terminal" ? b.h / 2 : 8,
        fill: base.fill,
        stroke: base.stroke,
        "stroke-width": 2,
        class: "schematic-shape",
      });
    }
    const centerX = b.x + b.w / 2;
    const label = svgEl("text", {
      x: centerX,
      y: b.sublabel ? b.y + 22 : b.y + b.h / 2 + 5,
      "text-anchor": "middle",
      "font-size": 15,
      "font-weight": 600,
      fill: "#1e293b",
    });
    label.textContent = b.label;
    group.append(shape, label);
    if (b.sublabel) {
      const sub = svgEl("text", {
        x: centerX,
        y: b.y + 39,
        "text-anchor": "middle",
        "font-size": 10,
        fill: "#64748b",
      });
      sub.textContent = b.sublabel;
      group.append(sub);
    }
    svg.append(group);
    nodes.set(b.id, { shape, base });
  }

  return { svg, nodes };
}

/**
 * Panneau droit — plan global. Le moteur d'inférence englobe le LLM ;
 * les entrées / sorties (parallélogrammes) se distinguent des
 * traitements (rectangles). Un losange de décision « EOS ? » branche
 * vers la fin (oui) ou la boucle (non). En mode image, une branche image
 * rejoint la branche texte avant le Transformer. La phase active est
 * mise en évidence.
 */
export function createSchematicPanel(): HTMLElement {
  const holder = h("div", {
    class: "flex min-h-0 w-full flex-1 justify-center",
  });

  const panel = h(
    "section",
    {
      class:
        "flex h-full min-h-0 flex-col items-center gap-2 overflow-hidden bg-[var(--color-bg)] px-4 py-3",
    },
    [
      h(
        "h2",
        {
          class:
            "text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]",
        },
        ["Plan global"],
      ),
      holder,
    ],
  );

  let built: BuiltSvg | null = null;
  let builtMode: Mode | null = null;

  // Mise en évidence de la phase active (le schéma est reconstruit au changement de mode).
  store.subscribe((state) => {
    if (!built || builtMode !== state.mode) {
      built = buildSvg(state.mode);
      builtMode = state.mode;
      holder.replaceChildren(built.svg);
    }
    const activeNode = stepsFor(state.mode)[state.stepIndex].schematicNode;
    for (const [id, { shape, base }] of built.nodes) {
      const active = id === activeNode;
      shape.setAttribute(
        "fill",
        active ? "var(--color-active-soft)" : base.fill,
      );
      shape.setAttribute(
        "stroke",
        active ? "var(--color-active)" : base.stroke,
      );
      shape.setAttribute("stroke-width", active ? "3" : "2");
    }
  });

  return panel;
}
