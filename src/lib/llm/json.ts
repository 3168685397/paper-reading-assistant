import type { ZodType } from "zod";

export function extractJson(value: string): unknown {
  const cleaned = value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try { return JSON.parse(cleaned); } catch { /* try balanced object */ }
  const start = cleaned.indexOf("{");
  if (start < 0) throw new Error("模型没有返回 JSON 对象");
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let i = start; i < cleaned.length; i += 1) {
    const char = cleaned[i];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') quoted = false;
    } else if (char === '"') quoted = true;
    else if (char === "{") depth += 1;
    else if (char === "}" && --depth === 0) return JSON.parse(cleaned.slice(start, i + 1));
  }
  throw new Error("模型返回的 JSON 不完整");
}

export function parseModelResult<T>(value: string, schema: ZodType<T>): T {
  const result = schema.safeParse(extractJson(value));
  if (!result.success) throw new Error("模型返回的数据结构不符合要求");
  return result.data;
}
