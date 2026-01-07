import { ArrowLeft, Edit, Archive, Check } from 'lucide-react'
import { Rhythm } from '../types'
import { useApp } from '../contexts/AppContext'
import { generateId, formatDate } from '../lib/utils'
import { formatSchedule, formatRelativeDate, calculateNextOccurrence } from '../lib/scheduler'

interface RhythmDetailProps {
  rhythm: Rhythm
  onBack: () => void
  onEdit: () => void
}

export function RhythmDetail({ rhythm, onBack, onEdit }: RhythmDetailProps) {
  const { saveRhythm, setUndoAction } = useApp()

  async function handleMarkDone() {
    const original = { ...rhythm }
    const nextOccurrence = calculateNextOccurrence(rhythm.schedule, new Date())
    const updated = {
      ...rhythm,
      next_occurrence: nextOccurrence.toISOString(),
      last_completed: new Date().toISOString(),
    }

    await saveRhythm(updated)

    setUndoAction({
      id: generateId(),
      type: 'mark_done',
      timestamp: new Date().toISOString(),
      payload: { original, updated },
      description: 'Marked done',
    })
  }

  async function handleArchive() {
    const updated = { ...rhythm, archived: true }
    await saveRhythm(updated)

    setUndoAction({
      id: generateId(),
      type: 'archive',
      timestamp: new Date().toISOString(),
      payload: { item: rhythm, itemType: 'rhythm' },
      description: 'Archived rhythm',
    })

    onBack()
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-neutral-100 rounded-lg">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold flex-1 truncate">{rhythm.title}</h1>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Schedule */}
        <div>
          <label className="block text-sm font-medium text-neutral-500 mb-2">
            Schedule
          </label>
          <p className="text-lg text-neutral-900 mb-4">{formatSchedule(rhythm.schedule)}</p>
        </div>

        {/* Next Occurrence */}
        <div>
          <label className="block text-sm font-medium text-neutral-500 mb-2">
            Next occurrence
          </label>
          <p className="text-3xl font-bold text-primary-600 mb-2">
            {formatRelativeDate(new Date(rhythm.next_occurrence))}
          </p>
          <p className="text-sm text-neutral-500">
            {formatDate(rhythm.next_occurrence)}
          </p>
        </div>

        {/* Mark Done Button */}
        <div>
          <button
            onClick={handleMarkDone}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Check size={20} />
            Mark Done
          </button>
        </div>

        {/* Tags */}
        {rhythm.tags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-neutral-500 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {rhythm.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Last Completed */}
        {rhythm.last_completed && (
          <div className="border-t border-neutral-200 pt-4">
            <p className="text-sm text-neutral-500">
              Last completed: {formatDate(rhythm.last_completed)}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <button onClick={onEdit} className="btn-secondary w-full flex items-center justify-center gap-2">
            <Edit size={20} />
            Edit Details
          </button>

          <button
            onClick={handleArchive}
            className="btn-ghost w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50"
          >
            <Archive size={20} />
            Archive
          </button>
        </div>
      </div>
    </div>
  )
}
