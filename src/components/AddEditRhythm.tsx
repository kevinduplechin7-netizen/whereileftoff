import { ArrowLeft, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Rhythm, Schedule, ScheduleType } from '../types'
import { generateId, parseTags, joinTags } from '../lib/utils'
import { calculateNextOccurrence, formatSchedule } from '../lib/scheduler'
import { useApp } from '../contexts/AppContext'

interface AddEditRhythmProps {
  rhythm?: Rhythm
  onBack: () => void
  onSaved: () => void
}

const DRAFT_KEY = 'rhythm-draft'

export function AddEditRhythm({ rhythm, onBack, onSaved }: AddEditRhythmProps) {
  const { saveRhythm } = useApp()
  const isEditing = !!rhythm

  const [title, setTitle] = useState(rhythm?.title || '')
  const [scheduleType, setScheduleType] = useState<ScheduleType>(rhythm?.schedule.type || 'weekly')
  const [weekDays, setWeekDays] = useState<number[]>(rhythm?.schedule.days_of_week || [])
  const [monthDay, setMonthDay] = useState(rhythm?.schedule.day_of_month || 1)
  const [intervalDays, setIntervalDays] = useState(rhythm?.schedule.interval_days || 1)
  const [tags, setTags] = useState(rhythm ? joinTags(rhythm.tags) : '')
  const [saving, setSaving] = useState(false)

  // Load draft
  useEffect(() => {
    if (!isEditing) {
      const draft = sessionStorage.getItem(DRAFT_KEY)
      if (draft) {
        try {
          const data = JSON.parse(draft)
          setTitle(data.title || '')
          setScheduleType(data.scheduleType || 'weekly')
          setWeekDays(data.weekDays || [])
          setMonthDay(data.monthDay || 1)
          setIntervalDays(data.intervalDays || 1)
          setTags(data.tags || '')
        } catch (e) {
          // Ignore
        }
      }
    }
  }, [isEditing])

  // Auto-save draft
  useEffect(() => {
    if (!isEditing) {
      const draft = {
        title,
        scheduleType,
        weekDays,
        monthDay,
        intervalDays,
        tags,
      }
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    }
  }, [title, scheduleType, weekDays, monthDay, intervalDays, tags, isEditing])

  function toggleWeekDay(day: number) {
    if (weekDays.includes(day)) {
      setWeekDays(weekDays.filter(d => d !== day))
    } else {
      setWeekDays([...weekDays, day].sort((a, b) => a - b))
    }
  }

  function buildSchedule(): Schedule {
    switch (scheduleType) {
      case 'daily':
        return { type: 'daily' }
      case 'weekly':
        return { type: 'weekly', days_of_week: weekDays }
      case 'monthly':
        return { type: 'monthly', day_of_month: monthDay }
      case 'custom':
        return { type: 'custom', interval_days: intervalDays }
      default:
        return { type: 'daily' }
    }
  }

  async function handleSave() {
    if (!title.trim()) return
    if (scheduleType === 'weekly' && weekDays.length === 0) {
      alert('Please select at least one day of the week')
      return
    }

    setSaving(true)
    try {
      const schedule = buildSchedule()
      const nextOccurrence = calculateNextOccurrence(schedule)

      const rhythmData: Rhythm = {
        id: rhythm?.id || generateId(),
        title: title.trim(),
        schedule,
        next_occurrence: nextOccurrence.toISOString(),
        notification_enabled: rhythm?.notification_enabled || false,
        tags: parseTags(tags),
        archived: rhythm?.archived || false,
        created_at: rhythm?.created_at || new Date().toISOString(),
        last_completed: rhythm?.last_completed,
      }

      await saveRhythm(rhythmData)
      sessionStorage.removeItem(DRAFT_KEY)
      onSaved()
    } catch (error) {
      console.error('Failed to save rhythm:', error)
      alert('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleBack() {
    const hasChanges = title || tags
    if (hasChanges && !isEditing) {
      if (!confirm('Save as draft? Your work will be saved automatically.')) {
        sessionStorage.removeItem(DRAFT_KEY)
      }
    }
    onBack()
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={handleBack} className="p-2 hover:bg-neutral-100 rounded-lg">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">{isEditing ? 'Edit Rhythm' : 'Add Rhythm'}</h1>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='e.g., "Trash day", "Water plants"'
            className="input-field"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Schedule</label>
          <select
            value={scheduleType}
            onChange={(e) => setScheduleType(e.target.value as ScheduleType)}
            className="input-field mb-4"
          >
            <option value="daily">Every day</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom interval</option>
          </select>

          {/* Weekly: Select days */}
          {scheduleType === 'weekly' && (
            <div>
              <p className="text-sm text-neutral-600 mb-3">Select days:</p>
              <div className="flex flex-wrap gap-2">
                {dayNames.map((name, index) => (
                  <button
                    key={index}
                    onClick={() => toggleWeekDay(index)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      weekDays.includes(index)
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Monthly: Select day */}
          {scheduleType === 'monthly' && (
            <div>
              <label className="block text-sm text-neutral-600 mb-2">Day of month:</label>
              <input
                type="number"
                min="1"
                max="31"
                value={monthDay}
                onChange={(e) => setMonthDay(parseInt(e.target.value) || 1)}
                className="input-field"
              />
            </div>
          )}

          {/* Custom: Interval */}
          {scheduleType === 'custom' && (
            <div>
              <label className="block text-sm text-neutral-600 mb-2">Repeat every:</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={intervalDays}
                  onChange={(e) => setIntervalDays(parseInt(e.target.value) || 1)}
                  className="input-field w-24"
                />
                <span className="text-neutral-700">days</span>
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-600">Schedule preview:</p>
            <p className="font-medium text-neutral-900">{formatSchedule(buildSchedule())}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Tags (optional)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="comma, separated, tags"
            className="input-field"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-neutral-200">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
