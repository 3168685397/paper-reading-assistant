export class ApiError extends Error {
  constructor(message: string, public readonly code: string) { super(message); }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof DOMException && error.name === "AbortError") return new ApiError("请求已取消。", "cancelled");
  if (error instanceof TypeError && typeof navigator !== "undefined" && !navigator.onLine) return new ApiError("网络已断开，请恢复连接后重试。", "offline");
  if (error instanceof TypeError) return new ApiError("无法连接模型服务，请检查地址、网络和站点权限。", "network");
  if (error instanceof SyntaxError) return new ApiError("模型服务返回了无法解析的数据，请稍后重试。", "json");
  return new ApiError(error instanceof Error ? error.message : "模型请求失败，请稍后重试。", "unknown");
}

export function httpError(status: number): ApiError {
  if (status === 401) return new ApiError("API Key 无效或已过期，请在设置中检查。", "unauthorized");
  if (status === 429) return new ApiError("模型服务请求过于频繁，请稍后重试。", "rate_limited");
  return new ApiError(`模型服务返回错误（HTTP ${status}）。`, "http");
}
