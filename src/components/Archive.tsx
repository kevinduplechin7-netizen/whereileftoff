import { ArrowLeft, RotateCcw } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { Marker, Rhythm } from '../types'
import { generateId, formatDate } from '../lib/utils'

interface ArchiveProps {
  onBack: () => void
  onMarkerClick: (marker: Marker) => void
  onRhythmClick: (rhythm: Rhythm) => void
}

export function Archive({ onBack, onMarkerClick, onRhythmClick }: ArchiveProps) {
  const { archivedMarkers, archivedRhythms, saveMarker, saveRhythm, setUndoAction } = useApp()

  async function handleRestoreMarker(marker: Marker) {
    const updated = { ...marker, archived: false }
    await saveMarker(updated)

    setUndoAction({
      id: generateId(),
      type: 'restore',
      timestamp: new Date().toISOString(),
      payload: { item: marker, itemType: 'marker' },
      description: 'Restored marker',
    })
  }

  async function handleRestoreRhythm(rhythm: Rhythm) {
    const updated = { ...rhythm, archived: false }
    await saveRhythm(updated)

    setUndoAction({
      id: generateId(),
      type: 'restore',
      timestamp: new Date().toISOString(),
      payload: { item: rhythm, itemType: 'rhythm' },
      description: 'Restored rhythm',
    })
  }

  const totalArchived = archivedMarkers.length + archivedRhythms.length

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-neutral-100 rounded-lg">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Archive</h1>
      </div>

      <div className="mb-4 text-sm text-neutral-600">
        {totalArchived} archived {totalArchived === 1 ? 'item' : 'items'}
      </div>

      {totalArchived === 0 ? (
        <div className="empty-state">
          <p>Your archive is empty</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Archived Markers */}
          {archivedMarkers.length > 0 && (
            <div>
              <h2 className="section-title">Markers</h2>
              <div className="space-y-3">
                {archivedMarkers.map(marker => (
                  <div key={marker.id} className="card flex items-start justify-between gap-3">
                    <button
                      onClick={() => onMarkerClick(marker)}
                      className="flex-1 text-left min-w-0"
                    >
                      <h3 className="font-semibold text-neutral-900 mb-1">{marker.title}</h3>
                      {marker.pointer && (
                        <p className="text-sm text-neutral-600 mb-1">{marker.pointer}</p>
                      )}
                      <p className="text-xs text-neutral-500">
                        Archived: {formatDate(marker.last_touched)}
                      </p>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRestoreMarker(marker)
                      }}
                      className="btn-ghost shrink-0 flex items-center gap-2"
                    >
                      <RotateCcw size={18} />
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Archived Rhythms */}
          {archivedRhythms.length > 0 && (
            <div>
              <h2 className="section-title">Rhythms</h2>
              <div className="space-y-3">
                {archivedRhythms.map(rhythm => (
                  <div key={rhythm.id} className="card flex items-start justify-between gap-3">
                    <button
                      onClick={() => onRhythmClick(rhythm)}
                      className="flex-1 text-left min-w-0"
                    >
                      <h3 className="font-semibold text-neutral-900 mb-1">{rhythm.title}</h3>
                      <p className="text-xs text-neutral-500">
                        Archived: {formatDate(rhythm.last_completed || rhythm.created_at)}
                      </p>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRestoreRhythm(rhythm)
                      }}
                      className="btn-ghost shrink-0 flex items-center gap-2"
                    >
                      <RotateCcw size={18} />
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
