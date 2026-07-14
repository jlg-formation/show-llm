/** Mini-helpers DOM (sans framework). */

type Attrs = Record<string, string | number | boolean | EventListener>;

/** Crée un élément HTML avec attributs, classes et enfants. */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  children: (Node | string)[] = []
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") {
      el.className = String(value);
    } else if (key.startsWith("on") && typeof value === "function") {
      el.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
    } else if (typeof value === "boolean") {
      if (value) el.setAttribute(key, "");
    } else {
      el.setAttribute(key, String(value));
    }
  }
  for (const child of children) {
    el.append(child instanceof Node ? child : document.createTextNode(child));
  }
  return el;
}

/** Crée un élément SVG namespacé. */
export function svgEl(
  tag: string,
  attrs: Record<string, string | number> = {},
  children: SVGElement[] = []
): SVGElement {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, String(value));
  }
  for (const child of children) el.append(child);
  return el;
}

/** Vide un élément de tous ses enfants. */
export function clear(el: Element): void {
  el.replaceChildren();
}
