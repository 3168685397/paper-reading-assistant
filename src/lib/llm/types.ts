import type { GrammarResult, TranslationResult } from "./schemas";
import type { ModelConfig, SelectionPayload } from "../../types";

export interface LlmAdapter {
  translate(input: SelectionPayload, config: ModelConfig, signal: AbortSignal): Promise<TranslationResult>;
  analyze(input: SelectionPayload, config: ModelConfig, signal: AbortSignal): Promise<GrammarResult>;
}
