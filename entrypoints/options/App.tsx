import { useEffect, useState } from "react";
import { WEBSITE_ORIGINS } from "../../src/lib/permissions/contentScriptRegistration";
import { addExcludedSite } from "../../src/lib/sites";
import { defaults, getConfig, recordToMarkdown } from "../../src/lib/storage";
import type { HistoryRecord, ModelConfig } from "../../src/types";

type AccessState = "checking" | "granted" | "missing" | "revoked";

export default function App() {
  const [config, setConfig] = useState<ModelConfig>(defaults);
  const [saved, setSaved] = useState("");
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [access, setAccess] = useState<AccessState>("checking");
  const [siteInput, setSiteInput] = useState("");
  const [lastSite, setLastSite] = useState("");

  const refreshAccess = async (revoked = false) => {
    const granted = await chrome.permissions.contains({ origins: [...WEBSITE_ORIGINS] });
    setAccess(granted ? "granted" : revoked ? "revoked" : "missing");
  };

  useEffect(() => {
    void getConfig().then(setConfig);
    void chrome.storage.local.get("history").then(({ history: items = [] }) => setHistory(items as HistoryRecord[]));
    void refreshAccess();
    void chrome.runtime.sendMessage({ type: "GET_LAST_SITE" }).then((reply: { ok?: boolean; result?: string }) => {
      if (reply.ok && reply.result) setLastSite(reply.result);
    });
    const onRemoved = () => { void refreshAccess(true); };
    chrome.permissions.onRemoved.addListener(onRemoved);
    return () => chrome.permissions.onRemoved.removeListener(onRemoved);
  }, []);

  const field = <K extends keyof ModelConfig>(key: K, value: ModelConfig[K]) => {
    setConfig((old) => ({ ...old, [key]: value }));
  };

  const enableEverywhere = async () => {
    const granted = await chrome.permissions.request({ origins: [...WEBSITE_ORIGINS] });
    setAccess(granted ? "granted" : "missing");
  };

  const disableEverywhere = async () => {
    await chrome.permissions.remove({ origins: [...WEBSITE_ORIGINS] });
    await refreshAccess(true);
  };

  const save = async () => {
    let origin: string;
    try { origin = `${new URL(config.apiBaseUrl).origin}/*`; }
    catch { setSaved("API 地址格式不正确。"); return; }
    const granted = await chrome.permissions.contains({ origins: [origin] })
      || await chrome.permissions.request({ origins: [origin] });
    if (!granted) {
      setSaved("未获得该 API 域名的访问权限，配置没有保存。");
      return;
    }
    await chrome.storage.local.set({ modelConfig: config });
    setSaved("设置已保存。");
  };

  const addSite = (value: string) => {
    const next = addExcludedSite(config.excludedSites, value);
    if (next.length === config.excludedSites.length) return;
    field("excludedSites", next);
    setSiteInput("");
  };

  const removeRecord = async (id: string) => {
    const next = history.filter((item) => item.id !== id);
    await chrome.storage.local.set({ history: next });
    setHistory(next);
  };

  const accessCopy = {
    checking: "正在检查权限…",
    granted: "已在所有普通 HTTP/HTTPS 网站启用",
    missing: "尚未获得网页访问权限",
    revoked: "网页访问权限已被撤销，请重新授权"
  }[access];

  return <main className="options">
    <header>
      <div className="eyebrow">PAPER READING ASSISTANT</div>
      <h1>论文精读助手设置</h1>
      <p className="muted">模型配置保存在本机，仅受信任的扩展页面和后台服务可以读取。</p>
    </header>

    <h2>Site access / 网站访问</h2>
    <section className="access-panel">
      <div>
        <strong>Enable translation on all websites / 启用所有网站划词翻译</strong>
        <p>扩展只检测你主动选中的文字，不会读取整页内容或收集浏览历史。只有触发翻译后，选中文字才会发送到你配置的模型 API。</p>
      </div>
      <div className={`status status-${access}`}>{accessCopy}</div>
      <div className="button-row">
        {access !== "granted"
          ? <button className="button primary" onClick={() => void enableEverywhere()}>Enable on all websites / 启用所有网站</button>
          : <button className="button" onClick={() => void disableEverywhere()}>Disable everywhere / 全部停用</button>}
        {access !== "granted" && <button className="button" onClick={() => setSaved("你可以稍后在此页面重新启用。")}>Not now / 暂不启用</button>}
      </div>
    </section>

    <div className="form compact-form">
      <label className="field">
        <span className="label">Selection behavior / 划词行为</span>
        <select value={config.selectionBehavior} onChange={(event) => field("selectionBehavior", event.target.value as ModelConfig["selectionBehavior"])}>
          <option value="button">显示“译”按钮（默认）</option>
          <option value="auto">自动打开翻译卡片</option>
          <option value="disabled">完全禁用划词功能</option>
        </select>
      </label>
      <label className="field">
        <span className="label">Disabled websites / 已禁用网站</span>
        <div className="inline-field">
          <input value={siteInput} onChange={(event) => setSiteInput(event.target.value)} placeholder="mail.google.com" />
          <button className="button" type="button" onClick={() => addSite(siteInput)}>添加域名</button>
        </div>
      </label>
      {lastSite && <button className="text-button" type="button" onClick={() => addSite(lastSite)}>Disable on this website / 在最近使用的网站禁用：{lastSite}</button>}
      <div className="site-list">{config.excludedSites.map((site) => <span className="site-chip" key={site}>{site}<button type="button" aria-label={`移除 ${site}`} onClick={() => field("excludedSites", config.excludedSites.filter((item) => item !== site))}>×</button></span>)}</div>
      <p className="muted small">排除项只保存域名，不保存完整 URL 或浏览历史。浏览器内部页面、扩展管理页和 Chrome Web Store 无法注入。</p>
    </div>

    <h2>OpenAI-compatible API</h2>
    <div className="form">
      <label className="field"><span className="label">API Base URL</span><input type="url" value={config.apiBaseUrl} onChange={(event) => field("apiBaseUrl", event.target.value)} placeholder="https://api.openai.com/v1"/></label>
      <label className="field"><span className="label">Model</span><input type="text" value={config.model} onChange={(event) => field("model", event.target.value)} placeholder="gpt-4.1-mini"/></label>
      <label className="field"><span className="label">API Key</span><input type="password" value={config.apiKey} onChange={(event) => field("apiKey", event.target.value)} autoComplete="off" placeholder="仅保存在本机"/></label>
      <label className="field"><span className="label">翻译语言</span><input type="text" value={config.language} onChange={(event) => field("language", event.target.value)}/></label>
      <label className="check"><input type="checkbox" checked={config.includePageContext} onChange={(event) => field("includePageContext", event.target.checked)}/>允许将页面标题和 URL 作为模型上下文（默认关闭）</label>
      <label className="check"><input type="checkbox" checked={config.saveHistory} onChange={(event) => field("saveHistory", event.target.checked)}/>保存最近 50 条阅读记录</label>
    </div>
    <div className="save-row"><button className="button primary" onClick={() => void save()}>保存设置</button><span className={saved.includes("保存") ? "muted" : "error"}>{saved}</span></div>

    <h2>隐私说明</h2>
    <div className="notice">默认只把明确选中的文本和必要提示词发送到你配置的模型服务；页面标题和 URL 仅在你开启上方选项后发送。扩展不读取整页、表单或密码，不收集浏览历史，不含统计、广告或公共 API Key。API Key 不可由网页 Content Script 读取，所有模型请求均由后台服务执行。</div>

    <h2>最近记录 · {history.length}</h2>
    <div className="history-list">{history.length === 0 ? <p className="muted">还没有阅读记录。</p> : history.map((item) => <article className="history-row" key={item.id}>
      <div><div className="history-original">{item.original}</div><div className="history-meta">{item.pageTitle || "未命名页面"} · {new Date(item.createdAt).toLocaleString()}</div></div>
      <div className="history-actions"><button className="button" onClick={() => void navigator.clipboard.writeText(recordToMarkdown(item))}>复制 Markdown</button><button className="button danger" onClick={() => void removeRecord(item.id)}>删除</button></div>
    </article>)}</div>
    {history.length > 0 && <button className="button danger clear-history" onClick={async () => { await chrome.storage.local.set({ history: [] }); setHistory([]); }}>清空全部记录</button>}
  </main>;
}
