import { animate, stagger } from "motion";

/**
 * Moteur d'animation (Motion). Découplé du contenu : anime tous les
 * éléments porteurs de la classe `.anim-item` présents dans un conteneur.
 */
export function animateIn(container: HTMLElement): void {
  const items = Array.from(
    container.querySelectorAll<HTMLElement>(".anim-item")
  );
  if (items.length === 0) return;
  animate(
    items,
    { opacity: [0, 1], y: [12, 0] },
    { duration: 0.4, delay: stagger(0.07), ease: "easeOut" }
  );
}

/** Anime le titre de l'étape lors d'un changement. */
export function animateTitle(el: HTMLElement): void {
  animate(
    el,
    { opacity: [0, 1], x: [-8, 0] },
    { duration: 0.3, ease: "easeOut" }
  );
}
