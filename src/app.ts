import { h } from "./dom";
import { createTimeline } from "./components/Timeline";
import { createControls } from "./components/Controls";
import { createStepPanel } from "./components/StepPanel";
import { createSchematicPanel } from "./components/SchematicPanel";

/**
 * Assemble le shell : entête (timeline + contrôles) / corps (2 colonnes) / pied.
 * Grille racine 100vh, aucun scroll global.
 */
export function createApp(): HTMLElement {
  // Entête : timeline + contrôles de lecture.
  const header = createTimeline();
  header.append(createControls());

  // Corps : deux colonnes (étape courante | plan global).
  const body = h(
    "main",
    {
      class: "grid min-h-0 grid-cols-2"
    },
    [createStepPanel(), createSchematicPanel()]
  );

  // Pied : mention + lien GitHub, toujours visible.
  const footer = h(
    "footer",
    {
      class:
        "flex items-center justify-center gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-2 text-sm text-[var(--color-muted)]"
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
          rel: "noopener noreferrer"
        },
        ["GitHub"]
      )
    ]
  );

  return h(
    "div",
    {
      class: "grid h-screen grid-rows-[auto_1fr_auto] overflow-hidden"
    },
    [header, body, footer]
  );
}
