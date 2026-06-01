# Jijiao Tools（继教助手）

兼容 Chrome / Edge 的浏览器扩展，自动完成继续教育平台的课程视频观看任务。基于 Vue 3 + Vite + TypeScript（Manifest V3）开发。

## 功能特性

- 一键开始 / 停止自动刷课
- 自动顺序切换课程、播放视频，轮询观看时长直到达标后自动进入下一门
- 实时控制台日志（INFO / TASK / WARN / ERROR）与进度展示
- 状态持久化于 `chrome.storage.local`，弹窗关闭后任务仍在后台运行
- 单课观看超时（默认 1 小时）自动重置并告警

## 技术栈

| 项 | 版本 / 说明 |
| --- | --- |
| Vue | 3.5 |
| 构建 | Vite 6 |
| 插件方案 | CRXJS (`@crxjs/vite-plugin`)，自动处理 manifest 与 HMR |
| 语言 | TypeScript 5.7 |
| Manifest | V3 |

## 目录结构

```
jijiao-tools/
├── manifest.config.ts        MV3 配置（action/background/content_scripts/permissions/icons）
├── vite.config.ts            Vite + Vue + CRXJS
├── public/icons/             图标 16/48/128
└── src/
    ├── popup/                弹窗 UI（App.vue + main.ts + 样式）
    ├── background/index.ts   Service Worker，转发 popup 与 content 之间的消息
    ├── content/index.ts      内容脚本，执行刷课逻辑
    └── types.ts              共享类型与状态定义
```

## 工作原理

1. Popup 点击「开始执行」，写入 `running` 状态并向 background 发送 `START`。
2. Background 将消息转发给当前激活标签页的 content script。
3. Content script 读取课程列表，定位当前课程，播放视频并按 5 秒间隔轮询观看时长；达标后自动切换下一门，全部完成则置为 `done`。
4. 状态变更通过 `chrome.storage.local` 同步回 Popup，实时刷新进度与日志。

## 权限

`storage`、`activeTab`（详见 [manifest.config.ts](manifest.config.ts)）。

## 开发

```bash
npm install        # 安装依赖
npm run dev        # 开发模式（HMR）
npm run build      # vue-tsc 类型检查 + 打包到 dist/
npm run preview    # 预览构建产物
```

## 安装加载

1. 打开 `chrome://extensions`（Edge 为 `edge://extensions`）
2. 开启「开发者模式」
3. 点击「加载已解压的扩展」，选择 `dist/` 目录

## 许可证

[MIT](LICENSE)
