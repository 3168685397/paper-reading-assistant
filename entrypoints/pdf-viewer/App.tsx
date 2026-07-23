import { useCallback, useEffect, useRef, useState } from "react";
import { getDocument, type PDFDocumentLoadingTask, type PDFDocumentProxy } from "pdfjs-dist";
import { PdfDocument } from "../../src/features/pdf/PdfDocument";
import { PdfSidebar } from "../../src/features/pdf/PdfSidebar";
import { PdfToolbar } from "../../src/features/pdf/PdfToolbar";
import { fetchPdfBytes } from "../../src/features/pdf/pdfLoader";
import { PdfReaderError, toPdfReaderError } from "../../src/features/pdf/pdfErrors";
import { createLocalPdfSource, isPdfFile, parseRemotePdfUrl, type LocalPdfSource } from "../../src/features/pdf/pdfSource";
import { getPdfMessages, preferredPdfLocale, type PdfLocale } from "../../src/locales/pdf";

function sourceName(url: URL): string {
  const value = decodeURIComponent(url.pathname.split("/").pop() || "Remote PDF");
  return value || "Remote PDF";
}

export default function App() {
  const [locale, setLocale] = useState<PdfLocale>(() => preferredPdfLocale());
  const messages = getPdfMessages(locale);
  const [pdf, setPdf] = useState<PDFDocumentProxy>();
  const [fileName, setFileName] = useState("");
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [sidebar, setSidebar] = useState(true);
  const [progress, setProgress] = useState<number>();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [passwordUpdate, setPasswordUpdate] = useState<((password: string) => void)>();
  const [password, setPassword] = useState("");
  const [scanned, setScanned] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const taskRef = useRef<PDFDocumentLoadingTask | undefined>(undefined);
  const abortRef = useRef<AbortController | undefined>(undefined);
  const localSourceRef = useRef<LocalPdfSource | undefined>(undefined);
  const textCounts = useRef(new Map<number, number>());

  const localizedError = useCallback((reason: unknown) => {
    const parsed = toPdfReaderError(reason);
    if (["unauthorized", "forbidden"].includes(parsed.code)) return messages.protectedRemote;
    if (parsed.code === "not_found") return messages.notFound;
    if (parsed.code === "rate_limited") return messages.rateLimited;
    if (parsed.code === "timeout") return messages.timeout;
    if (parsed.code === "too_large") return messages.tooLarge;
    if (parsed.code === "network") return messages.network;
    return messages.invalid;
  }, [messages]);

  const disposeDocument = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = undefined;
    await taskRef.current?.destroy();
    taskRef.current = undefined;
    await pdf?.cleanup();
    localSourceRef.current?.revoke();
    localSourceRef.current = undefined;
  }, [pdf]);

  const openBytes = useCallback(async (bytes: Uint8Array, name: string) => {
    await taskRef.current?.destroy();
    await pdf?.cleanup();
    setPdf(undefined);
    setFileName(name);
    setError("");
    setNotice("");
    setPassword("");
    setPasswordUpdate(undefined);
    setScanned(false);
    setProgress(100);
    textCounts.current.clear();
    const task = getDocument({ data: bytes });
    taskRef.current = task;
    task.onPassword = (updatePassword: (password: string) => void) => setPasswordUpdate(() => updatePassword);
    try {
      const document = await task.promise;
      setPdf(document);
      setPage(1);
      setProgress(undefined);
      setPasswordUpdate(undefined);
    } catch (reason) {
      const parsed = toPdfReaderError(reason);
      if (parsed.code !== "password") setError(localizedError(parsed));
      setProgress(undefined);
    }
  }, [localizedError, pdf]);

  const openRemote = useCallback(async (url: URL) => {
    abortRef.current?.abort();
    localSourceRef.current?.revoke();
    localSourceRef.current = undefined;
    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 30_000);
    setProgress(0);
    setError("");
    try {
      const bytes = await fetchPdfBytes(url, {
        signal: controller.signal,
        onProgress: (loaded, total) => setProgress(total ? Math.round((loaded / total) * 100) : Math.min(95, Math.round(loaded / 100_000)))
      });
      await openBytes(bytes, sourceName(url));
    } catch (reason) {
      setError(localizedError(reason));
      setProgress(undefined);
    } finally {
      clearTimeout(timeout);
    }
  }, [localizedError, openBytes]);

  useEffect(() => {
    const url = parseRemotePdfUrl(new URLSearchParams(location.search).get("src"));
    if (url) void openRemote(url);
    return () => { void disposeDocument(); };
  }, []);

  useEffect(() => {
    const invalid = () => setNotice(messages.crossPage);
    addEventListener("pdf-selection-error", invalid);
    return () => removeEventListener("pdf-selection-error", invalid);
  }, [messages.crossPage]);

  const openLocal = async (file: File | undefined) => {
    if (!file) return;
    if (!isPdfFile(file)) {
      setError(messages.invalid);
      return;
    }
    abortRef.current?.abort();
    localSourceRef.current?.revoke();
    localSourceRef.current = createLocalPdfSource(file);
    setProgress(0);
    try {
      await openBytes(new Uint8Array(await file.arrayBuffer()), file.name);
    } catch (reason) {
      setError(localizedError(reason));
    }
  };

  const jump = (next: number) => {
    const safe = Math.max(1, Math.min(pdf?.numPages ?? 1, Number.isFinite(next) ? next : 1));
    setPage(safe);
    document.querySelector(`[data-pdf-page-number="${safe}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const reportText = useCallback((pageNumber: number, count: number) => {
    textCounts.current.set(pageNumber, count);
    const samples = [...textCounts.current.entries()].filter(([number]) => number <= 3);
    if (samples.length >= Math.min(3, pdf?.numPages ?? 3)) {
      setScanned(samples.reduce((sum, [, value]) => sum + value, 0) < 20);
    }
  }, [pdf?.numPages]);

  const readerError = error ? (error === "NOT_PDF" ? messages.invalid : error) : "";

  return <div className="pdf-app" data-sidebar={sidebar}>
    <PdfToolbar
      messages={messages}
      fileName={fileName}
      page={page}
      pages={pdf?.numPages ?? 0}
      scale={scale}
      onPage={jump}
      onScale={setScale}
      onRotate={() => setRotation((value) => (value + 90) % 360)}
      onOpen={() => fileInput.current?.click()}
      onToggleSidebar={() => setSidebar((value) => !value)}
      onSettings={() => void chrome.runtime.openOptionsPage()}
    />
    <input ref={fileInput} className="pdf-file-input" type="file" accept="application/pdf,.pdf" onChange={(event) => void openLocal(event.target.files?.[0])}/>
    <div className="pdf-language-switch" aria-label="Language">
      <button className={locale === "en" ? "is-active" : ""} onClick={() => setLocale("en")}>EN</button>
      <button className={locale === "zh-CN" ? "is-active" : ""} onClick={() => setLocale("zh-CN")}>中文</button>
    </div>
    {pdf && <PdfSidebar open={sidebar} document={pdf} current={page} onPage={jump}/>}
    <section className="pdf-reader-shell">
      {!pdf && progress === undefined && !readerError && <div className="pdf-empty">
        <div className="pdf-empty-mark">PDF</div>
        <h1>{messages.appName}</h1>
        <p>{messages.noPdf}</p>
        <button className="button primary" onClick={() => fileInput.current?.click()}>{messages.openLocal}</button>
        <small>{messages.localPrivacy}</small>
      </div>}
      {progress !== undefined && <div className="pdf-state"><span className="pdf-spinner"/><strong>{messages.loading}</strong><progress max="100" value={progress}/><span>{progress}%</span></div>}
      {readerError && <div className="pdf-state pdf-state-error"><strong>{messages.invalid}</strong><p>{readerError}</p><button className="button" onClick={() => fileInput.current?.click()}>{messages.openLocal}</button></div>}
      {passwordUpdate && <form className="pdf-state" onSubmit={(event) => { event.preventDefault(); passwordUpdate(password); setPassword(""); }}>
        <strong>{messages.passwordRequired}</strong>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={messages.password} autoComplete="off"/>
        <button className="button primary">{messages.unlock}</button>
      </form>}
      {scanned && <div className="pdf-warning">{messages.scanned}</div>}
      {notice && <button className="pdf-notice" onClick={() => setNotice("")}>{notice}</button>}
      {pdf && <PdfDocument document={pdf} scale={scale} rotation={rotation} onVisible={setPage} onTextCount={reportText}/>}
    </section>
  </div>;
}
