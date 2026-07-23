import { grammarSchema, translationSchema } from "./schemas";
import { grammarPrompt, translationPrompt } from "./prompts";
import { parseModelResult } from "./json";
import { ApiError, httpError, toApiError } from "./errors";
import type { LlmAdapter } from "./types";
import type { ModelConfig } from "../../types";

function endpoint(base: string): string {
  const value = base.trim().replace(/\/+$/, "");
  return value.endsWith("/chat/completions") ? value : `${value}/chat/completions`;
}

async function complete(config: ModelConfig, prompt: string, signal: AbortSignal): Promise<string> {
  let last: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(endpoint(config.apiBaseUrl), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
        body: JSON.stringify({
          model: config.model, temperature: 0.1,
          response_format: { type: "json_object" },
          messages: [{ role: "user", content: prompt }]
        }),
        signal
      });
      if (!response.ok) throw httpError(response.status);
      const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("模型没有返回可读取的内容");
      return content;
    } catch (error) {
      last = error;
      if (signal.aborted) throw signal.reason === "timeout"
        ? new ApiError("模型响应超时，请稍后重试。", "timeout")
        : new ApiError("请求已取消。", "cancelled");
      if (attempt === 1 || (error instanceof ApiError && ["unauthorized", "rate_limited"].includes(error.code))) break;
    }
  }
  throw toApiError(last);
}

export const openAiCompatible: LlmAdapter = {
  async translate(input, config, signal) {
    return parseModelResult(await complete(config, translationPrompt(input, config.language, config.includePageContext), signal), translationSchema);
  },
  async analyze(input, config, signal) {
    return parseModelResult(await complete(config, grammarPrompt(input, config.includePageContext), signal), grammarSchema);
  }
};
