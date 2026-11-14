import { h } from "../dom";
import { stepsFor } from "../scenario";
import { store, goToStep } from "../store";
import type { Mode } from "../types";

/**
 * Barre latérale gauche — Timeline « plan de ligne de métro » verticale.
 * Stations reliées par un trait, défilement vertical si la liste dépasse
 * la hauteur, étape active mise en évidence. Les stations changent avec le mode.
 */
export function createTimeline(): HTMLElement {
  let stationRefs: HTMLButtonElement[] = [];
  let builtMode: Mode | null = null;

  // Trait reliant les stations (derrière les pastilles), sur toute la hauteur défilable.
  const line = h("div", {
    class: "absolute top-7 bottom-7 left-[23px] w-0.5 bg-[var(--color-border)]",
  });

  const track = h("div", {
    class: "timeline-track relative flex flex-col px-4 py-3",
  });

  const aside = h(
    "aside",
    {
      class:
        "scroll-area border-r border-[var(--color-border)] bg-[var(--color-surface)]",
      "aria-label": "Étapes du parcours",
    },
    [track],
  );

  function buildStations(mode: Mode): void {
    stationRefs = stepsFor(mode).map((step, index) => {
      const dot = h("span", {
        class:
          "timeline-dot block h-4 w-4 shrink-0 rounded-full border-2 bg-white transition-all duration-300",
      });
      const label = h("span", { class: "text-sm text-[var(--color-muted)]" }, [
        step.imageOnly ? `🖼️ ${step.label}` : step.label,
      ]);
      return h(
        "button",
        {
          class:
            "timeline-station relative flex w-full items-center gap-3 py-2 text-left focus:outline-none",
          type: "button",
          "data-index": index,
          title: step.title,
          onclick: () => goToStep(index),
        },
        [dot, label],
      );
    });
    track.replaceChildren(line, ...stationRefs);
    aside.scrollTop = 0;
    builtMode = mode;
  }

  // Dégradés sur les bords signalant du contenu hors de la vue.
  function updateFades(): void {
    const maxScroll = aside.scrollHeight - aside.clientHeight;
    aside.classList.toggle("scroll-fade-t", aside.scrollTop > 2);
    aside.classList.toggle("scroll-fade-b", aside.scrollTop < maxScroll - 2);
  }
  aside.addEventListener("scroll", updateFades, { passive: true });
  window.addEventListener("resize", updateFades);

  // Mise en évidence de l'étape active + auto-scroll.
  store.subscribe((state) => {
    if (builtMode !== state.mode) buildStations(state.mode);
    const steps = stepsFor(state.mode);
    stationRefs.forEach((btn, index) => {
      const dot = btn.querySelector<HTMLElement>(".timeline-dot");
      const label = btn.querySelector<HTMLElement>("span:last-child");
      const active = index === state.stepIndex;
      const done = index < state.stepIndex;
      const accent = steps[index].imageOnly
        ? "var(--color-image)"
        : "var(--color-accent)";
      if (dot) {
        dot.style.background = active
          ? "var(--color-active)"
          : done
            ? accent
            : "#ffffff";
        dot.style.borderColor = active ? "var(--color-active)" : accent;
        dot.style.transform = active ? "scale(1.35)" : "scale(1)";
      }
      if (label) {
        label.style.color = active
          ? "var(--color-active)"
          : "var(--color-muted)";
        label.style.fontWeight = active ? "700" : "400";
      }
    });
    stationRefs[state.stepIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
    updateFades();
  });

  return aside;
}
