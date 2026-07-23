import { element } from "./dom";

export interface AccordionItem {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  indexLabel?: string;
}

export interface AccordionMount {
  root: HTMLElement;
  getExpandedIndex(): number | undefined;
}

export function createAccordion(
  documentRef: Document,
  items: AccordionItem[],
  renderPanel: (item: AccordionItem, index: number) => HTMLElement,
  defaultExpandedIndex?: number
): AccordionMount {
  const root = element(documentRef, "div", "sr-accordion");
  let expanded = defaultExpandedIndex !== undefined && items[defaultExpandedIndex] ? defaultExpandedIndex : undefined;
  const buttons: HTMLButtonElement[] = [];
  const panels: HTMLElement[] = [];

  const setExpanded = (next: number | undefined) => {
    expanded = next;
    buttons.forEach((button, index) => {
      const isExpanded = index === expanded;
      button.setAttribute("aria-expanded", String(isExpanded));
      panels[index]?.toggleAttribute("hidden", !isExpanded);
    });
  };

  items.forEach((item, index) => {
    const row = element(documentRef, "section", "sr-accordion-item");
    const button = element(documentRef, "button", "sr-accordion-trigger");
    button.type = "button";
    button.setAttribute("aria-controls", `${item.id}-panel`);
    if (item.indexLabel) button.append(element(documentRef, "span", "sr-accordion-index", item.indexLabel));
    const heading = element(documentRef, "span", "sr-accordion-heading");
    heading.append(element(documentRef, "span", "sr-accordion-title", item.title));
    if (item.subtitle) heading.append(element(documentRef, "span", "sr-accordion-subtitle", item.subtitle));
    button.append(heading);
    if (item.meta) button.append(element(documentRef, "span", "sr-accordion-meta", item.meta));
    button.append(element(documentRef, "span", "sr-accordion-arrow", "⌄"));
    const panel = renderPanel(item, index);
    panel.id = `${item.id}-panel`;
    panel.classList.add("sr-accordion-panel");
    const toggle = () => setExpanded(expanded === index ? undefined : index);
    button.addEventListener("click", toggle);
    button.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggle();
    });
    buttons.push(button);
    panels.push(panel);
    row.append(button, panel);
    root.append(row);
  });
  setExpanded(expanded);
  return { root, getExpandedIndex: () => expanded };
}
