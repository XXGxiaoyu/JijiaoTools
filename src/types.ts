export type TaskStatus = 'idle' | 'running' | 'done'
export type LogLevel = 'INFO' | 'TASK' | 'WARN' | 'ERROR'

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

export type Msg =
  | { type: 'START' }
  | { type: 'STOP' }
  | { type: 'STATE_CHANGED' }
