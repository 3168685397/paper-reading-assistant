import type { PdfMessages } from "../../locales/pdf";

interface Props {
  messages: PdfMessages;
  fileName: string;
  page: number;
  pages: number;
  scale: number;
  onPage(page: number): void;
  onScale(scale: number): void;
  onRotate(): void;
  onOpen(): void;
  onToggleSidebar(): void;
  onSettings(): void;
}

export function PdfToolbar(props: Props) {
  return <header className="pdf-toolbar">
    <div className="pdf-toolbar-brand">
      <button className="pdf-icon-button" onClick={props.onToggleSidebar} aria-label={props.messages.sidebar}>☰</button>
      <div><strong>{props.fileName || props.messages.appName}</strong><span>{props.pages ? `${props.pages} pages` : ""}</span></div>
    </div>
    <nav className="pdf-toolbar-controls" aria-label="PDF controls">
      <button className="pdf-icon-button" disabled={props.page <= 1} onClick={() => props.onPage(props.page - 1)} aria-label={props.messages.previous}>←</button>
      <label className="pdf-page-field"><span>{props.messages.page}</span><input type="number" min={1} max={Math.max(1, props.pages)} value={props.page} onChange={(event) => props.onPage(Number(event.target.value))}/><span>/ {props.pages || "—"}</span></label>
      <button className="pdf-icon-button" disabled={!props.pages || props.page >= props.pages} onClick={() => props.onPage(props.page + 1)} aria-label={props.messages.next}>→</button>
      <label className="pdf-scale-field"><span>{props.messages.zoom}</span><select value={props.scale} onChange={(event) => props.onScale(Number(event.target.value))}>
        {[0.75, 1, 1.25, 1.5, 2].map((value) => <option key={value} value={value}>{Math.round(value * 100)}%</option>)}
      </select></label>
      <button className="pdf-text-button" onClick={props.onRotate}>{props.messages.rotate}</button>
    </nav>
    <div className="pdf-toolbar-actions">
      <button className="pdf-text-button" onClick={props.onOpen}>{props.messages.openLocal}</button>
      <button className="pdf-text-button" onClick={props.onSettings}>{props.messages.settings}</button>
    </div>
  </header>;
}
