import { z } from "zod";

export const translationSchema = z.object({
  summary: z.string().min(1),
  pairs: z.array(z.object({
    english: z.string().min(1),
    chinese: z.string().min(1)
  })).min(1)
});

const chineseText = (maximum: number) => z.string().min(1).max(maximum).regex(/[\u3400-\u9fff]/, "必须包含简体中文解释");
const phraseSchema = z.object({ text: z.string().min(1), explanation: chineseText(80) });
export const grammarSchema = z.object({
  sentences: z.array(z.object({
    sentence: z.string(),
    mainStructure: z.string(),
    subject: phraseSchema,
    predicate: phraseSchema,
    objectOrComplement: phraseSchema,
    clauses: z.array(z.object({ type: chineseText(30), text: z.string().min(1), role: chineseText(60) })),
    logic: chineseText(80),
    learningNote: chineseText(100)
  })),
  grammarPoints: z.array(z.object({
    id: z.string().min(1),
    nameZh: chineseText(30),
    nameEn: z.string().min(1).max(80),
    source: z.string().min(1).max(300),
    explanation: chineseText(80),
    breakdown: z.array(z.object({
      text: z.string().min(1).max(120),
      role: chineseText(50)
    })).max(4),
    functionInSentence: chineseText(80),
    example: z.string().min(1).max(160),
    exampleZh: chineseText(80)
  })).max(5),
  vocabulary: z.array(z.object({
    term: z.string().min(1).max(60),
    partOfSpeech: z.string().min(1).max(20),
    meaning: chineseText(20),
    meaningInContext: chineseText(50),
    source: z.string().min(1).max(200),
    collocations: z.array(z.object({
      english: z.string().min(1).max(120),
      chinese: chineseText(50)
    })).max(2)
  })).max(6)
});

export type TranslationResult = z.infer<typeof translationSchema>;
export type GrammarResult = z.infer<typeof grammarSchema>;
