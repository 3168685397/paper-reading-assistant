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
  selectionBehavior: SelectionBehavior;
  includePageContext: boolean;
  excludedSites: string[];
  saveHistory: boolean;
}

export type SelectionBehavior = "button" | "auto" | "disabled";

export interface ContentSettings {
  selectionBehavior: SelectionBehavior;
  excludedSites: string[];
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
  | { type: "GET_CONTENT_SETTINGS" }
  | { type: "GET_LAST_SITE" }
  | { type: "CHECK_PDF_URL"; url: string }
  | { type: "CONTEXT_SELECTION"; payload: SelectionPayload };
