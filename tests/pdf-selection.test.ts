// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { cleanPdfSelection, isPdfTextLayerRange, isReadyPdfTextLayerRange, isSinglePdfPageRange } from "../src/features/pdf/PdfTextSelection";
import { clearPdfSelection, PDF_SELECTION_RESET_EVENT } from "../src/features/pdf/pdfPageRendering";

function rangeAcross(start: Node, end: Node): Range {
  const range = document.createRange();
  range.setStart(start, 0);
  range.setEnd(end, end.textContent?.length ?? 0);
  return range;
}

describe("PDF text selection", () => {
  it("cleans multiline text and PDF line-break hyphenation", () => {
    expect(cleanPdfSelection("cogni-\n tive   load\nin et al. [12]")).toBe("cognitive load in et al. [12]");
    expect(cleanPdfSelection("evidence-based method")).toBe("evidence-based method");
  });

  it("accepts selections inside one Text Layer page", () => {
    document.body.innerHTML = '<article data-pdf-page-number="1" data-text-layer-ready="true"><div class="textLayer"><span>Selected</span><span> text</span></div></article>';
    const spans = document.querySelectorAll("span");
    const range = rangeAcross(spans[0]!.firstChild!, spans[1]!.firstChild!);
    expect(isPdfTextLayerRange(range)).toBe(true);
    expect(isSinglePdfPageRange(range)).toBe(true);
    expect(isReadyPdfTextLayerRange(range)).toBe(true);
  });

  it("blocks translation until the current Text Layer render is complete", () => {
    document.body.innerHTML = '<article data-pdf-page-number="1" data-text-layer-ready="false"><div class="textLayer"><span>Selected text</span></div></article>';
    const text = document.querySelector("span")!.firstChild!;
    expect(isReadyPdfTextLayerRange(rangeAcross(text, text))).toBe(false);
  });

  it("clears the old selection and closes selection UI when zoom changes", () => {
    document.body.innerHTML = "<p>Selected text</p>";
    const selection = window.getSelection()!;
    selection.selectAllChildren(document.querySelector("p")!);
    let reset = false;
    addEventListener(PDF_SELECTION_RESET_EVENT, () => { reset = true; }, { once: true });
    clearPdfSelection();
    expect(selection.rangeCount).toBe(0);
    expect(reset).toBe(true);
  });

  it("rejects canvas and cross-page selections to preserve reading order", () => {
    document.body.innerHTML = '<article data-pdf-page-number="1"><canvas></canvas><div class="textLayer"><span>One</span></div></article><article data-pdf-page-number="2"><div class="textLayer"><span>Two</span></div></article>';
    const spans = document.querySelectorAll("span");
    expect(isSinglePdfPageRange(rangeAcross(spans[0]!.firstChild!, spans[1]!.firstChild!))).toBe(false);
    const canvasRange = document.createRange();
    canvasRange.selectNode(document.querySelector("canvas")!);
    expect(isPdfTextLayerRange(canvasRange)).toBe(false);
  });
});
