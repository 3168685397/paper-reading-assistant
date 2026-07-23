import React from "react";
import ReactDOM from "react-dom/client";
import { GlobalWorkerOptions } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import pdfJsLicenseText from "pdfjs-dist/LICENSE?raw";
import "pdfjs-dist/web/pdf_viewer.css";
import "../shared.css";
import "./style.css";
import App from "./App";
import { startSelectionTranslationUi } from "../../src/lib/popover/controller";
import { cleanPdfSelection, isPdfTextLayerRange, isSinglePdfPageRange } from "../../src/features/pdf/PdfTextSelection";

GlobalWorkerOptions.workerSrc = workerUrl;
const licenseNotice = document.createElement("script");
licenseNotice.id = "pdfjs-license";
licenseNotice.type = "text/plain";
licenseNotice.textContent = pdfJsLicenseText;
document.head.append(licenseNotice);

void startSelectionTranslationUi({
  forceButtonMode: true,
  transformSelection: cleanPdfSelection,
  validateRange: (range) => isPdfTextLayerRange(range) && isSinglePdfPageRange(range),
  onInvalidRange: () => window.dispatchEvent(new CustomEvent("pdf-selection-error")),
  pageTitle: "PDF Reader",
  pageUrl: ""
});

ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><App/></React.StrictMode>);
