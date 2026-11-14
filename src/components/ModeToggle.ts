import { h } from "../dom";
import { setMode, store } from "../store";
import type { Mode } from "../types";

const OPTIONS: { mode: Mode; label: string; title: string }[] = [
  { mode: "text", label: "Texte", title: "Le LLM reçoit du texte seul" },
  {
    mode: "image",
    label: "🖼️ Texte + image",
    title: "Le LLM reçoit une image accompagnée de texte",
  },
];

function optionClass(active: boolean): string {
  return `rounded-md px-3 py-1 whitespace-nowrap transition-colors focus:outline-none ${
    active
      ? "bg-white font-semibold text-[var(--color-ink)] shadow-sm"
      : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
  }`;
}

/** Bascule de mode d'entrée : texte seul / texte + image. */
export function createModeToggle(): HTMLElement {
  const buttons = OPTIONS.map((o) =>
    h(
      "button",
      {
        class: optionClass(false),
        type: "button",
        title: o.title,
        onclick: () => setMode(o.mode),
      },
      [o.label],
    ),
  );

  const group = h(
    "div",
    {
      class:
        "flex shrink-0 items-center rounded-lg border border-[var(--color-border)] bg-slate-100 p-0.5 text-sm",
      role: "group",
      "aria-label": "Mode d'entrée du LLM",
    },
    buttons,
  );

  store.subscribe((state) => {
    buttons.forEach((btn, i) => {
      const active = OPTIONS[i].mode === state.mode;
      btn.className = optionClass(active);
      btn.setAttribute("aria-pressed", String(active));
    });
  });

  return group;
}
