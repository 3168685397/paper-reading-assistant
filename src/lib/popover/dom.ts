export interface ReaderMount {
  host: HTMLDivElement;
  shadow: ShadowRoot;
  trigger: HTMLButtonElement;
  popover: HTMLElement;
}

export function mountScienceReaderRoot(documentRef: Document, css: string): ReaderMount {
  const host = documentRef.createElement("div");
  host.id = "science-reader-root";
  host.style.cssText = "all:initial;position:fixed;inset:0 auto auto 0;width:0;height:0;z-index:2147483647;pointer-events:none;";
  const shadow = host.attachShadow({ mode: "open" });
  const style = documentRef.createElement("style");
  style.textContent = css;
  const trigger = documentRef.createElement("button");
  trigger.className = "sr-trigger";
  trigger.type = "button";
  trigger.textContent = "译";
  trigger.setAttribute("aria-label", "翻译并精读选中文本");
  trigger.hidden = true;
  const popover = documentRef.createElement("section");
  popover.className = "sr-popover";
  popover.setAttribute("role", "dialog");
  popover.setAttribute("aria-label", "Science Reader 翻译");
  popover.hidden = true;
  shadow.append(style, trigger, popover);
  documentRef.documentElement.append(host);
  return { host, shadow, trigger, popover };
}

export function element<K extends keyof HTMLElementTagNameMap>(
  documentRef: Document,
  tag: K,
  className?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const node = documentRef.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
