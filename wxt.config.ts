import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Science Reader · 精读助手",
    description: "为英文科研论文提供克制、准确的中英对照翻译与语法精读。",
    minimum_chrome_version: "116",
    permissions: ["storage", "contextMenus"],
    host_permissions: ["https://www.science.org/*"],
    optional_host_permissions: ["https://*/*", "http://*/*"],
    action: { default_title: "Science 精读助手" }
  }
});
