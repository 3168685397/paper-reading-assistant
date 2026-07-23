import { describe, expect, it } from "vitest";
import { extractJson, parseModelResult } from "../src/lib/llm/json";
import { grammarSchema, translationSchema } from "../src/lib/llm/schemas";

describe("model JSON", () => {
  const valid = { summary: "核心", pairs: [{ english: "Evidence suggests.", chinese: "证据表明。" }] };
  it("解析纯 JSON 和包裹文本中的 JSON", () => {
    expect(extractJson(JSON.stringify(valid))).toEqual(valid);
    expect(extractJson(`结果如下：\n\`\`\`json\n${JSON.stringify(valid)}\n\`\`\``)).toEqual(valid);
  });
  it("使用 Zod 校验", () => {
    expect(parseModelResult(JSON.stringify(valid), translationSchema)).toEqual(valid);
    expect(() => parseModelResult('{"summary":"","pairs":[]}', translationSchema)).toThrow("数据结构");
  });
});

const grammarPoint = {
  id: "grammar-1",
  nameZh: "动名词短语作主语",
  nameEn: "Gerund phrase as subject",
  source: "Lacking money or time",
  explanation: "这里的短语整体充当句子的主语。",
  breakdown: [{ text: "Lacking", role: "动名词，表示缺少" }],
  functionInSentence: "表示导致后续结果的情况或行为。",
  example: "Exercising regularly improves health.",
  exampleZh: "经常锻炼能够改善健康。"
};

const vocabulary = {
  term: "impose",
  partOfSpeech: "v.",
  meaning: "强加；使承受",
  meaningInContext: "本文指贫困给人带来认知负担。",
  source: "poverty imposes a cognitive load",
  collocations: [{ english: "impose a burden on somebody", chinese: "给某人施加负担" }]
};

const validGrammar = {
  sentences: [{
    sentence: "Lacking money can lead one to make poorer decisions.",
    mainStructure: "S + V + O + Object Complement",
    subject: { text: "Lacking money", explanation: "动名词短语作主语" },
    predicate: { text: "can lead", explanation: "情态动词加谓语" },
    objectOrComplement: { text: "one to make poorer decisions", explanation: "宾语及其补足语" },
    clauses: [],
    logic: "因果关系",
    learningNote: "不要把 lacking 误认为谓语。"
  }],
  grammarPoints: [grammarPoint],
  vocabulary: [vocabulary]
};

describe("grammar model JSON", () => {
  it("校验新版语法结构", () => {
    expect(grammarSchema.parse(validGrammar)).toEqual(validGrammar);
  });
  it("中文解释字段必填且必须包含中文", () => {
    const invalid = structuredClone(validGrammar);
    invalid.grammarPoints[0]!.explanation = "A gerund phrase is a subject.";
    expect(grammarSchema.safeParse(invalid).success).toBe(false);
  });
  it("限制知识点、breakdown 和词汇数量", () => {
    expect(grammarSchema.safeParse({ ...validGrammar, grammarPoints: Array(6).fill(grammarPoint) }).success).toBe(false);
    expect(grammarSchema.safeParse({
      ...validGrammar,
      grammarPoints: [{ ...grammarPoint, breakdown: Array(5).fill(grammarPoint.breakdown[0]) }]
    }).success).toBe(false);
    expect(grammarSchema.safeParse({ ...validGrammar, vocabulary: Array(7).fill(vocabulary) }).success).toBe(false);
  });
  it("旧格式返回明确的结构解析错误", () => {
    const old = { ...validGrammar, grammarPoints: [{ name: "Gerund", source: "Lacking", explanation: "Definition", example: "Example." }] };
    expect(() => parseModelResult(JSON.stringify(old), grammarSchema)).toThrow("数据结构不符合要求");
  });
});
