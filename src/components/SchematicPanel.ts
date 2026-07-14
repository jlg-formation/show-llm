import { h, svgEl } from "../dom";
import { STEPS } from "../scenario";
import { store } from "../store";
import type { SchematicNodeId } from "../types";

interface NodeDef {
  id: SchematicNodeId;
  label: string;
  sublabel?: string;
  y: number;
}

const NODE_X = 60;
const NODE_W = 260;
const NODE_H = 52;

const NODES: NodeDef[] = [
  { id: "prompt", label: "Prompt", y: 24 },
  { id: "tokenizer", label: "Tokenisation", y: 104 },
  { id: "embeddings", label: "Embeddings", y: 184 },
  {
    id: "transformer",
    label: "Transformer",
    sublabel: "boîte noire · N couches",
    y: 288
  },
  { id: "logits", label: "Logits", sublabel: "scores bruts", y: 392 },
  {
    id: "engine",
    label: "Moteur d'inférence",
    sublabel: "température · top-k/p · softmax · choix",
    y: 496
  },
  {
    id: "probabilities",
    label: "Probabilités",
    y: 600
  },
  { id: "output", label: "Nouveau prompt", y: 680 }
];

/**
 * Panneau droit — plan global du moteur, du LLM et des phases.
 * SVG : boîtes + flèches. La phase active est mise en évidence par un halo.
 */
export function createSchematicPanel(): HTMLElement {
  const svg = svgEl("svg", {
    viewBox: "0 0 380 752",
    class: "w-full max-w-md",
    "aria-label": "Plan global du pipeline d'inférence"
  });

  // Définition de la flèche.
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

  // Flèches entre boîtes consécutives.
  for (let i = 0; i < NODES.length - 1; i++) {
    const from = NODES[i];
    const to = NODES[i + 1];
    const x = NODE_X + NODE_W / 2;
    svg.append(
      svgEl("line", {
        x1: x,
        y1: from.y + NODE_H,
        x2: x,
        y2: to.y,
        stroke: "#94a3b8",
        "stroke-width": 2,
        "marker-end": "url(#arrow)"
      })
    );
  }

  // Regroupements visuels : Modèle vs Moteur d'inférence.
  svg.append(
    sectionBracket(276, 456, "MODÈLE"),
    sectionBracket(484, 560, "MOTEUR")
  );

  // Boîtes.
  const nodeGroups = new Map<SchematicNodeId, SVGElement>();
  for (const node of NODES) {
    const group = svgEl("g", { "data-node": node.id });
    const rect = svgEl("rect", {
      x: NODE_X,
      y: node.y,
      width: NODE_W,
      height: NODE_H,
      rx: 10,
      fill: "#ffffff",
      stroke: "#cbd5e1",
      "stroke-width": 2,
      class: "schematic-rect"
    });
    const label = svgEl("text", {
      x: NODE_X + NODE_W / 2,
      y: node.sublabel ? node.y + 22 : node.y + NODE_H / 2 + 5,
      "text-anchor": "middle",
      "font-size": 15,
      "font-weight": 600,
      fill: "#1e293b"
    });
    label.textContent = node.label;
    group.append(rect, label);
    if (node.sublabel) {
      const sub = svgEl("text", {
        x: NODE_X + NODE_W / 2,
        y: node.y + 38,
        "text-anchor": "middle",
        "font-size": 10,
        fill: "#64748b"
      });
      sub.textContent = node.sublabel;
      group.append(sub);
    }
    svg.append(group);
    nodeGroups.set(node.id, group);
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
    for (const [id, group] of nodeGroups) {
      const rect = group.querySelector<SVGRectElement>(".schematic-rect");
      const active = id === activeNode;
      if (rect) {
        rect.setAttribute(
          "fill",
          active ? "var(--color-active-soft)" : "#ffffff"
        );
        rect.setAttribute("stroke", active ? "var(--color-active)" : "#cbd5e1");
        rect.setAttribute("stroke-width", active ? "3" : "2");
      }
    }
  });

  return panel;
}

/** Accolade/étiquette de section à gauche des boîtes. */
function sectionBracket(y1: number, y2: number, text: string): SVGElement {
  const g = svgEl("g");
  g.append(
    svgEl("line", {
      x1: 30,
      y1,
      x2: 30,
      y2,
      stroke: "#cbd5e1",
      "stroke-width": 2
    })
  );
  const label = svgEl("text", {
    x: 22,
    y: (y1 + y2) / 2,
    "text-anchor": "middle",
    "font-size": 9,
    "font-weight": 700,
    fill: "#94a3b8",
    transform: `rotate(-90 22 ${(y1 + y2) / 2})`
  });
  label.textContent = text;
  g.append(label);
  return g;
}
