import { useState } from "react";
import { getPdfMessages, preferredPdfLocale } from "../../src/locales/pdf";

export default function App() {
  const messages = getPdfMessages(preferredPdfLocale());
  const [status, setStatus] = useState("");

  const viewerUrl = (source?: string) => {
    const url = new URL(chrome.runtime.getURL("/pdf-viewer.html"));
    if (source) url.searchParams.set("src", source);
    return url.href;
  };

  const openCurrent = async () => {
    setStatus("…");
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) {
      setStatus(messages.notPdf);
      return;
    }
    const reply = await chrome.runtime.sendMessage({ type: "CHECK_PDF_URL", url: tab.url }) as { ok: boolean; result?: boolean };
    if (!reply.ok || !reply.result) {
      setStatus(messages.notPdf);
      return;
    }
    await chrome.tabs.create({ url: viewerUrl(tab.url) });
    window.close();
  };

  return <main className="popup">
    <div className="popup-eyebrow">PAPER READING ASSISTANT</div>
    <h1>{messages.appName}</h1>
    <button className="popup-primary" onClick={() => void openCurrent()}>{messages.openPdf}</button>
    <button onClick={() => void chrome.tabs.create({ url: viewerUrl() })}>{messages.openLocal}</button>
    <button onClick={() => void chrome.runtime.openOptionsPage()}>{messages.settings}</button>
    {status && <p>{status}</p>}
  </main>;
}
