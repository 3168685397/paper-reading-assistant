import { describe, expect, it } from "vitest";
import { httpError, toApiError } from "../src/lib/llm/errors";

describe("API errors", () => {
  it("转换认证和限流错误", () => {
    expect(httpError(401).code).toBe("unauthorized");
    expect(httpError(429).message).toContain("频繁");
  });
  it("保留普通错误的可读信息", () => {
    expect(toApiError(new Error("JSON 解析失败")).message).toBe("JSON 解析失败");
  });
  it("映射无法解析的服务响应", () => {
    expect(toApiError(new SyntaxError("Unexpected token")).code).toBe("json");
  });
});
