# PDF MIME Handler Roadmap / PDF MIME Handler 路线图

## English

The v0.3.0 reader does not replace Chrome's built-in PDF viewer. Users explicitly open the extension menu and choose **Open PDF in Paper Reading Assistant**, or select a local PDF inside the reader.

For Chrome 151 and later, the project may evaluate a future `mime_types_handler` integration for `application/pdf`. The goal would be to receive PDF streams directly and offer an opt-in replacement reading flow. This is not implemented, does not change the current minimum Chrome version, and is not a delivery commitment.

Before adoption, the project must validate browser availability, Chrome Web Store policy, user consent, rollback behavior, private/signed URL handling, and compatibility with local files and enterprise policy.

## 简体中文

v0.3.0 阅读器不会替换 Chrome 内置 PDF 阅读器。用户需要主动打开扩展菜单并选择**用论文精读助手打开 PDF**，或在阅读器中选择本地 PDF。

对于 Chrome 151 及以上版本，项目未来可以评估面向 `application/pdf` 的 `mime_types_handler` 集成，目标是直接接收 PDF 数据流并提供用户主动选择的替代阅读流程。当前没有实现该能力，不提高最低 Chrome 版本，也不承诺交付时间。

采用前必须验证浏览器可用性、Chrome Web Store 政策、用户授权与回退流程、私人或签名 URL 处理，以及本地文件和企业策略兼容性。
