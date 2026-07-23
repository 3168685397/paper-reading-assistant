export type PdfLocale = "en" | "zh-CN";

const messages = {
  en: {
    appName: "Paper Reading Assistant",
    openPdf: "Open PDF in Paper Reading Assistant",
    openLocal: "Open local PDF",
    settings: "Settings",
    loading: "Loading PDF",
    invalid: "Invalid PDF",
    passwordRequired: "Password required",
    password: "PDF password",
    unlock: "Unlock",
    page: "Page",
    zoom: "Zoom",
    rotate: "Rotate",
    sidebar: "Pages",
    previous: "Previous page",
    next: "Next page",
    noPdf: "Open a local PDF or use the extension menu while viewing a PDF link.",
    notPdf: "The current page was not recognized as a PDF. Use “Open local PDF” instead.",
    scanned: "This PDF appears to be scanned or image-based and has no selectable text. OCR support is planned for a future release.",
    crossPage: "Cross-page selection is not supported yet. Select text within one page.",
    localPrivacy: "PDF files are parsed locally. Only text you explicitly select is sent to your configured model API.",
    protectedRemote: "This PDF cannot be reloaded from its original link. Download it first, then use “Open local PDF”."
    ,notFound: "The PDF was not found or its link has expired."
    ,rateLimited: "The PDF server is busy. Try again later."
    ,timeout: "PDF loading timed out."
    ,tooLarge: "This PDF exceeds the 150 MB safety limit."
    ,network: "The PDF could not be loaded. Check the connection and website permission."
  },
  "zh-CN": {
    appName: "论文精读助手",
    openPdf: "用论文精读助手打开 PDF",
    openLocal: "打开本地 PDF",
    settings: "设置",
    loading: "正在加载 PDF",
    invalid: "PDF 无效或已损坏",
    passwordRequired: "PDF 需要密码",
    password: "PDF 密码",
    unlock: "解锁",
    page: "页码",
    zoom: "缩放",
    rotate: "旋转",
    sidebar: "页面",
    previous: "上一页",
    next: "下一页",
    noPdf: "请选择本地 PDF，或在打开 PDF 链接时通过扩展菜单进入。",
    notPdf: "当前页面未识别为 PDF，请使用“打开本地 PDF”。",
    scanned: "此 PDF 可能是扫描版或图片型 PDF，目前没有可选择的文字。OCR 识别将在后续版本支持。",
    crossPage: "暂不支持跨页选择，请只选择同一页中的文字。",
    localPrivacy: "PDF 仅在本地解析。只有你明确选择的文字会发送到你配置的模型 API。",
    protectedRemote: "当前 PDF 无法通过原始链接重新加载。请先下载 PDF，然后使用“打开本地 PDF”。"
    ,notFound: "未找到 PDF，链接可能已经过期。"
    ,rateLimited: "PDF 服务器繁忙，请稍后重试。"
    ,timeout: "PDF 加载超时。"
    ,tooLarge: "此 PDF 超过 150 MB 安全限制。"
    ,network: "无法加载 PDF，请检查网络和网站权限。"
  }
} as const;

export type PdfMessages = typeof messages.en | typeof messages["zh-CN"];

export function getPdfMessages(locale: PdfLocale): PdfMessages {
  return messages[locale];
}

export function preferredPdfLocale(language = navigator.language): PdfLocale {
  return language.toLowerCase().startsWith("zh") ? "zh-CN" : "en";
}
