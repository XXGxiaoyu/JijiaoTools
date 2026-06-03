# Jijiao Tools（继教助手）

兼容 Chrome / Edge 的浏览器扩展，自动完成继续教育平台的课程视频观看任务。基于 Vue 3 + Vite + TypeScript（Manifest V3）开发。

## 功能特性

### 核心功能
- **一键开始 / 停止**：简洁的弹窗界面，点击即可启动或停止自动刷课任务
- **自动播放与切换**：顺序播放课程视频，轮询观看时长，达标后自动切换下一门课程
- **视频暂停恢复**：自动监听视频暂停事件并恢复播放，确保连续观看
- **答题弹窗处理**：检测到答题弹窗时，自动尝试所有选项直到答题通过
- **从当前视频开始**：支持从当前高亮课程开始执行，无需从头开始

### 状态与日志
- **实时控制台日志**：分级日志输出（INFO / TASK / DEBUG / WARN / ERROR）
- **动态进度展示**：实时显示当前课程进度、已观看时长和所需时长
- **Debug 模式**：可开启详细运行日志，便于问题排查
- **状态持久化**：状态保存于 `chrome.storage.local`，弹窗关闭后任务仍在后台运行

### 安全与可靠性
- **单课超时保护**：单课观看超时（默认 1 小时）自动重置并告警
- **缓存清除**：支持手动清除任务缓存，重新开始

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

1. **Popup 交互**：点击「开始执行」，写入 `running` 状态并向 background 发送 `START` 消息
2. **消息转发**：Background Service Worker 将消息转发给当前激活标签页的 content script
3. **课程执行**：Content script 读取课程列表，定位当前课程，播放视频并按 5 秒间隔轮询观看时长
4. **视频监控**：自动监听视频暂停事件并恢复播放，检测答题弹窗并自动处理
5. **自动切换**：课程达标后自动切换下一门，全部完成则置为 `done` 状态
6. **状态同步**：状态变更通过 `chrome.storage.local` 同步回 Popup，实时刷新进度与日志

## 版本历史

### v1.0.7 (2026-06-03)
- ✨ 新增 Debug 模式设置选项
- 🐛 优化日志输出逻辑，支持更详细的运行日志
- 📝 改进调试信息展示

### v1.0.6 (2026-06-01)
- ✨ 实现动态进度日志，实时显示播放进度
- 📝 补充安装说明文档
- 🎨 优化控制台日志展示

### v1.0.5 (2026-06-01)
- ✨ 添加帮助提示气泡，提升用户体验
- 🎨 恢复动态版本号显示
- 🔧 更新应用品牌名称为 JiJiaoTools

### v1.0.4 (2026-06-01)
- ✨ 新增答题弹窗自动处理功能
- 🐛 修复视频暂停后无法续播的问题
- 📊 修正进度展示逻辑

### v1.0.3 及更早版本
- 🎉 初始化项目，实现基础自动刷课功能

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

### 方式一：从 Release 压缩包安装（推荐）

1. 从 [Releases](../../releases) 下载最新版本的 `jijiao-tools-x.x.x.zip`
2. 打开浏览器扩展管理页面
   - Chrome：`chrome://extensions`
   - Edge：`edge://extensions`
3. 开启「开发者模式」（页面右上角）
4. 将下载的 `.zip` 文件直接拖入扩展管理页面，浏览器会自动解压并安装

### 方式二：本地开发加载

1. 克隆项目并构建
   ```bash
   git clone <repository-url>
   cd jijiao-tools
   npm install
   npm run build
   ```
2. 打开浏览器扩展管理页面（`chrome://extensions` 或 `edge://extensions`）
3. 开启「开发者模式」
4. 点击「加载已解压的扩展」，选择项目中的 `dist/` 目录

## 使用说明

1. **打开扩展**：点击浏览器工具栏中的扩展图标
2. **配置设置**（可选）：
   - 点击右上角设置按钮
   - 开启/关闭 Debug 模式（显示详细日志）
   - 开启/关闭「从当前视频开始」选项
3. **开始执行**：在继续教育平台的课程页面，点击「开始执行」按钮
4. **监控进度**：控制台会实时显示执行日志和当前进度
5. **停止任务**：需要时点击「停止执行」按钮

### 注意事项

- 确保在课程列表页面启动扩展
- 弹窗关闭后任务会继续在后台运行
- 如遇异常可点击「清除缓存」重新开始
- 单课程观看超过 1 小时会自动超时保护

## 许可证

[MIT](LICENSE)

---

## 项目状态

**当前版本**：v1.0.7  
**最后更新**：2026-06-03  
**状态**：✅ 稳定运行

### 技术实现亮点

- ✅ 基于 Manifest V3 最新标准
- ✅ 使用 Vue 3 Composition API + TypeScript 开发
- ✅ CRXJS 插件实现开发时热更新（HMR）
- ✅ 消息通信架构：Popup ↔ Background ↔ Content Script
- ✅ 状态持久化与实时同步
- ✅ MutationObserver 监听 DOM 变化
- ✅ 自动答题与视频控制

### 开发路线图

- [ ] 支持多个继续教育平台
- [ ] 添加任务历史记录功能
- [ ] 优化答题算法提高准确率
- [ ] 支持自定义超时时间设置
- [ ] 添加统计与分析面板
