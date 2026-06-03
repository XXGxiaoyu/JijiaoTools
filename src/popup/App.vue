<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { STORAGE_KEY, SETTINGS_KEY, defaultSettings, defaultState, normalize, normalizeSettings, type TaskSettings, type TaskState, type LogLine } from '../types'

const state = ref<TaskState>(defaultState())
const settings = ref<TaskSettings>(defaultSettings())
const settingsOpen = ref(false)
const logsEl = ref<HTMLElement>()

const version = chrome.runtime.getManifest().version

const isRunning = computed(() => state.value.status === 'running')
const statusText = computed(() =>
  state.value.status === 'running' ? '执行中' : state.value.status === 'done' ? '已完成' : '待机中'
)
const footerText = computed(() => {
  if (state.value.total) return `进度 ${Math.min(state.value.index + 1, state.value.total)}/${state.value.total}`
  return state.value.status === 'running' ? '正在执行' : '系统就绪'
})

const logs = computed(() => {
  const progressText = `播放第 ${Math.min(state.value.index + 1, state.value.total || state.value.index + 1)} 门课 (${state.value.viewed}/${state.value.required} 分钟)`
  const lines = state.value.logs.map((l: LogLine) => ({
    id: l.id,
    time: l.time,
    type: l.level,
    text: l.id === 'progress' ? progressText : l.text,
    muted: false,
  }))
  lines.push({ id: undefined, time: '', type: '' as never, text: '等待输入...', muted: true })
  return lines
})

function typeColor(t: string) {
  if (t === 'INFO') return 'c-primary'
  if (t === 'TASK') return 'c-secondary'
  if (t === 'DEBUG') return 'c-debug'
  if (t === 'SUCCESS') return 'c-tertiary'
  if (t === 'WARN' || t === 'ERROR') return 'c-error'
  return ''
}

async function loadState() {
  const r = await chrome.storage.local.get(STORAGE_KEY)
  state.value = normalize(r[STORAGE_KEY])
}

async function loadSettings() {
  const r = await chrome.storage.local.get([SETTINGS_KEY])
  settings.value = normalizeSettings(r[SETTINGS_KEY])
}

async function saveSettings(patch: Partial<TaskSettings>) {
  const next = { ...settings.value, ...patch }
  settings.value = next
  await chrome.storage.local.set({ [SETTINGS_KEY]: next })
}

function onStorage(changes: Record<string, chrome.storage.StorageChange>, area: string) {
  if (area === 'local' && changes[STORAGE_KEY]) {
    state.value = normalize(changes[STORAGE_KEY].newValue)
  }
  if (area === 'local' && changes[SETTINGS_KEY]) {
    settings.value = normalizeSettings(changes[SETTINGS_KEY].newValue)
  }
}

watch(logs, async () => {
  await nextTick()
  if (logsEl.value) logsEl.value.scrollTop = logsEl.value.scrollHeight
})

onMounted(() => {
  loadState()
  loadSettings()
  chrome.storage.onChanged.addListener(onStorage)
})
onUnmounted(() => chrome.storage.onChanged.removeListener(onStorage))

async function toggle() {
  if (isRunning.value) {
    await chrome.storage.local.set({ [STORAGE_KEY]: { ...state.value, status: 'idle' } })
    chrome.runtime.sendMessage({ type: 'STOP' })
    return
  }
  const base = state.value.status === 'done' ? defaultState() : state.value
  await chrome.storage.local.set({ [STORAGE_KEY]: { ...base, status: 'running' } })
  chrome.runtime.sendMessage({ type: 'START', forceCurrent: settings.value.startFromCurrent })
}

async function setDebug(e: Event) {
  await saveSettings({ debug: (e.target as HTMLInputElement).checked })
}

async function setStartFromCurrent(e: Event) {
  await saveSettings({ startFromCurrent: (e.target as HTMLInputElement).checked })
}

async function clearCache() {
  const next = defaultState()
  state.value = next
  await chrome.storage.local.set({ [STORAGE_KEY]: next })
}

async function clearConsole() {
  await chrome.storage.local.set({ [STORAGE_KEY]: { ...state.value, logs: [] } })
}
</script>

<template>
  <div class="app">
    <header class="topbar">
      <div class="brand">
        <span class="logo">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>
        </span>
        <h1 class="brand-name">JiJiaoTools</h1>
      </div>
      <div class="top-actions">
        <div class="help-wrap">
          <button class="icon-btn" type="button" aria-label="帮助" aria-describedby="help-tooltip">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M11 18h2v-2h-2v2Zm1-16a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16ZM12 6a4 4 0 0 0-4 4h2a2 2 0 1 1 4 0c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5a4 4 0 0 0-4-4Z"/></svg>
          </button>
          <div id="help-tooltip" class="help-tooltip" role="tooltip">
            <strong>帮助与说明：</strong>
            点击开始后，扩展会自动播放当前课程视频、监听暂停并恢复播放、按课程进度自动切换下一课；遇到答题弹窗时会依次尝试选项并提交，答题通过后继续播放。控制台会实时显示执行状态、答题与切课日志。
          </div>
        </div>
        <button class="icon-btn" type="button" aria-label="设置" @click="settingsOpen = true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="m19.14 12.94.06-.94-.06-.94 2.03-1.58a.5.5 0 0 0 .12-.61l-1.92-3.32a.5.5 0 0 0-.59-.22l-2.39.96a7 7 0 0 0-1.62-.94l-.36-2.54a.49.49 0 0 0-.5-.42h-3.84a.49.49 0 0 0-.5.42l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.5.5 0 0 0-.59.22L2.74 8.87a.5.5 0 0 0 .12.61l2.03 1.58-.06.94.06.94-2.03 1.58a.5.5 0 0 0-.12.61l1.92 3.32c.13.22.39.31.59.22l2.39-.96c.49.38 1.03.7 1.62.94l.36 2.54c.04.24.25.42.5.42h3.84c.25 0 .46-.18.5-.42l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.09.46 0 .59-.22l1.92-3.32a.5.5 0 0 0-.12-.61l-2.03-1.58ZM12 15.6a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2Z"/></svg>
        </button>
      </div>
    </header>

    <div
      class="drawer-overlay"
      :class="{ 'is-open': settingsOpen }"
      @click="settingsOpen = false"
    />
    <aside class="settings-drawer" :class="{ 'is-open': settingsOpen }" aria-label="设置">
      <div class="drawer-head">
        <h2 class="drawer-title">设置</h2>
        <button class="icon-btn" type="button" aria-label="关闭设置" @click="settingsOpen = false">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.7 19.3 3.3 17.9 9.2 12 3.3 6.1 4.7 4.7l5.9 5.9 6.3-6.3z"/></svg>
        </button>
      </div>
      <div class="drawer-body custom-scrollbar">
        <div class="setting-list">
          <label class="setting-item">
            <span>
              <span class="setting-title">Debug 模式</span>
              <span class="setting-desc">显示详细运行日志</span>
            </span>
            <span class="switch">
              <input
                type="checkbox"
                :checked="settings.debug"
                @change="setDebug"
              >
              <span class="slider" />
            </span>
          </label>
          <label class="setting-item">
            <span>
              <span class="setting-title">从当前视频开始</span>
              <span class="setting-desc">启动时跳过前面的课程</span>
            </span>
            <span class="switch">
              <input
                type="checkbox"
                :checked="settings.startFromCurrent"
                @change="setStartFromCurrent"
              >
              <span class="slider" />
            </span>
          </label>
        </div>
        <div class="drawer-actions">
          <button class="cache-btn" type="button" @click="clearCache">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V7H6v12ZM8 9h8v10H8V9Zm7.5-5-1-1h-5l-1 1H5v2h14V4h-3.5Z"/></svg>
            清除缓存
          </button>
        </div>
      </div>
      <div class="drawer-foot">JiJiaoTools Engine v{{ version }}</div>
    </aside>

    <main class="body">
      <div class="action-card">
        <button class="run-btn" :class="{ 'is-error': isRunning }" type="button" @click="toggle">
          <svg v-if="!isRunning" viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          <svg v-else viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>
          <span class="run-text">{{ isRunning ? '停止执行' : '开始执行' }}</span>
        </button>
      </div>

      <div class="stats">
        <div class="status-card">
          <span class="status-label">当前状态</span>
          <span class="status-value">
            <span class="status-dot" />
            {{ statusText }}
          </span>
        </div>
      </div>

      <div class="console">
        <div class="console-head">
          <span class="console-title">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2ZM5.7 9.3 8.4 12l-2.7 2.7 1.4 1.4L11.2 12 7.1 7.9 5.7 9.3ZM13 14h5v2h-5v-2Z"/></svg>
            控制台输出
          </span>
          <button class="clear-btn" type="button" @click="clearConsole">清除</button>
        </div>
        <div ref="logsEl" class="console-logs custom-scrollbar">
          <div
            v-for="(line, i) in logs"
            :key="line.id ?? i"
            class="console-line"
            :class="{ muted: line.muted }"
          >
            <template v-if="line.muted">{{ line.text }}</template>
            <template v-else>[{{ line.time }}] <span class="lv" :class="typeColor(line.type)">{{ line.type }}</span> {{ line.text }}</template>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">
      <div class="footer-left">
        <span class="v">v{{ version }}</span>
        <span class="dot-sep" />
        <span class="v">{{ footerText }}</span>
      </div>
      <a class="history" href="#">
        查看历史
        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12 4l-1.4 1.4L16.2 11H4v2h12.2l-5.6 5.6L12 20l8-8z"/></svg>
      </a>
    </footer>
  </div>
</template>

<style scoped src="./App.css"></style>
