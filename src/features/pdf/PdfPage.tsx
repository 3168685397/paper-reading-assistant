import { useEffect, useRef, useState } from "react";
import { TextLayer, type PDFDocumentProxy, type RenderTask } from "pdfjs-dist";

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
  const [visible, setVisible] = useState(pageNumber <= 2);
  const [aspect, setAspect] = useState(1.414);

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
    if (!visible) return;
    let disposed = false;
    let renderTask: RenderTask | undefined;
    let textLayer: TextLayer | undefined;
    void (async () => {
      const page = await pdf.getPage(pageNumber);
      if (disposed) return;
      const viewport = page.getViewport({ scale, rotation });
      setAspect(viewport.height / viewport.width);
      const canvas = canvasRef.current;
      const text = textRef.current;
      if (!canvas || !text) return;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.floor(viewport.width * ratio);
      canvas.height = Math.floor(viewport.height * ratio);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      text.replaceChildren();
      text.style.width = `${viewport.width}px`;
      text.style.height = `${viewport.height}px`;
      const context = canvas.getContext("2d");
      if (!context) return;
      renderTask = page.render({ canvas, canvasContext: context, viewport, transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0] });
      const content = await page.getTextContent();
      if (disposed) return;
      const count = content.items.reduce((sum, item) => sum + ("str" in item ? item.str.trim().length : 0), 0);
      onTextCount(pageNumber, count);
      textLayer = new TextLayer({ textContentSource: content, container: text, viewport });
      await Promise.all([renderTask.promise, textLayer.render()]);
    })().catch((error: unknown) => {
      if (!disposed && !(error instanceof Error && error.name === "RenderingCancelledException")) throw error;
    });
    return () => {
      disposed = true;
      renderTask?.cancel();
      textLayer?.cancel();
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
      textRef.current?.replaceChildren();
    };
  }, [pdf, pageNumber, rotation, scale, visible, onTextCount]);

  const width = 816 * scale;
  return <article
    ref={shellRef}
    className="pdf-page"
    data-pdf-page-number={pageNumber}
    style={{ width, minHeight: width * aspect }}
    aria-label={`Page ${pageNumber}`}
  >
    {visible && <>
      <canvas ref={canvasRef} aria-hidden="true"/>
      <div ref={textRef} className="textLayer"/>
    </>}
    <span className="pdf-page-number">{pageNumber}</span>
  </article>;
}
