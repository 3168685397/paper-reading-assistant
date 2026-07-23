export function cleanPdfSelection(text: string): string {
  return text
    .replace(/\u00ad/g, "")
    .replace(/([A-Za-z])-\s*\n\s*([a-z])/g, "$1$2")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, " ")
    .trim();
}

function pageElement(node: Node | null): Element | null {
  const element = node instanceof Element ? node : node?.parentElement;
  return element?.closest("[data-pdf-page-number]") ?? null;
}

export function isSinglePdfPageRange(range: Range): boolean {
  const start = pageElement(range.startContainer);
  const end = pageElement(range.endContainer);
  return start !== null && start === end;
}

export function isPdfTextLayerRange(range: Range): boolean {
  const start = range.startContainer instanceof Element ? range.startContainer : range.startContainer.parentElement;
  return start?.closest(".textLayer") !== null;
}

export function isReadyPdfTextLayerRange(range: Range): boolean {
  const start = pageElement(range.startContainer);
  const end = pageElement(range.endContainer);
  return start !== null
    && start === end
    && start.getAttribute("data-text-layer-ready") === "true";
}
