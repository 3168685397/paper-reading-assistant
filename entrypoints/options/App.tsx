import { useEffect, useState } from "react";
import { defaults, getConfig, recordToMarkdown } from "../../src/lib/storage";
import type { HistoryRecord, ModelConfig } from "../../src/types";

export default function App() {
  const [config, setConfig] = useState<ModelConfig>(defaults);
  const [saved, setSaved] = useState("");
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  useEffect(() => {
    void getConfig().then(setConfig);
    void chrome.storage.local.get("history").then(({ history: items = [] }) => setHistory(items as HistoryRecord[]));
  }, []);
  const field = (key: keyof ModelConfig, value: string | boolean) => setConfig((old) => ({ ...old, [key]: value }));
  const save = async () => {
    let origin: string;
    try { origin = `${new URL(config.apiBaseUrl).origin}/*`; } catch { setSaved("API 地址格式不正确。"); return; }
    const granted = await chrome.permissions.contains({ origins: [origin] }) || await chrome.permissions.request({ origins: [origin] });
    if (!granted) { setSaved("未获得该 API 域名的访问权限，配置没有保存。"); return; }
    await chrome.storage.local.set({ modelConfig: config }); setSaved("设置已保存。");
  };
  const removeRecord = async (id: string) => {
    const next = history.filter((item) => item.id !== id);
    await chrome.storage.local.set({ history: next });
    setHistory(next);
  };
  return <main className="options"><header><div className="eyebrow">SCIENCE READER</div><h1>模型与阅读设置</h1><p className="muted">配置由浏览器保存在本机，仅可信扩展页面可以读取。</p></header>
    <h2>OpenAI-compatible API</h2><div className="form">
      <label className="field"><span className="label">API Base URL</span><input type="url" value={config.apiBaseUrl} onChange={e=>field("apiBaseUrl",e.target.value)} placeholder="https://api.openai.com/v1"/></label>
      <label className="field"><span className="label">Model</span><input type="text" value={config.model} onChange={e=>field("model",e.target.value)} placeholder="gpt-4.1-mini"/></label>
      <label className="field"><span className="label">API Key</span><input type="password" value={config.apiKey} onChange={e=>field("apiKey",e.target.value)} autoComplete="off" placeholder="仅保存在本机"/></label>
      <label className="field"><span className="label">翻译语言</span><input type="text" value={config.language} onChange={e=>field("language",e.target.value)}/></label>
      <label className="check"><input type="checkbox" checked={config.autoTranslate} onChange={e=>field("autoTranslate",e.target.checked)}/>选择文本后自动翻译</label>
      <label className="check"><input type="checkbox" checked={config.saveHistory} onChange={e=>field("saveHistory",e.target.checked)}/>保存最近 50 条阅读记录</label>
    </div><div className="save-row"><button className="button primary" onClick={save}>保存设置</button><span className={saved.includes("保存。")?"muted":"error"}>{saved}</span></div>
    <h2>隐私说明</h2><div className="notice">扩展不收集浏览历史，不含统计或广告。只有你明确选择的文本、当前页面标题和 URL 会随必要提示词发送到你配置的模型服务。扩展不会读取或上传整篇论文。API Key 不写入源码，也不会由网页 Content Script 读取。</div>
    <h2>最近记录 · {history.length}</h2>
    <div className="history-list">{history.length === 0 ? <p className="muted">还没有阅读记录。</p> : history.map((item) => <article className="history-row" key={item.id}>
      <div><div className="history-original">{item.original}</div><div className="history-meta">{item.pageTitle || "未命名页面"} · {new Date(item.createdAt).toLocaleString()}</div></div>
      <div className="history-actions"><button className="button" onClick={() => navigator.clipboard.writeText(recordToMarkdown(item))}>复制 Markdown</button><button className="button danger" onClick={() => removeRecord(item.id)}>删除</button></div>
    </article>)}</div>
    {history.length > 0 && <button className="button danger clear-history" onClick={async () => { await chrome.storage.local.set({ history: [] }); setHistory([]); }}>清空全部记录</button>}
    <h2>权限说明</h2><div className="notice"><code>science.org</code> 权限仅用于显示划词按钮和网页内翻译卡片；模型 API 的域名权限在保存配置时单独请求。storage 用于设置与本地历史，contextMenus 用于右键入口。</div>
  </main>;
}
