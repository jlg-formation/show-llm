import { svgEl } from "../dom";
import { IMAGE_DEMO } from "../data";

const FUR = "#e8a04c";
const EYE = "#3b2a20";

/** Dessin de la scène (chat endormi sur un canapé) en coordonnées 224 × 224. */
function sceneNodes(): SVGElement[] {
  return [
    svgEl("rect", { x: 0, y: 0, width: 224, height: 224, fill: "#fdebd3" }),
    svgEl("rect", { x: 0, y: 184, width: 224, height: 40, fill: "#c9a27a" }),
    // Canapé : dossier, accoudoirs, assise.
    svgEl("rect", {
      x: 20,
      y: 84,
      width: 184,
      height: 80,
      rx: 14,
      fill: "#4f86c6",
    }),
    svgEl("rect", {
      x: 6,
      y: 108,
      width: 34,
      height: 78,
      rx: 14,
      fill: "#3f73b0",
    }),
    svgEl("rect", {
      x: 184,
      y: 108,
      width: 34,
      height: 78,
      rx: 14,
      fill: "#3f73b0",
    }),
    svgEl("rect", {
      x: 22,
      y: 140,
      width: 180,
      height: 44,
      rx: 10,
      fill: "#5a93d2",
    }),
    // Chat : queue, corps, rayures, oreilles, tête, yeux fermés, museau.
    svgEl("path", {
      d: "M 64 142 Q 36 146 42 120",
      fill: "none",
      stroke: FUR,
      "stroke-width": 10,
      "stroke-linecap": "round",
    }),
    svgEl("ellipse", { cx: 112, cy: 134, rx: 52, ry: 24, fill: FUR }),
    svgEl("path", {
      d: "M 92 112 L 96 126 M 112 110 L 116 124 M 132 112 L 134 126",
      fill: "none",
      stroke: "#c97f2e",
      "stroke-width": 4,
      "stroke-linecap": "round",
    }),
    svgEl("polygon", { points: "136,114 140,94 154,108", fill: FUR }),
    svgEl("polygon", { points: "148,108 162,94 166,114", fill: FUR }),
    svgEl("circle", { cx: 150, cy: 128, r: 20, fill: FUR }),
    svgEl("path", {
      d: "M 141 127 Q 145 132 149 127 M 154 127 Q 158 132 162 127",
      fill: "none",
      stroke: EYE,
      "stroke-width": 2.5,
      "stroke-linecap": "round",
    }),
    svgEl("polygon", { points: "152,134 156,134 154,137", fill: "#e48a8a" }),
  ];
}

interface CatImageOptions {
  /** Superpose la grille de patches. */
  grid?: boolean;
  /** Patch encadré (ligne, colonne). */
  highlight?: { row: number; col: number };
}

/** Image complète, avec grille de patches et patch mis en évidence en option. */
export function createCatImage(options: CatImageOptions = {}): SVGElement {
  const { size, patchSize, grid } = IMAGE_DEMO;
  const svg = svgEl("svg", {
    viewBox: `0 0 ${size} ${size}`,
    class: "block h-auto w-full",
    role: "img",
    "aria-label": "Un chat endormi sur un canapé",
  });
  svg.append(...sceneNodes());

  if (options.grid) {
    for (let i = 1; i < grid; i++) {
      const p = i * patchSize;
      for (const [x1, y1, x2, y2] of [
        [p, 0, p, size],
        [0, p, size, p],
      ]) {
        svg.append(
          svgEl("line", {
            x1,
            y1,
            x2,
            y2,
            stroke: "#ffffff",
            "stroke-opacity": 0.75,
            "stroke-width": 0.6,
          }),
        );
      }
    }
  }

  if (options.highlight) {
    svg.append(
      svgEl("rect", {
        x: options.highlight.col * patchSize,
        y: options.highlight.row * patchSize,
        width: patchSize,
        height: patchSize,
        fill: "none",
        stroke: "var(--color-active)",
        "stroke-width": 2,
      }),
    );
  }
  return svg;
}

/** Zoom sur un patch ; `pixelGrid` dessine la grille des pixels. */
export function createPatchView(
  row: number,
  col: number,
  pixelGrid = false,
): SVGElement {
  const { patchSize } = IMAGE_DEMO;
  const x0 = col * patchSize;
  const y0 = row * patchSize;
  const svg = svgEl("svg", {
    viewBox: `${x0} ${y0} ${patchSize} ${patchSize}`,
    class: "block h-full w-full",
    role: "img",
    "aria-label": `Patch ligne ${row + 1}, colonne ${col + 1}`,
  });
  svg.append(...sceneNodes());

  if (pixelGrid) {
    for (let i = 1; i < patchSize; i++) {
      for (const [x1, y1, x2, y2] of [
        [x0 + i, y0, x0 + i, y0 + patchSize],
        [x0, y0 + i, x0 + patchSize, y0 + i],
      ]) {
        svg.append(
          svgEl("line", {
            x1,
            y1,
            x2,
            y2,
            stroke: "#ffffff",
            "stroke-opacity": 0.5,
            "stroke-width": 0.05,
          }),
        );
      }
    }
  }
  return svg;
}
