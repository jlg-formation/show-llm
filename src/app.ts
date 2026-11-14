import { h } from "./dom";
import { createTimeline } from "./components/Timeline";
import { createControls } from "./components/Controls";
import { createModeToggle } from "./components/ModeToggle";
import { createStepPanel } from "./components/StepPanel";
import { createSchematicPanel } from "./components/SchematicPanel";

/**
 * Assemble le shell : entête (site-id + bascule de mode + contrôles) /
 * corps (barre d'étapes | étape courante | plan global) / pied.
 * Grille racine 100vh, aucun scroll global.
 */
export function createApp(): HTMLElement {
  // Entête : site-id, bascule de mode et contrôles de navigation.
  const header = h(
    "header",
    {
      class:
        "flex items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-2 shadow-sm",
    },
    [
      h("div", { class: "flex shrink-0 items-center gap-2" }, [
        h("span", { class: "text-2xl" }, ["🧠"]),
        h(
          "span",
          { class: "text-lg font-bold tracking-tight text-[var(--color-ink)]" },
          ["Show LLM"],
        ),
      ]),
      h("div", { class: "flex-1" }),
      createModeToggle(),
      createControls(),
    ],
  );

  // Corps : trois colonnes (barre d'étapes | étape courante | plan global).
  const body = h(
    "main",
    {
      class: "grid min-h-0 grid-cols-[13rem_1fr_1fr]",
    },
    [createTimeline(), createStepPanel(), createSchematicPanel()],
  );

  // Pied : mention + lien GitHub, toujours visible.
  const footer = h(
    "footer",
    {
      class:
        "flex items-center justify-center gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-2 text-sm text-[var(--color-muted)]",
    },
    [
      h("span", {}, ["@JLG Consulting 2026"]),
      h("span", {}, ["—"]),
      h(
        "a",
        {
          class: "text-[var(--color-accent)] hover:underline",
          href: "https://github.com/jlg-formation/show-llm",
          target: "_blank",
          rel: "noopener noreferrer",
        },
        ["GitHub"],
      ),
    ],
  );

  return h(
    "div",
    {
      class: "grid h-screen grid-rows-[auto_1fr_auto] overflow-hidden",
    },
    [header, body, footer],
  );
}
