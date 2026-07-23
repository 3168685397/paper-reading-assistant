import { useEffect, useRef } from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";

function PdfThumbnail({ document: pdf, page }: { document: PDFDocumentProxy; page: number }) {
  const shellRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    let disposed = false;
    let task: RenderTask | undefined;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      observer.disconnect();
      void pdf.getPage(page).then((pdfPage) => {
        if (disposed || !canvasRef.current) return;
        const viewport = pdfPage.getViewport({ scale: 0.16 });
        const canvas = canvasRef.current;
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const context = canvas.getContext("2d");
        if (!context) return;
        task = pdfPage.render({ canvas, canvasContext: context, viewport });
        return task.promise;
      }).catch(() => undefined);
    }, { rootMargin: "300px 0px" });
    observer.observe(shell);
    return () => {
      disposed = true;
      observer.disconnect();
      task?.cancel();
      if (canvasRef.current) {
        canvasRef.current.width = 0;
        canvasRef.current.height = 0;
      }
    };
  }, [page, pdf]);
  return <span ref={shellRef} className="pdf-thumbnail-placeholder"><canvas ref={canvasRef}/></span>;
}

interface Props {
  open: boolean;
  document: PDFDocumentProxy;
  current: number;
  onPage(page: number): void;
}

export function PdfSidebar({ open, document: pdf, current, onPage }: Props) {
  return <aside className="pdf-sidebar" data-open={open}>
    <div className="pdf-sidebar-list">
      {Array.from({ length: pdf.numPages }, (_, index) => index + 1).map((page) =>
        <button key={page} className={page === current ? "is-current" : ""} onClick={() => onPage(page)}>
          <PdfThumbnail document={pdf} page={page}/>
          <span>{page}</span>
        </button>
      )}
    </div>
  </aside>;
}
