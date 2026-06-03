export type TaskStatus = 'idle' | 'running' | 'done'
export type LogLevel = 'INFO' | 'TASK' | 'DEBUG' | 'WARN' | 'ERROR'

export interface LogLine {
  id?: string
  time: string
  level: LogLevel
  text: string
}

export interface TaskState {
  status: TaskStatus
  index: number
  total: number
  viewed: number
  required: number
  logs: LogLine[]
}

export const STORAGE_KEY = 'jjAutoTask'
export const SETTINGS_KEY = 'jjAutoSettings'

export interface TaskSettings {
  debug: boolean
  startFromCurrent: boolean
}

export const defaultSettings = (): TaskSettings => ({
  debug: false,
  startFromCurrent: true,
})

export const defaultState = (): TaskState => ({
  status: 'idle',
  index: 0,
  total: 0,
  viewed: 0,
  required: 0,
  logs: [],
})

export function normalize(raw: unknown): TaskState {
  const d = defaultState()
  const s = (raw ?? {}) as Partial<TaskState>
  return {
    status: s.status ?? d.status,
    index: typeof s.index === 'number' ? s.index : d.index,
    total: typeof s.total === 'number' ? s.total : d.total,
    viewed: typeof s.viewed === 'number' ? s.viewed : d.viewed,
    required: typeof s.required === 'number' ? s.required : d.required,
    logs: Array.isArray(s.logs) ? s.logs : d.logs,
  }
}

export function normalizeSettings(raw: unknown): TaskSettings {
  const d = defaultSettings()
  const s = (raw ?? {}) as Partial<TaskSettings>
  return {
    debug: typeof s.debug === 'boolean' ? s.debug : d.debug,
    startFromCurrent: typeof s.startFromCurrent === 'boolean' ? s.startFromCurrent : d.startFromCurrent,
  }
}

export type Msg =
  | { type: 'START'; forceCurrent?: boolean }
  | { type: 'STOP' }
  | { type: 'STATE_CHANGED' }
