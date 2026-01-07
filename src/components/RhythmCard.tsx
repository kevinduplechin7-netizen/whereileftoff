import { Clock, Check } from 'lucide-react'
import { Rhythm } from '../types'
import { formatSchedule, formatRelativeDate } from '../lib/scheduler'

interface RhythmCardProps {
  rhythm: Rhythm
  onMarkDone?: () => void
  onClick?: () => void
}

export function RhythmCard({ rhythm, onMarkDone, onClick }: RhythmCardProps) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <button
          onClick={onClick}
          className="flex-1 text-left min-w-0"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className="text-primary-600 shrink-0" />
            <h3 className="font-semibold text-neutral-900">{rhythm.title}</h3>
          </div>
          
          <p className="text-sm text-neutral-600 mb-1">
            {formatSchedule(rhythm.schedule)}
          </p>
          
          <p className="text-sm text-neutral-500">
            Next: {formatRelativeDate(new Date(rhythm.next_occurrence))}
          </p>
          
          {rhythm.tags.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {rhythm.tags.map(tag => (
                <span key={tag} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </button>
        
        {onMarkDone && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMarkDone()
            }}
            className="btn-ghost shrink-0 flex items-center gap-2"
          >
            <Check size={18} />
            Done
          </button>
        )}
      </div>
    </div>
  )
}
