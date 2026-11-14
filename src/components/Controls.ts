import { h, svgEl } from "../dom";
import { stepsFor } from "../scenario";
import { store, nextStep, prevStep } from "../store";

/** Chevron SVG (gauche ou droite), gros et centré dans le bouton. */
function chevron(direction: "left" | "right"): SVGElement {
  const d = direction === "left" ? "M15 5 L8 12 L15 19" : "M9 5 L16 12 L9 19";
  const svg = svgEl("svg", {
    viewBox: "0 0 24 24",
    width: 22,
    height: 22,
    fill: "none",
    stroke: "currentColor",
    "stroke-width": 2.5,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  });
  svg.append(svgEl("path", { d }));
  return svg;
}

/** Barre de contrôles : précédent / suivant + compteur d'étapes. */
export function createControls(): HTMLElement {
  const prevBtn = h(
    "button",
    {
      class: btnClass(),
      type: "button",
      title: "Étape précédente",
      onclick: () => prevStep(),
    },
    [chevron("left")],
  );

  const nextBtn = h(
    "button",
    {
      class: btnClass(),
      type: "button",
      title: "Étape suivante",
      onclick: () => nextStep(),
    },
    [chevron("right")],
  );

  const counter = h(
    "span",
    {
      class: "ml-2 w-12 text-xs tabular-nums text-[var(--color-muted)]",
    },
    [""],
  );

  const bar = h("div", { class: "flex shrink-0 items-center gap-2 pl-4" }, [
    prevBtn,
    nextBtn,
    counter,
  ]);

  store.subscribe((state) => {
    const total = stepsFor(state.mode).length;
    const atStart = state.stepIndex === 0;
    const atEnd = state.stepIndex === total - 1;
    prevBtn.toggleAttribute("disabled", atStart);
    nextBtn.toggleAttribute("disabled", atEnd);
    prevBtn.style.opacity = atStart ? "0.4" : "1";
    nextBtn.style.opacity = atEnd ? "0.4" : "1";
    counter.textContent = `${state.stepIndex + 1} / ${total}`;
  });

  return bar;
}

function btnClass(): string {
  return "flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent-soft)] focus:outline-none";
}
