import type { PageViewport, RenderTask, TextLayer } from "pdfjs-dist";

export const PDF_SELECTION_RESET_EVENT = "pdf-selection-reset";
export const PDF_TO_CSS_UNITS = 96 / 72;

export interface PageLayerPlan {
  viewport: PageViewport;
  cssWidth: number;
  cssHeight: number;
  outputScale: number;
  canvasWidth: number;
  canvasHeight: number;
  canvasTransform?: [number, number, number, number, number, number];
}

export function createPageViewport(
  page: { getViewport(options: { scale: number; rotation: number }): PageViewport },
  scale: number,
  rotation: number
): PageViewport {
  return page.getViewport({
    scale: scale * PDF_TO_CSS_UNITS,
    rotation
  });
}

export function cancelPageLayers(
  renderTask: Pick<RenderTask, "cancel"> | undefined,
  textLayer: Pick<TextLayer, "cancel"> | undefined,
  textContainer: Pick<HTMLElement, "replaceChildren"> | undefined
): void {
  renderTask?.cancel();
  textLayer?.cancel();
  textContainer?.replaceChildren();
}

export function createPageLayerPlan(viewport: PageViewport, deviceScale: number): PageLayerPlan {
  const outputScale = Math.max(1, Math.min(deviceScale || 1, 2));
  return {
    viewport,
    cssWidth: viewport.width,
    cssHeight: viewport.height,
    outputScale,
    canvasWidth: Math.floor(viewport.width * outputScale),
    canvasHeight: Math.floor(viewport.height * outputScale),
    canvasTransform: outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0]
  };
}

export class RenderGeneration {
  #generation = 0;

  begin(): number {
    this.#generation += 1;
    return this.#generation;
  }

  invalidate(): void {
    this.#generation += 1;
  }

  isCurrent(generation: number): boolean {
    return generation === this.#generation;
  }
}

export function clearPdfSelection(): void {
  window.getSelection()?.removeAllRanges();
  window.dispatchEvent(new CustomEvent(PDF_SELECTION_RESET_EVENT));
}
