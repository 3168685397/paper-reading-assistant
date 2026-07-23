import { openAiCompatible } from "../src/lib/llm/openaiCompatible";
import { replaceAbortController } from "../src/lib/llm/requestControl";
import { attachGrammar, getConfig, saveRecord, toContentSettings } from "../src/lib/storage";
import { chromeRegistrationApi, injectIntoOpenPages, syncContentScriptRegistration, WEBSITE_ORIGINS } from "../src/lib/permissions/contentScriptRegistration";
import { normalizeHostname } from "../src/lib/sites";
import { isLikelyPdfUrl, parseRemotePdfUrl } from "../src/features/pdf/pdfSource";
import type { RuntimeRequest } from "../src/types";

let activeController: AbortController | undefined;
let activeJob: Promise<unknown> | undefined;

async function runExclusive<T>(job: (signal: AbortSignal) => Promise<T>): Promise<T> {
  if (activeJob) {
    activeController?.abort();
    try { await activeJob; } catch { /* replaced by the new request */ }
  }
  activeController = replaceAbortController(activeController);
  const timeout = setTimeout(() => activeController?.abort("timeout"), 30_000);
  activeJob = job(activeController.signal);
  try { return await activeJob as T; }
  finally {
    clearTimeout(timeout);
    activeController = undefined;
    activeJob = undefined;
  }
}

export default defineBackground(() => {
  const debug = (...values: unknown[]) => {
    if (import.meta.env.DEV) console.debug("[Paper Reading Assistant]", ...values);
  };
  chrome.storage.local.setAccessLevel({ accessLevel: "TRUSTED_CONTEXTS" });
  chrome.action.onClicked.addListener(() => { void chrome.runtime.openOptionsPage(); });

  const syncRegistration = () => syncContentScriptRegistration(chromeRegistrationApi());

  void syncRegistration();
  chrome.runtime.onStartup.addListener(() => { void syncRegistration(); });
  chrome.permissions.onAdded.addListener((permissions) => {
    if (permissions.origins?.some((origin) => WEBSITE_ORIGINS.includes(origin as typeof WEBSITE_ORIGINS[number]))) {
      void syncRegistration().then(() => injectIntoOpenPages());
    }
  });
  chrome.permissions.onRemoved.addListener((permissions) => {
    if (permissions.origins?.some((origin) => WEBSITE_ORIGINS.includes(origin as typeof WEBSITE_ORIGINS[number]))) {
      void syncRegistration();
    }
  });

  chrome.runtime.onInstalled.addListener(() => {
    void syncRegistration();
    chrome.contextMenus.removeAll(() => chrome.contextMenus.create({
      id: "paper-reading-assistant-selection",
      title: "翻译并精读选中文本",
      contexts: ["selection"]
    }));
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId !== "paper-reading-assistant-selection" || !info.selectionText || !tab?.id) return;
    void chrome.tabs.sendMessage(tab.id, {
      type: "CONTEXT_SELECTION",
      payload: {
        text: info.selectionText.slice(0, 5000),
        title: tab.title ?? "",
        url: tab.url ?? "",
        selectedAt: Date.now()
      }
    } satisfies RuntimeRequest, info.frameId === undefined ? undefined : { frameId: info.frameId });
  });

  chrome.runtime.onMessage.addListener((message: RuntimeRequest, sender, respond) => {
    if (message.type === "CANCEL_REQUEST") {
      activeController?.abort();
      respond({ ok: true });
      return;
    }
    if (message.type === "OPEN_OPTIONS") {
      void chrome.runtime.openOptionsPage().then(() => respond({ ok: true }));
      return true;
    }
    if (message.type === "GET_CONTENT_SETTINGS") {
      void getConfig().then((config) => {
        const host = sender.url ? normalizeHostname(sender.url) : undefined;
        if (host) void chrome.storage.session.set({ lastSiteHost: host });
        respond({ ok: true, result: toContentSettings(config) });
      });
      return true;
    }
    if (message.type === "GET_LAST_SITE") {
      void chrome.storage.session.get("lastSiteHost").then(({ lastSiteHost }) => respond({
        ok: true,
        result: typeof lastSiteHost === "string" ? lastSiteHost : ""
      }));
      return true;
    }
    if (message.type === "CHECK_PDF_URL") {
      void (async () => {
        const url = parseRemotePdfUrl(message.url);
        if (!url) return { ok: true, result: false };
        if (isLikelyPdfUrl(url.href)) return { ok: true, result: true };
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8_000);
        try {
          const response = await fetch(url, { method: "HEAD", credentials: "include", signal: controller.signal });
          return { ok: true, result: response.ok && response.headers.get("content-type")?.toLowerCase().includes("application/pdf") === true };
        } catch {
          return { ok: true, result: false };
        } finally {
          clearTimeout(timeout);
        }
      })().then(respond);
      return true;
    }
    if (message.type === "TRANSLATE") {
      debug("background:received", { type: message.type, length: message.payload.text.length });
      void (async () => {
        const config = await getConfig();
        if (!config.apiKey || !config.apiBaseUrl || !config.model) throw new Error("请先在设置中完成模型配置。");
        const result = await runExclusive((signal) => openAiCompatible.translate(message.payload, config, signal));
        if (config.saveHistory) {
          await saveRecord({
            id: crypto.randomUUID(), original: message.payload.text, translation: result,
            pageTitle: message.payload.title, pageUrl: message.payload.url, createdAt: Date.now()
          });
        }
        return { ok: true, result, saved: config.saveHistory };
      })().then((result) => {
        debug("request:success");
        respond(result);
      }).catch((error: unknown) => {
        debug("request:error", error instanceof Error ? error.name : "unknown");
        respond({ ok: false, error: error instanceof Error ? error.message : "翻译失败" });
      });
      return true;
    }
    if (message.type === "ANALYZE") {
      void (async () => {
        const config = await getConfig();
        if (!config.apiKey || !config.apiBaseUrl || !config.model) throw new Error("请先在设置中完成模型配置。");
        const result = await runExclusive((signal) => openAiCompatible.analyze(message.payload, config, signal));
        if (config.saveHistory) await attachGrammar(message.payload.text, result);
        return { ok: true, result, saved: config.saveHistory };
      })().then(respond).catch((error: unknown) => respond({ ok: false, error: error instanceof Error ? error.message : "分析失败" }));
      return true;
    }
  });
});
