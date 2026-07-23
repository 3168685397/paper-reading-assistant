import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  hooks: {
    "build:manifestGenerated": (_wxt, manifest) => {
      if (manifest.content_scripts?.length === 0) delete manifest.content_scripts;
    }
  },
  manifest: {
    name: "Paper Reading Assistant · 论文精读助手",
    description: "翻译和精读网页中选中的英文文本。",
    minimum_chrome_version: "116",
    permissions: ["storage", "contextMenus", "scripting"],
    optional_host_permissions: ["http://*/*", "https://*/*"],
    action: { default_title: "论文精读助手" }
  }
});
