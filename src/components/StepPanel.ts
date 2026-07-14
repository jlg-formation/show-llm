import { h, clear } from "../dom";
import { STEPS } from "../scenario";
import { store } from "../store";
import { renderStepContent } from "./stepRenderers";
import { animateIn, animateTitle } from "../animation";

/**
 * Panneau gauche — détail de l'étape courante.
 * Le contenu change au fil des étapes ; zone scrollable verticalement.
 */
export function createStepPanel(): HTMLElement {
  const title = h("h2", {
    class: "text-xl font-bold text-[var(--color-ink)]"
  });
  const idea = h("p", {
    class: "mt-1 text-sm text-[var(--color-muted)]"
  });
  const headerBlock = h("div", { class: "mb-5" }, [title, idea]);

  const content = h("div", { class: "flex-1" });

  const panel = h(
    "section",
    {
      class:
        "scroll-area flex h-full flex-col border-r border-[var(--color-border)] bg-[var(--color-bg)] px-8 py-6"
    },
    [headerBlock, content]
  );

  let lastIndex = -1;
  store.subscribe((state) => {
    if (state.stepIndex === lastIndex) return;
    lastIndex = state.stepIndex;
    const step = STEPS[state.stepIndex];

    title.textContent = step.title;
    idea.textContent = step.idea;
    animateTitle(headerBlock);

    clear(content);
    content.append(renderStepContent(step.id, state));
    animateIn(content);
    panel.scrollTo({ top: 0, behavior: "smooth" });
  });

  return panel;
}
