export type ReaderView = "hidden" | "trigger" | "loading" | "success" | "error";

export function shouldKeepPopover(targetInsideHost: boolean): boolean {
  return targetInsideHost;
}

export function isCloseKey(key: string): boolean {
  return key === "Escape";
}

export function nextViewForSelection(hasValidSelection: boolean): ReaderView {
  return hasValidSelection ? "trigger" : "hidden";
}
