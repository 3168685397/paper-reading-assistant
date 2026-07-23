import type { GrammarResult, TranslationResult } from "../lib/llm/schemas";

export interface SelectionPayload {
  text: string;
  title: string;
  url: string;
  selectedAt: number;
}

export interface ModelConfig {
  apiBaseUrl: string;
  model: string;
  apiKey: string;
  language: string;
  autoTranslate: boolean;
  saveHistory: boolean;
}

export interface HistoryRecord {
  id: string;
  original: string;
  translation: TranslationResult;
  grammar?: GrammarResult;
  pageTitle: string;
  pageUrl: string;
  createdAt: number;
}

export type RuntimeRequest =
  | { type: "TRANSLATE"; payload: SelectionPayload }
  | { type: "ANALYZE"; payload: SelectionPayload }
  | { type: "CANCEL_REQUEST" }
  | { type: "OPEN_OPTIONS" }
  | { type: "CONTEXT_SELECTION"; payload: SelectionPayload };
