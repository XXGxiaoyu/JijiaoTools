# Jijiao Tools Wiki

兼容 Chrome / Edge 的浏览器扩展，基于 Vue 3 + Vite + TypeScript（Manifest V3）。

## 技术栈

| 项 | 版本/说明 |
| --- | --- |
| Vue | 3.5 |
| 构建 | Vite 6 |
| 插件方案 | CRXJS (`@crxjs/vite-plugin`) — 自动处理 manifest、HMR 热更新 |
| 语言 | TypeScript 5.7 |
| Manifest | V3 |

## 目录结构

```
jijiao-tools/
├── manifest.config.ts      MV3 配置（action/background/content_scripts/permissions/icons）
├── vite.config.ts          Vite + Vue + CRXJS
├── tsconfig.json
├── public/icons/           图标 16/48/128（当前为占位图，需替换）
└── src/
    ├── popup/              弹窗：index.html + main.ts + App.vue
    ├── background/index.ts Service Worker（含 ping/pong 消息示例）
    ├── content/index.ts    内容脚本，注入 <all_urls>
    └── env.d.ts            类型声明
```

## 入口说明

- **Popup**：点击工具栏图标弹出的 Vue 界面。`App.vue` 内含计数器与向 background 发送 `ping` 的示例。
- **Background (Service Worker)**：常驻后台脚本，监听 `onInstalled` 与 `onMessage`，对 `ping` 回复 `pong`。
- **Content Script**：注入到所有页面（`<all_urls>`），当前仅打印日志。

## 权限

`storage`、`activeTab`（见 [manifest.config.ts](manifest.config.ts)）。

## 开发流程

```bash
npm install        # 安装依赖
npm run dev        # 开发模式（HMR）
npm run build      # vue-tsc 类型检查 + 打包到 dist/
npm run preview    # 预览构建产物
```

## 浏览器加载

1. 打开 `chrome://extensions`（Edge 为 `edge://extensions`）
2. 开启「开发者模式」
3. 点击「加载已解压的扩展」，选择 `dist/` 目录

开发模式下 `dist/` 随代码改动实时更新。

## 待办 / 注意

- `public/icons/` 当前是 1×1 占位 PNG，发布前替换为真实图标。
- content script 匹配 `<all_urls>`，按需收窄 `matches` 范围更安全。
- 如需可加入：Options 设置页、Vue Router、Pinia、UI 样式方案。

## 消息通信示例

Popup → Background：

```ts
const res = await chrome.runtime.sendMessage({ type: 'ping' })
// res => { type: 'pong', time: <timestamp> }
```
