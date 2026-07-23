import { useEffect, useRef, useState } from "react";
import { TextLayer, type PDFDocumentProxy, type RenderTask } from "pdfjs-dist";
import { cancelPageLayers, createPageLayerPlan, createPageViewport, RenderGeneration } from "./pdfPageRendering";

interface Props {
  document: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  rotation: number;
  onVisible(page: number): void;
  onTextCount(page: number, count: number): void;
}

export function PdfPage({ document: pdf, pageNumber, scale, rotation, onVisible, onTextCount }: Props) {
  const shellRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const generationRef = useRef(new RenderGeneration());
  const [visible, setVisible] = useState(pageNumber <= 2);
  const [dimensions, setDimensions] = useState({ width: 816 * scale, height: 1056 * scale });

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      if (entry.isIntersecting) {
        setVisible(true);
        onVisible(pageNumber);
      } else if (Math.abs(entry.boundingClientRect.top) > innerHeight * 2.5) {
        setVisible(false);
      }
    }, { rootMargin: "900px 0px" });
    observer.observe(shell);
    return () => observer.disconnect();
  }, [onVisible, pageNumber]);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    shell.dataset.textLayerReady = "false";
    if (!visible) {
      generationRef.current.invalidate();
      return;
    }
    const generation = generationRef.current.begin();
    let disposed = false;
    let renderTask: RenderTask | undefined;
    let textLayer: TextLayer | undefined;
    const isCurrent = () => !disposed && generationRef.current.isCurrent(generation);
    void (async () => {
      const page = await pdf.getPage(pageNumber);
      if (!isCurrent()) return;
      const viewport = createPageViewport(page, scale, rotation);
      const plan = createPageLayerPlan(viewport, window.devicePixelRatio);
      setDimensions({ width: plan.cssWidth, height: plan.cssHeight });
      const canvas = canvasRef.current;
      const text = textRef.current;
      if (!canvas || !text || !isCurrent()) return;
      shell.style.setProperty("--scale-factor", String(viewport.scale));
      shell.style.setProperty("--user-unit", String(viewport.userUnit));
      shell.style.setProperty("--scale-round-x", "1px");
      shell.style.setProperty("--scale-round-y", "1px");
      canvas.width = plan.canvasWidth;
      canvas.height = plan.canvasHeight;
      canvas.style.width = `${plan.cssWidth}px`;
      canvas.style.height = `${plan.cssHeight}px`;
      text.replaceChildren();
      text.style.width = `${plan.cssWidth}px`;
      text.style.height = `${plan.cssHeight}px`;
      const context = canvas.getContext("2d");
      if (!context) return;
      renderTask = page.render({
        canvas,
        canvasContext: context,
        viewport: plan.viewport,
        transform: plan.canvasTransform
      });
      const content = await page.getTextContent();
      if (!isCurrent()) return;
      const count = content.items.reduce((sum, item) => sum + ("str" in item ? item.str.trim().length : 0), 0);
      onTextCount(pageNumber, count);
      textLayer = new TextLayer({ textContentSource: content, container: text, viewport: plan.viewport });
      await Promise.all([renderTask.promise, textLayer.render()]);
      if (!isCurrent()) return;
      shell.dataset.textLayerReady = "true";
    })().catch((error: unknown) => {
      if (isCurrent() && !(error instanceof Error && ["RenderingCancelledException", "AbortException"].includes(error.name))) {
        shell.dataset.textLayerError = "true";
      }
    });
    return () => {
      disposed = true;
      generationRef.current.invalidate();
      shell.dataset.textLayerReady = "false";
      cancelPageLayers(renderTask, textLayer, textRef.current ?? undefined);
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
    };
  }, [pdf, pageNumber, rotation, scale, visible, onTextCount]);

  return <article
    ref={shellRef}
    className="pdf-page"
    data-pdf-page-number={pageNumber}
    style={{ width: dimensions.width, height: dimensions.height }}
    aria-label={`Page ${pageNumber}`}
  >
    {visible && <>
      <canvas ref={canvasRef} className="canvas-layer" aria-hidden="true"/>
      <div ref={textRef} className="textLayer"/>
    </>}
    <span className="pdf-page-number">{pageNumber}</span>
  </article>;
}
