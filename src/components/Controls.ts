import { h } from "../dom";
import { STEPS } from "../scenario";
import { store, nextStep, prevStep, togglePlay } from "../store";

/** Barre de contrôles de lecture : précédent / play-pause / suivant. */
export function createControls(): HTMLElement {
  const prevBtn = h(
    "button",
    {
      class: btnClass(),
      type: "button",
      title: "Étape précédente",
      onclick: () => prevStep()
    },
    ["◀"]
  );

  const playBtn = h(
    "button",
    {
      class: btnClass() + " w-12 text-base",
      type: "button",
      title: "Lecture / Pause",
      onclick: () => togglePlay()
    },
    ["▶"]
  );

  const nextBtn = h(
    "button",
    {
      class: btnClass(),
      type: "button",
      title: "Étape suivante",
      onclick: () => nextStep()
    },
    ["▶"]
  );

  const counter = h(
    "span",
    { class: "ml-2 text-xs tabular-nums text-[var(--color-muted)]" },
    [""]
  );

  const bar = h("div", { class: "flex shrink-0 items-center gap-2 pl-4" }, [
    prevBtn,
    playBtn,
    nextBtn,
    counter
  ]);

  store.subscribe((state) => {
    playBtn.textContent = state.playing ? "⏸" : "▶";
    prevBtn.toggleAttribute("disabled", state.stepIndex === 0);
    nextBtn.toggleAttribute("disabled", state.stepIndex === STEPS.length - 1);
    prevBtn.style.opacity = state.stepIndex === 0 ? "0.4" : "1";
    nextBtn.style.opacity = state.stepIndex === STEPS.length - 1 ? "0.4" : "1";
    counter.textContent = `${state.stepIndex + 1} / ${STEPS.length}`;
  });

  return bar;
}

function btnClass(): string {
  return "flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent-soft)] focus:outline-none";
}
