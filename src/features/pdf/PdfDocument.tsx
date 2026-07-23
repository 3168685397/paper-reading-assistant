import { useCallback } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { PdfPage } from "./PdfPage";

interface Props {
  document: PDFDocumentProxy;
  scale: number;
  rotation: number;
  onVisible(page: number): void;
  onTextCount(page: number, count: number): void;
}

export function PdfDocument(props: Props) {
  const visible = useCallback((page: number) => props.onVisible(page), [props.onVisible]);
  const textCount = useCallback((page: number, count: number) => props.onTextCount(page, count), [props.onTextCount]);
  return <main className="pdf-document" aria-label="PDF document">
    {Array.from({ length: props.document.numPages }, (_, index) =>
      <PdfPage
        key={`${index + 1}-${props.scale}-${props.rotation}`}
        document={props.document}
        pageNumber={index + 1}
        scale={props.scale}
        rotation={props.rotation}
        onVisible={visible}
        onTextCount={textCount}
      />
    )}
  </main>;
}
