export const WEBSITE_ORIGINS = ["http://*/*", "https://*/*"] as const;
export const CONTENT_SCRIPT_ID = "paper-reading-assistant-selection";

export const CONTENT_SCRIPT_REGISTRATION: chrome.scripting.RegisteredContentScript = {
  id: CONTENT_SCRIPT_ID,
  matches: [...WEBSITE_ORIGINS],
  js: ["content-scripts/content.js"],
  runAt: "document_idle",
  allFrames: true,
  matchOriginAsFallback: true,
  persistAcrossSessions: true
};

export interface RegistrationApi {
  hasPermission(): Promise<boolean>;
  getRegistered(): Promise<chrome.scripting.RegisteredContentScript[]>;
  register(script: chrome.scripting.RegisteredContentScript): Promise<void>;
  unregister(id: string): Promise<void>;
}

export async function syncContentScriptRegistration(api: RegistrationApi): Promise<"registered" | "unregistered" | "unchanged"> {
  const [allowed, registered] = await Promise.all([api.hasPermission(), api.getRegistered()]);
  const exists = registered.some((script) => script.id === CONTENT_SCRIPT_ID);
  if (allowed && !exists) {
    await api.register(CONTENT_SCRIPT_REGISTRATION);
    return "registered";
  }
  if (!allowed && exists) {
    await api.unregister(CONTENT_SCRIPT_ID);
    return "unregistered";
  }
  return "unchanged";
}

export function chromeRegistrationApi(): RegistrationApi {
  return {
    hasPermission: () => chrome.permissions.contains({ origins: [...WEBSITE_ORIGINS] }),
    getRegistered: () => chrome.scripting.getRegisteredContentScripts({ ids: [CONTENT_SCRIPT_ID] }),
    register: (script) => chrome.scripting.registerContentScripts([script]),
    unregister: (id) => chrome.scripting.unregisterContentScripts({ ids: [id] })
  };
}

export async function injectIntoOpenPages(): Promise<void> {
  const tabs = await chrome.tabs.query({});
  await Promise.allSettled(tabs
    .filter((tab): tab is chrome.tabs.Tab & { id: number } => typeof tab.id === "number")
    .map((tab) => chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      files: ["content-scripts/content.js"]
    })));
}
