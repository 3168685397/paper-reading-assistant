import type { SelectionPayload } from "../../types";

const rules = `只返回合法 JSON，不要 Markdown 代码块。忠实保留学术语气、限定词、因果转折、专业术语和引用编号，不增加原文没有的信息。`;

function optionalPageContext(input: SelectionPayload, includePageContext: boolean): string {
  return includePageContext ? `\n页面标题：${input.title}\n页面 URL：${input.url}` : "";
}

export function translationPrompt(input: SelectionPayload, language: string, includePageContext = false): string {
  return `${rules}
将所选论文文本翻译为${language}。长段落按自然句或分句拆分，中英逐对对应。
返回结构：{"summary":"整段核心意思","pairs":[{"english":"英文原句或自然分句","chinese":"准确翻译"}]}
${optionalPageContext(input, includePageContext)}
所选文本：
${input.text}`;
}

export function grammarPrompt(input: SelectionPayload, includePageContext = false): string {
  return `${rules}
教学对象是英语基础有限的中文学习者。所有教学解释必须以简单、准确的简体中文为主；英文只保留语法术语英文名、论文原文、例句、单词和固定搭配。禁止输出整段英文定义。
先说明结构在原句中的作用，再解释规则；只选择真正影响理解的结构，不讲细枝末节。词汇解释必须以本文语境为中心，不得照搬英文词典定义。
不得输出 Markdown，必须严格返回以下 JSON：
{"sentences":[{"sentence":"英文句子","mainStructure":"句子结构","subject":{"text":"英文主语","explanation":"简短中文解释"},"predicate":{"text":"英文谓语","explanation":"简短中文解释"},"objectOrComplement":{"text":"英文宾语、表语或补语","explanation":"简短中文解释"},"clauses":[{"type":"中文结构名称","text":"英文原文","role":"中文作用"}],"logic":"中文逻辑关系","learningNote":"中文理解提示"}],"grammarPoints":[{"id":"grammar-1","nameZh":"中文语法名称","nameEn":"English grammar name","source":"原文结构","explanation":"不超过80个中文字符的解释","breakdown":[{"text":"原文组成","role":"不超过50个中文字符的作用"}],"functionInSentence":"不超过80个中文字符，说明在本句中的作用","example":"一个英文例句","exampleZh":"例句的简体中文翻译"}],"vocabulary":[{"term":"词或固定搭配","partOfSpeech":"v.","meaning":"不超过20个汉字的中文释义","meaningInContext":"不超过50个汉字的本文含义","source":"论文原文语境","collocations":[{"english":"英文搭配","chinese":"中文含义"}]}]}
限制：grammarPoints 最多5项；每项 breakdown 最多4项且 example 仅1个。vocabulary 最多6项；每项 collocations 最多2项。不要为了数量凑内容。
${optionalPageContext(input, includePageContext)}
所选文本：
${input.text}`;
}
