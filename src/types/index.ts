export type MarkerType = 'book' | 'bible' | 'article' | 'video' | 'project' | 'course' | 'other'

export interface Marker {
  id: string
  title: string
  pointer: string
  next_step: string
  type: MarkerType
  tags: string[]
  group?: string
  meeting_note?: string
  pinned: boolean
  archived: boolean
  created_at: string
  last_touched: string
}

export type ScheduleType = 'daily' | 'weekly' | 'monthly' | 'custom'

export interface Schedule {
  type: ScheduleType
  days_of_week?: number[] // 0=Sun, 6=Sat
  day_of_month?: number // 1-31
  interval_days?: number // for custom
}

export interface Rhythm {
  id: string
  title: string
  schedule: Schedule
  next_occurrence: string
  notification_enabled: boolean
  tags: string[]
  archived: boolean
  created_at: string
  last_completed?: string
}

export interface ParsedPointer {
  raw: string
  type?: 'page' | 'chapter' | 'verse' | 'chapter_verse' | 'timestamp' | 'step'
  page?: number
  chapter?: number
  verse?: number
  timestamp?: { hours?: number; minutes: number; seconds: number }
  step?: number
}

export interface UndoAction {
  id: string
  type: 'archive' | 'restore' | 'advance' | 'mark_done' | 'import' | 'delete'
  timestamp: string
  payload: any
  description: string
}

export interface AppSettings {
  backup_reminder_frequency: 'never' | 'weekly' | 'monthly'
  last_backup_reminder?: string
}

export interface ImportPreview {
  new_markers: number
  new_rhythms: number
  updated_markers: number
  updated_rhythms: number
  conflicts: Array<{
    id: string
    title: string
    type: 'marker' | 'rhythm'
    reason: string
  }>
}
