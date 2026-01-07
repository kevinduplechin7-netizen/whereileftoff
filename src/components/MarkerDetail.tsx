import { ArrowLeft, Edit, Archive, Pin, PinOff } from 'lucide-react'
import { Marker } from '../types'
import { useApp } from '../contexts/AppContext'
import { generateId, formatTimestamp } from '../lib/utils'
import { parsePointerString, advancePointer } from '../lib/parser'

interface MarkerDetailProps {
  marker: Marker
  onBack: () => void
  onEdit: () => void
}

export function MarkerDetail({ marker, onBack, onEdit }: MarkerDetailProps) {
  const { saveMarker, setUndoAction } = useApp()
  const parsed = parsePointerString(marker.pointer)

  async function handleAdvance(amount: number) {
    const newPointer = advancePointer(marker.pointer, amount)
    if (!newPointer) return

    const original = { ...marker }
    const updated = {
      ...marker,
      pointer: newPointer,
      last_touched: new Date().toISOString(),
    }

    await saveMarker(updated)

    setUndoAction({
      id: generateId(),
      type: 'advance',
      timestamp: new Date().toISOString(),
      payload: { original, updated },
      description: `Advanced to ${newPointer}`,
    })
  }

  async function handleTogglePin() {
    const updated = { ...marker, pinned: !marker.pinned }
    await saveMarker(updated)
  }

  async function handleArchive() {
    const updated = { ...marker, archived: true }
    await saveMarker(updated)

    setUndoAction({
      id: generateId(),
      type: 'archive',
      timestamp: new Date().toISOString(),
      payload: { item: marker, itemType: 'marker' },
      description: 'Archived marker',
    })

    onBack()
  }

  function renderAdvanceButtons() {
    switch (parsed.type) {
      case 'page':
        return (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleAdvance(1)} className="btn-secondary flex-1">
              +1 page
            </button>
            <button onClick={() => handleAdvance(5)} className="btn-secondary flex-1">
              +5 pages
            </button>
            <button onClick={onEdit} className="btn-ghost">
              Edit pointer
            </button>
          </div>
        )

      case 'chapter':
        return (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleAdvance(1)} className="btn-secondary flex-1">
              Next chapter
            </button>
            <button onClick={onEdit} className="btn-ghost">
              Edit pointer
            </button>
          </div>
        )

      case 'verse':
        return (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleAdvance(1)} className="btn-secondary flex-1">
              Next verse
            </button>
            <button onClick={() => handleAdvance(5)} className="btn-secondary flex-1">
              +5 verses
            </button>
            <button onClick={onEdit} className="btn-ghost">
              Edit pointer
            </button>
          </div>
        )

      case 'chapter_verse':
        return (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleAdvance(1)} className="btn-secondary flex-1">
              Next verse
            </button>
            <button onClick={() => handleAdvance(5)} className="btn-secondary flex-1">
              +5 verses
            </button>
            <button onClick={onEdit} className="btn-ghost">
              Edit pointer
            </button>
          </div>
        )

      case 'timestamp':
        return (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleAdvance(30)} className="btn-secondary flex-1">
              +30s
            </button>
            <button onClick={() => handleAdvance(60)} className="btn-secondary flex-1">
              +1m
            </button>
            <button onClick={() => handleAdvance(300)} className="btn-secondary flex-1">
              +5m
            </button>
            <button onClick={onEdit} className="btn-ghost">
              Edit pointer
            </button>
          </div>
        )

      case 'step':
        return (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleAdvance(1)} className="btn-secondary flex-1">
              Next step
            </button>
            <button onClick={onEdit} className="btn-ghost">
              Edit pointer
            </button>
          </div>
        )

      default:
        return (
          <button onClick={onEdit} className="btn-secondary w-full">
            Edit pointer
          </button>
        )
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-neutral-100 rounded-lg">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold flex-1 truncate">{marker.title}</h1>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Type Badge */}
        <div>
          <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium capitalize">
            {marker.type}
          </span>
        </div>

        {/* Pointer */}
        <div>
          <label className="block text-sm font-medium text-neutral-500 mb-2">
            Where you left off
          </label>
          <div className="text-3xl font-bold text-primary-600 mb-4">
            {marker.pointer}
          </div>
          {renderAdvanceButtons()}
        </div>

        {/* Next Step */}
        {marker.next_step && (
          <div>
            <label className="block text-sm font-medium text-neutral-500 mb-2">
              Next step
            </label>
            <p className="text-lg text-neutral-900">{marker.next_step}</p>
          </div>
        )}

        {/* Group Info */}
        {marker.group && (
          <div>
            <label className="block text-sm font-medium text-neutral-500 mb-2">
              Group
            </label>
            <p className="text-lg text-neutral-900">{marker.group}</p>
            {marker.meeting_note && (
              <p className="text-sm text-neutral-600 mt-1">{marker.meeting_note}</p>
            )}
          </div>
        )}

        {/* Tags */}
        {marker.tags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-neutral-500 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {marker.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="border-t border-neutral-200 pt-4">
          <p className="text-sm text-neutral-500">
            Last touched: {formatTimestamp(marker.last_touched)}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <button onClick={onEdit} className="btn-secondary w-full flex items-center justify-center gap-2">
            <Edit size={20} />
            Edit Details
          </button>

          <button
            onClick={handleTogglePin}
            className="btn-ghost w-full flex items-center justify-center gap-2"
          >
            {marker.pinned ? <PinOff size={20} /> : <Pin size={20} />}
            {marker.pinned ? 'Unpin' : 'Pin to Top'}
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
