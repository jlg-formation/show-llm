import { h, svgEl } from "../dom";
import { STEPS } from "../scenario";
import { store } from "../store";
import type { SchematicNodeId } from "../types";

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
}

interface ContainerDef {
  label: string;
  variant: "engine" | "model";
  x: number;
  y: number;
  w: number;
  h: number;
}

const CENTER_X = 190;
const IO_SKEW = 16;

// Conteneurs (arrière-plan) : le MOTEUR englobe le LLM.
const CONTAINERS: ContainerDef[] = [
  {
    label: "Moteur d'inférence",
    variant: "engine",
    x: 18,
    y: 88,
    w: 344,
    h: 506
  },
  { label: "LLM · modèle", variant: "model", x: 42, y: 190, w: 296, h: 242 }
];

// Chaîne de calcul (flèches automatiques entre boîtes consécutives).
// Entrées/sorties = parallélogrammes ; traitements = rectangles.
const PIPELINE: BoxDef[] = [
  { id: "prompt", label: "Prompt", shape: "io", x: 80, y: 18, w: 220, h: 46 },
  {
    id: "tokenizer",
    label: "Tokenisation",
    shape: "process",
    x: 48,
    y: 122,
    w: 284,
    h: 46
  },
  {
    id: "embeddings",
    label: "Embeddings",
    shape: "process",
    x: 64,
    y: 222,
    w: 252,
    h: 46
  },
  {
    id: "transformer",
    label: "Transformer",
    sublabel: "boîte noire · N couches",
    shape: "process",
    x: 64,
    y: 288,
    w: 252,
    h: 54
  },
  {
    id: "logits",
    label: "Logits",
    sublabel: "scores bruts",
    shape: "process",
    x: 64,
    y: 362,
    w: 252,
    h: 54
  },
  {
    id: "engine",
    label: "Décodage",
    sublabel: "top-k · softmax/T · top-p · choix",
    shape: "process",
    x: 48,
    y: 454,
    w: 284,
    h: 54
  },
  {
    id: "probabilities",
    label: "Token",
    shape: "io",
    x: 80,
    y: 528,
    w: 220,
    h: 46
  }
];

// Boîtes de contrôle de flux (branchement de la boucle d'inférence).
const CONTROL: BoxDef[] = [
  {
    id: "output",
    label: "Nouveau prompt",
    shape: "io",
    x: 80,
    y: 696,
    w: 220,
    h: 46
  },
  { id: "end", label: "Fin", shape: "terminal", x: 16, y: 610, w: 96, h: 44 }
];

// Losange de décision : le token produit est-il un token de fin (EOS) ?
const DECISION = { cx: CENTER_X, cy: 632, hw: 50, hh: 30, label: "EOS ?" };

const ALL_BOXES = [...PIPELINE, ...CONTROL];

/** Points d'un parallélogramme (forme des entrées / sorties). */
function parallelogramPoints(b: BoxDef): string {
  return [
    `${b.x + IO_SKEW},${b.y}`,
    `${b.x + b.w},${b.y}`,
    `${b.x + b.w - IO_SKEW},${b.y + b.h}`,
    `${b.x},${b.y + b.h}`
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
    fill: "#64748b"
  });
  t.textContent = text;
  return t;
}

/**
 * Panneau droit — plan global. Le moteur d'inférence englobe le LLM ;
 * les entrées / sorties (parallélogrammes) se distinguent des
 * traitements (rectangles). Un losange de décision « EOS ? » branche
 * vers la fin (oui) ou la boucle (non). La phase active est mise en évidence.
 */
export function createSchematicPanel(): HTMLElement {
  const svg = svgEl("svg", {
    viewBox: "0 0 400 760",
    class: "w-full max-w-md",
    "aria-label": "Plan global du pipeline d'inférence"
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
    orient: "auto-start-reverse"
  });
  marker.append(svgEl("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: "#94a3b8" }));
  defs.append(marker);
  svg.append(defs);

  // --- Conteneurs (arrière-plan) : le moteur englobe le LLM imbriqué. ---
  for (const c of CONTAINERS) {
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
      "stroke-dasharray": isEngine ? "6 4" : "4 3"
    });
    const label = svgEl("text", {
      x: c.x + 12,
      y: c.y + 17,
      "font-size": 10,
      "font-weight": 700,
      "letter-spacing": "0.06em",
      fill: isEngine ? "var(--color-accent)" : "#475569"
    });
    label.textContent = c.label.toUpperCase();
    svg.append(rect, label);
  }

  // --- Flèches de la chaîne de calcul (axe central). ---
  for (let i = 0; i < PIPELINE.length - 1; i++) {
    const from = PIPELINE[i];
    const to = PIPELINE[i + 1];
    svg.append(
      svgEl("line", {
        x1: CENTER_X,
        y1: from.y + from.h,
        x2: CENTER_X,
        y2: to.y,
        stroke: "#94a3b8",
        "stroke-width": 2,
        "marker-end": "url(#arrow)"
      })
    );
  }

  // --- Losange de décision « EOS ? ». ---
  const token = PIPELINE[PIPELINE.length - 1];
  const output = CONTROL[0];
  const end = CONTROL[1];
  const { cx, cy, hw, hh } = DECISION;

  // Token → décision.
  svg.append(
    svgEl("line", {
      x1: CENTER_X,
      y1: token.y + token.h,
      x2: CENTER_X,
      y2: cy - hh,
      stroke: "#94a3b8",
      "stroke-width": 2,
      "marker-end": "url(#arrow)"
    })
  );

  // Décision --oui--> Fin (vers la gauche).
  svg.append(
    svgEl("line", {
      x1: cx - hw,
      y1: cy,
      x2: end.x + end.w,
      y2: cy,
      stroke: "#94a3b8",
      "stroke-width": 2,
      "marker-end": "url(#arrow)"
    }),
    branchLabel((cx - hw + end.x + end.w) / 2, cy - 6, "oui")
  );

  // Décision --non--> Nouveau prompt (vers le bas).
  svg.append(
    svgEl("line", {
      x1: CENTER_X,
      y1: cy + hh,
      x2: CENTER_X,
      y2: output.y,
      stroke: "#94a3b8",
      "stroke-width": 2,
      "marker-end": "url(#arrow)"
    }),
    branchLabel(cx + 14, cy + hh + 16, "non")
  );

  const diamond = svgEl("polygon", {
    points: `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`,
    fill: "#ffffff",
    stroke: "#475569",
    "stroke-width": 2
  });
  const diamondLabel = svgEl("text", {
    x: cx,
    y: cy + 5,
    "text-anchor": "middle",
    "font-size": 14,
    "font-weight": 700,
    fill: "#1e293b"
  });
  diamondLabel.textContent = DECISION.label;
  svg.append(diamond, diamondLabel);

  // --- Flèche de bouclage (Nouveau prompt → Prompt) sur le côté droit. ---
  const prompt = PIPELINE[0];
  const yTop = prompt.y + prompt.h / 2;
  const yBottom = output.y + output.h / 2;
  const loopMidY = (yTop + yBottom) / 2;
  const loop = svgEl("path", {
    d: `M ${output.x + output.w - IO_SKEW / 2} ${yBottom} C 392 ${yBottom}, 392 ${yTop}, ${prompt.x + prompt.w - IO_SKEW / 2} ${yTop}`,
    fill: "none",
    stroke: "#cbd5e1",
    "stroke-width": 2,
    "stroke-dasharray": "5 4",
    "marker-end": "url(#arrow)"
  });
  const loopLabel = svgEl("text", {
    x: 388,
    y: loopMidY,
    "text-anchor": "middle",
    "font-size": 9,
    "font-weight": 700,
    fill: "#94a3b8",
    transform: `rotate(-90 388 ${loopMidY})`
  });
  loopLabel.textContent = "BOUCLE";
  svg.append(loop, loopLabel);

  // --- Boîtes. ---
  const nodeShapes = new Map<SchematicNodeId, SVGElement>();
  const shapeById = new Map<SchematicNodeId, Shape>();
  for (const b of ALL_BOXES) {
    shapeById.set(b.id, b.shape);
    const group = svgEl("g", { "data-node": b.id });
    let shape: SVGElement;
    if (b.shape === "io") {
      shape = svgEl("polygon", {
        points: parallelogramPoints(b),
        fill: "#e2e8f0",
        stroke: "#475569",
        "stroke-width": 2,
        class: "schematic-shape"
      });
    } else {
      shape = svgEl("rect", {
        x: b.x,
        y: b.y,
        width: b.w,
        height: b.h,
        rx: b.shape === "terminal" ? b.h / 2 : 8,
        fill: b.shape === "terminal" ? "#e2e8f0" : "#ffffff",
        stroke: b.shape === "terminal" ? "#475569" : "#cbd5e1",
        "stroke-width": 2,
        class: "schematic-shape"
      });
    }
    const centerX = b.x + b.w / 2;
    const label = svgEl("text", {
      x: centerX,
      y: b.sublabel ? b.y + 22 : b.y + b.h / 2 + 5,
      "text-anchor": "middle",
      "font-size": 15,
      "font-weight": 600,
      fill: "#1e293b"
    });
    label.textContent = b.label;
    group.append(shape, label);
    if (b.sublabel) {
      const sub = svgEl("text", {
        x: centerX,
        y: b.y + 39,
        "text-anchor": "middle",
        "font-size": 10,
        fill: "#64748b"
      });
      sub.textContent = b.sublabel;
      group.append(sub);
    }
    svg.append(group);
    nodeShapes.set(b.id, shape);
  }

  const panel = h(
    "section",
    {
      class:
        "scroll-area flex h-full flex-col items-center gap-4 bg-[var(--color-bg)] px-4 py-6"
    },
    [
      h(
        "h2",
        {
          class:
            "text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]"
        },
        ["Plan global"]
      ),
      svg as unknown as HTMLElement
    ]
  );

  // Mise en évidence de la phase active.
  store.subscribe((state) => {
    const activeNode = STEPS[state.stepIndex].schematicNode;
    for (const [id, shape] of nodeShapes) {
      const active = id === activeNode;
      const filled = shapeById.get(id) !== "process";
      shape.setAttribute(
        "fill",
        active ? "var(--color-active-soft)" : filled ? "#e2e8f0" : "#ffffff"
      );
      shape.setAttribute(
        "stroke",
        active ? "var(--color-active)" : filled ? "#475569" : "#cbd5e1"
      );
      shape.setAttribute("stroke-width", active ? "3" : "2");
    }
  });

  return panel;
}
