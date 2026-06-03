import { STORAGE_KEY, SETTINGS_KEY, defaultState, normalize, normalizeSettings, type TaskState, type LogLevel, type Msg } from '../types'

const COURSE_SEL = '.g-study-sd dd > a'
const CURRENT_CLASS = 'z-crt'
const REQUIRED_SEL = '.g-study-prompt span'
const VIEWED_TEXT_SEL = '#viewTimeTxt'
const VIEWED_SEL = '.g-study-prompt input'
const POLL_MS = 5000
const MAX_POLL_MS = 60 * 60 * 1000

let pollTimer: number | undefined
let pollStart = 0
let forceCurrentStart = false

async function getState(): Promise<TaskState> {
  const r = await chrome.storage.local.get(STORAGE_KEY)
  return normalize(r[STORAGE_KEY])
}

async function getSettings() {
  const r = await chrome.storage.local.get([SETTINGS_KEY])
  return normalizeSettings(r[SETTINGS_KEY])
}

async function setState(patch: Partial<TaskState>) {
  const s = await getState()
  const next = { ...s, ...patch }
  await chrome.storage.local.set({ [STORAGE_KEY]: next })
  return next
}

function now() {
  return new Date().toTimeString().slice(0, 8)
}

async function log(level: LogLevel, text: string, id?: string) {
  const s = await getState()
  const line = { id, time: now(), level, text }
  const logs = id && s.logs.some((l) => l.id === id)
    ? s.logs.map((l) => (l.id === id ? line : l))
    : [...s.logs, line].slice(-50)
  await chrome.storage.local.set({ [STORAGE_KEY]: { ...s, logs } })
}

async function debugLog(text: string, id?: string) {
  const settings = await getSettings()
  if (settings.debug) await log('DEBUG', text, id)
}

function courses(): HTMLAnchorElement[] {
  return Array.from(document.querySelectorAll<HTMLAnchorElement>(COURSE_SEL))
}

function currentDomIndex(list: HTMLAnchorElement[]): number {
  return list.findIndex((a) => a.classList.contains(CURRENT_CLASS))
}

function num(sel: string): number {
  const el = document.querySelector(sel)
  const t = (el instanceof HTMLInputElement ? el.value : el?.textContent) ?? ''
  const n = parseFloat(t.replace(/[^\d.]/g, ''))
  return Number.isFinite(n) ? n : NaN
}

function viewedNum() {
  const viewedText = num(VIEWED_TEXT_SEL)
  return Number.isNaN(viewedText) ? num(VIEWED_SEL) : viewedText
}

const VIDEO_ID = '#video video'
const QUESTION_SEL = '#questionDiv'
const QUESTION_OPTION_SEL = '#questionDiv .m-question-lst li label'
const QUESTION_SUBMIT_SEL = '#questionDiv .u-main-btn'
const ANSWER_RETRY_MS = 800

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function answerQuestion(box: Element) {
  const s = await getState()
  if (s.status !== 'running' || !document.contains(box)) return

  const labels = Array.from(document.querySelectorAll<HTMLLabelElement>(QUESTION_OPTION_SEL))
  const submit = document.querySelector<HTMLButtonElement>(QUESTION_SUBMIT_SEL)
  if (!labels.length || !submit) {
    await debugLog(`答题弹窗信息不完整：options=${labels.length}, submit=${Boolean(submit)}`)
    return
  }

  await log('TASK', `检测到答题弹窗，开始尝试 ${labels.length} 个选项`)
  notifyPopup()

  for (let i = 0; i < labels.length; i += 1) {
    const label = labels[i]
    const latest = await getState()
    if (latest.status !== 'running' || !document.contains(box)) return
    await debugLog(`尝试答题选项 ${i + 1}/${labels.length}`)
    label.click()
    submit.click()
    await delay(ANSWER_RETRY_MS)
    if (!document.contains(box)) {
      await log('INFO', '答题通过，继续播放')
      notifyPopup()
      playVideo()
      return
    }
  }
}

function observeQuestion() {
  const seen = new WeakSet<Element>()
  const handle = () => {
    const box = document.querySelector(QUESTION_SEL)
    if (box && !seen.has(box)) {
      seen.add(box)
      answerQuestion(box)
    }
  }
  handle()
  new MutationObserver(handle).observe(document.documentElement, { childList: true, subtree: true })
}

function playVideo() {
  const v = document.querySelector(VIDEO_ID) as HTMLVideoElement | null
  if (!v) {
    debugLog('未找到 video 元素，暂时无法播放')
    return
  }
  if (!v.dataset.jjBound) {
    v.dataset.jjBound = '1'
    v.addEventListener('pause', async () => {
      const s = await getState()
      if (s.status === 'running') {
        await debugLog('检测到视频暂停，尝试恢复播放')
        v.play().catch(() => debugLog('视频自动恢复播放失败'))
      }
    })
  }
  v.play().catch(() => debugLog('视频播放失败'))
}

function clearPoll() {
  if (pollTimer !== undefined) {
    clearInterval(pollTimer)
    pollTimer = undefined
  }
}

async function fail(text: string) {
  clearPoll()
  await log('ERROR', text)
  await setState({ ...defaultState(), logs: (await getState()).logs })
  await log('WARN', '已重置进度，下次将从头开始')
  notifyPopup()
}

function notifyPopup() {
  chrome.runtime.sendMessage({ type: 'STATE_CHANGED' }).catch(() => {})
}

async function advance() {
  const s = await getState()
  const list = courses()
  const next = s.index + 1
  if (next >= s.total) {
    await setState({ status: 'done', index: next })
    await log('INFO', '全部课程已完成，任务停止')
    notifyPopup()
    return
  }
  await setState({ index: next })
  await log('TASK', `切换到第 ${next + 1} 门课`)
  notifyPopup()
  list[next].click()
}

function startPoll() {
  clearPoll()
  pollStart = Date.now()
  debugLog(`开始轮询观看进度，间隔 ${POLL_MS}ms`)
  pollTimer = window.setInterval(async () => {
    const s = await getState()
    if (s.status !== 'running') return clearPoll()
    if (Date.now() - pollStart > MAX_POLL_MS) return fail('单课观看超时')
    const viewed = viewedNum()
    const required = num(REQUIRED_SEL)
    await debugLog(`轮询观看时长：viewed=${Number.isNaN(viewed) ? 'NaN' : viewed}, required=${Number.isNaN(required) ? 'NaN' : required}`, 'poll-debug')
    if (Number.isNaN(viewed) || Number.isNaN(required)) return
    await setState({ viewed, required })
    notifyPopup()
    if (viewed >= required) {
      await log('INFO', `已达标 (${viewed}/${required} 分钟)`)
      clearPoll()
      advance()
    }
  }, POLL_MS)
}

async function tick() {
  const s = await getState()
  if (s.status !== 'running') return
  const list = courses()
  if (!list.length) return fail('未找到课程列表')

  let index = s.index
  let total = s.total || list.length
  const settings = await getSettings()
  const domIdx = currentDomIndex(list)
  await debugLog(`任务状态：index=${s.index}, total=${s.total}, domIndex=${domIdx}, courses=${list.length}, forceCurrent=${forceCurrentStart}`)

  if (forceCurrentStart && settings.startFromCurrent && domIdx >= 0) {
    index = domIdx
    total = list.length
    forceCurrentStart = false
    await setState({ total, index, viewed: 0, required: 0 })
    await debugLog(`从当前高亮课程强制启动：index=${index}, total=${total}`)
  } else if (!s.total) {
    if (settings.startFromCurrent && domIdx >= 0) index = domIdx
    await setState({ total: list.length, index })
    await debugLog(`初始化课程进度：index=${index}, total=${list.length}`)
  } else {
    forceCurrentStart = false
  }

  if (index >= total) {
    await setState({ status: 'done' })
    await log('INFO', '全部课程已完成，任务停止')
    notifyPopup()
    return
  }

  if (domIdx !== index) {
    await log('TASK', `跳转到第 ${index + 1} 门课`)
    list[index].click()
    return
  }

  const viewed = viewedNum()
  const required = num(REQUIRED_SEL)
  await debugLog(`读取观看时长：viewed=${Number.isNaN(viewed) ? 'NaN' : viewed}, required=${Number.isNaN(required) ? 'NaN' : required}`)
  if (Number.isNaN(viewed) || Number.isNaN(required)) return fail('无法读取观看时长')
  await setState({ viewed, required })

  if (viewed >= required) {
    await log('INFO', `第 ${index + 1} 门课已达标 (${viewed}/${required} 分钟)`)
    advance()
  } else {
    await log('TASK', '播放课程中', 'progress')
    playVideo()
    startPoll()
  }
}

chrome.runtime.onMessage.addListener((msg: Msg) => {
  if (msg?.type === 'START') {
    forceCurrentStart = Boolean(msg.forceCurrent)
    tick()
  } else if (msg?.type === 'STOP') {
    forceCurrentStart = false
    clearPoll()
  }
  return false
})

window.addEventListener('pagehide', clearPoll)
window.addEventListener('pageshow', (e) => {
  if (e.persisted) getState().then((s) => { if (s.status === 'running') tick() })
})

observeQuestion()

getState().then((s) => {
  if (s.status === 'running') tick()
})

