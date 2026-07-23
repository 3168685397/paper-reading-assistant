import type { HistoryRecord, ModelConfig, SelectionPayload } from "../../types";

export const defaults: ModelConfig = {
  apiBaseUrl: "https://api.openai.com/v1",
  model: "gpt-4.1-mini",
  apiKey: "",
  language: "简体中文",
  autoTranslate: true,
  saveHistory: true
};

export async function getConfig(): Promise<ModelConfig> {
  const { modelConfig } = await chrome.storage.local.get("modelConfig");
  return { ...defaults, ...(modelConfig as Partial<ModelConfig> | undefined) };
}

export async function getSelection(): Promise<SelectionPayload | undefined> {
  const { activeSelection } = await chrome.storage.session.get("activeSelection");
  return activeSelection as SelectionPayload | undefined;
}

export function mergeHistory(records: HistoryRecord[], incoming: HistoryRecord): HistoryRecord[] {
  return [incoming, ...records.filter((item) => item.original !== incoming.original)].slice(0, 50);
}

export async function saveRecord(record: HistoryRecord): Promise<void> {
  const { history = [] } = await chrome.storage.local.get("history");
  await chrome.storage.local.set({ history: mergeHistory(history as HistoryRecord[], record) });
}

export async function attachGrammar(original: string, grammar: HistoryRecord["grammar"]): Promise<void> {
  const { history = [] } = await chrome.storage.local.get("history");
  const next = (history as HistoryRecord[]).map((item) => item.original === original ? { ...item, grammar } : item);
  await chrome.storage.local.set({ history: next });
}

export function recordToMarkdown(record: HistoryRecord): string {
  const pairs = record.translation.pairs.map((p) => `${p.english}\n\n${p.chinese}`).join("\n\n---\n\n");
  const grammar = record.grammar ? `\n\n## 语法分析\n\n${record.grammar.sentences.map((s) => `### ${s.sentence}\n\n- 主干：${s.mainStructure}\n- 主语：${s.subject.text} — ${s.subject.explanation}\n- 谓语：${s.predicate.text} — ${s.predicate.explanation}\n- 宾语/补语：${s.objectOrComplement.text} — ${s.objectOrComplement.explanation}\n- 逻辑：${s.logic}`).join("\n\n")}` : "";
  return `# Science 精读笔记\n\n> ${record.pageTitle}\n> ${record.pageUrl}\n\n## 中英对照\n\n${pairs}\n\n## 核心意思\n\n${record.translation.summary}${grammar}`;
}
