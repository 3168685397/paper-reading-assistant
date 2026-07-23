import { describe, expect, it, vi } from "vitest";
import type { PageViewport } from "pdfjs-dist";
import {
  cancelPageLayers,
  createPageLayerPlan,
  createPageViewport,
  PDF_TO_CSS_UNITS,
  RenderGeneration
} from "../src/features/pdf/pdfPageRendering";

function viewport(scale: number, rotation = 0): PageViewport {
  const portrait = rotation % 180 === 0;
  return {
    width: (portrait ? 612 : 792) * scale,
    height: (portrait ? 792 : 612) * scale,
    scale,
    rotation,
    userUnit: 1
  } as PageViewport;
}

describe("PDF page layer coordinates", () => {
  it("passes the exact same viewport object to Canvas and Text Layer", () => {
    const sharedViewport = viewport(2);
    const plan = createPageLayerPlan(sharedViewport, 2);
    expect(plan.viewport).toBe(sharedViewport);
    expect(plan.cssWidth).toBe(sharedViewport.width);
    expect(plan.cssHeight).toBe(sharedViewport.height);
  });

  it.each([1, 1.5, 2])("keeps CSS coordinates at %sx zoom while outputScale only enlarges the Canvas buffer", (scale) => {
    const getViewport = vi.fn(({ scale: viewportScale, rotation }: { scale: number; rotation: number }) =>
      viewport(viewportScale, rotation)
    );
    const sharedViewport = createPageViewport({ getViewport }, scale, 0);
    const plan = createPageLayerPlan(sharedViewport, 2);
    expect(getViewport).toHaveBeenCalledWith({ scale: scale * PDF_TO_CSS_UNITS, rotation: 0 });
    expect(plan.canvasWidth).toBe(Math.floor(plan.cssWidth * 2));
    expect(plan.canvasHeight).toBe(Math.floor(plan.cssHeight * 2));
    expect(plan.canvasTransform).toEqual([2, 0, 0, 2, 0, 0]);
    expect(plan.cssWidth).toBeCloseTo(816 * scale);
    expect(plan.cssHeight).toBeCloseTo(1056 * scale);
  });

  it("uses rotated viewport dimensions without another CSS transform", () => {
    const getViewport = ({ scale, rotation }: { scale: number; rotation: number }) => viewport(scale, rotation);
    const normal = createPageViewport({ getViewport }, 1, 0);
    const rotated = createPageViewport({ getViewport }, 1, 90);
    expect(rotated.width).toBeCloseTo(normal.height);
    expect(rotated.height).toBeCloseTo(normal.width);
  });

  it("prevents stale async renders from writing after a newer zoom generation", () => {
    const renders = new RenderGeneration();
    const first = renders.begin();
    const second = renders.begin();
    expect(renders.isCurrent(first)).toBe(false);
    expect(renders.isCurrent(second)).toBe(true);
    renders.invalidate();
    expect(renders.isCurrent(second)).toBe(false);
  });

  it("cancels old Canvas and Text Layer tasks before clearing their DOM", () => {
    const renderTask = { cancel: vi.fn() };
    const textLayer = { cancel: vi.fn() };
    const textContainer = { replaceChildren: vi.fn() };
    cancelPageLayers(renderTask, textLayer, textContainer);
    expect(renderTask.cancel).toHaveBeenCalledOnce();
    expect(textLayer.cancel).toHaveBeenCalledOnce();
    expect(textContainer.replaceChildren).toHaveBeenCalledOnce();
  });
});
