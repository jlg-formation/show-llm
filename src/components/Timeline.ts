import { h } from "../dom";
import { STEPS } from "../scenario";
import { store, goToStep } from "../store";

/**
 * Header — Timeline « plan de ligne de métro ».
 * Stations reliées par un trait, scrollable horizontalement,
 * étape active mise en évidence.
 */
export function createTimeline(): HTMLElement {
  const stationRefs: HTMLButtonElement[] = [];

  const stations = STEPS.map((step, index) => {
    const dot = h("span", {
      class:
        "timeline-dot block h-4 w-4 rounded-full border-2 border-[var(--color-accent)] bg-white transition-all duration-300"
    });
    const label = h(
      "span",
      { class: "mt-2 text-xs whitespace-nowrap text-[var(--color-muted)]" },
      [step.label]
    );
    const btn = h(
      "button",
      {
        class:
          "timeline-station relative flex shrink-0 flex-col items-center px-4 focus:outline-none",
        type: "button",
        "data-index": index,
        title: step.title,
        onclick: () => goToStep(index)
      },
      [dot, label]
    );
    stationRefs.push(btn);
    return btn;
  });

  // Trait reliant les stations (derrière les pastilles).
  const line = h("div", {
    class:
      "absolute top-[14px] left-8 right-8 h-0.5 bg-[var(--color-border)] z-0"
  });

  const track = h(
    "div",
    {
      class: "timeline-track relative z-10 flex items-start py-3"
    },
    stations
  );

  const scroller = h("div", { class: "scroll-area-x relative flex-1" }, [
    line,
    track
  ]);

  const brand = h("div", { class: "flex items-center gap-2 pr-6 shrink-0" }, [
    h("span", { class: "text-2xl" }, ["🧠"]),
    h(
      "span",
      {
        class: "text-lg font-bold tracking-tight text-[var(--color-ink)]"
      },
      ["Show LLM"]
    )
  ]);

  const header = h(
    "header",
    {
      class:
        "flex items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-2 shadow-sm"
    },
    [brand, scroller]
  );

  // Mise en évidence de l'étape active + auto-scroll.
  store.subscribe((state) => {
    stationRefs.forEach((btn, index) => {
      const dot = btn.querySelector<HTMLElement>(".timeline-dot");
      const label = btn.querySelector<HTMLElement>("span:last-child");
      const active = index === state.stepIndex;
      const done = index < state.stepIndex;
      if (dot) {
        dot.style.background = active
          ? "var(--color-active)"
          : done
            ? "var(--color-accent)"
            : "#ffffff";
        dot.style.borderColor = active
          ? "var(--color-active)"
          : "var(--color-accent)";
        dot.style.transform = active ? "scale(1.35)" : "scale(1)";
      }
      if (label) {
        label.style.color = active
          ? "var(--color-active)"
          : "var(--color-muted)";
        label.style.fontWeight = active ? "700" : "400";
      }
    });
    const activeBtn = stationRefs[state.stepIndex];
    activeBtn?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest"
    });
  });

  return header;
}
