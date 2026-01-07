import { ArrowLeft, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Marker, MarkerType } from '../types'
import { generateId, parseTags, joinTags } from '../lib/utils'
import { parseMarkerInput } from '../lib/parser'
import { useApp } from '../contexts/AppContext'

interface AddEditMarkerProps {
  marker?: Marker
  onBack: () => void
  onSaved: () => void
}

const DRAFT_KEY = 'marker-draft'

export function AddEditMarker({ marker, onBack, onSaved }: AddEditMarkerProps) {
  const { saveMarker } = useApp()
  const isEditing = !!marker

  const [quickInput, setQuickInput] = useState('')
  const [title, setTitle] = useState(marker?.title || '')
  const [pointer, setPointer] = useState(marker?.pointer || '')
  const [nextStep, setNextStep] = useState(marker?.next_step || '')
  const [type, setType] = useState<MarkerType>(marker?.type || 'other')
  const [tags, setTags] = useState(marker ? joinTags(marker.tags) : '')
  const [group, setGroup] = useState(marker?.group || '')
  const [meetingNote, setMeetingNote] = useState(marker?.meeting_note || '')
  const [pinned, setPinned] = useState(marker?.pinned || false)
  const [showFields, setShowFields] = useState(isEditing)
  const [saving, setSaving] = useState(false)

  // Load draft
  useEffect(() => {
    if (!isEditing) {
      const draft = sessionStorage.getItem(DRAFT_KEY)
      if (draft) {
        try {
          const data = JSON.parse(draft)
          setQuickInput(data.quickInput || '')
          setTitle(data.title || '')
          setPointer(data.pointer || '')
          setNextStep(data.nextStep || '')
          setType(data.type || 'other')
          setTags(data.tags || '')
          setGroup(data.group || '')
          setMeetingNote(data.meetingNote || '')
          setPinned(data.pinned || false)
          setShowFields(data.showFields || false)
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
        quickInput,
        title,
        pointer,
        nextStep,
        type,
        tags,
        group,
        meetingNote,
        pinned,
        showFields,
      }
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    }
  }, [quickInput, title, pointer, nextStep, type, tags, group, meetingNote, pinned, showFields, isEditing])

  function handleQuickInputParse() {
    if (!quickInput.trim()) return

    const parsed = parseMarkerInput(quickInput)
    setTitle(parsed.title)
    setPointer(parsed.pointer)
    setNextStep(parsed.next_step)
    setShowFields(true)

    // Auto-detect type based on keywords
    const lower = quickInput.toLowerCase()
    if (lower.includes('bible') || lower.includes('gospel') || lower.includes('scripture')) {
      setType('bible')
    } else if (lower.includes('book')) {
      setType('book')
    } else if (lower.includes('video') || lower.includes('podcast')) {
      setType('video')
    } else if (lower.includes('course') || lower.includes('lesson')) {
      setType('course')
    } else if (lower.includes('article') || lower.includes('blog')) {
      setType('article')
    } else if (lower.includes('project') || lower.includes('diy')) {
      setType('project')
    }
  }

  async function handleSave() {
    if (!title.trim()) return

    setSaving(true)
    try {
      const markerData: Marker = {
        id: marker?.id || generateId(),
        title: title.trim(),
        pointer: pointer.trim(),
        next_step: nextStep.trim(),
        type,
        tags: parseTags(tags),
        group: group.trim() || undefined,
        meeting_note: meetingNote.trim() || undefined,
        pinned,
        archived: marker?.archived || false,
        created_at: marker?.created_at || new Date().toISOString(),
        last_touched: new Date().toISOString(),
      }

      await saveMarker(markerData)
      sessionStorage.removeItem(DRAFT_KEY)
      onSaved()
    } catch (error) {
      console.error('Failed to save marker:', error)
      alert('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleBack() {
    const hasChanges = title || pointer || nextStep || tags || group || meetingNote || quickInput
    if (hasChanges && !isEditing) {
      if (!confirm('Save as draft? Your work will be saved automatically.')) {
        sessionStorage.removeItem(DRAFT_KEY)
      }
    }
    onBack()
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={handleBack} className="p-2 hover:bg-neutral-100 rounded-lg">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">{isEditing ? 'Edit Marker' : 'Add Marker'}</h1>
      </div>

      {/* Quick Input */}
      {!showFields && !isEditing && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            What did you pause? (type naturally)
          </label>
          <textarea
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            onBlur={handleQuickInputParse}
            placeholder='Try: "Bible John 3:16 next: discuss love" or "Mere Christianity page 94 next: underline quote"'
            className="input-field resize-none h-24"
            autoFocus
          />
          <p className="text-sm text-neutral-500 mt-2">
            We'll parse this for you. You can edit everything below.
          </p>
        </div>
      )}

      {/* Structured Fields */}
      {showFields || isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Name of book, project, course, etc."
              className="input-field"
              autoFocus={isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Where you left off <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={pointer}
              onChange={(e) => setPointer(e.target.value)}
              placeholder='e.g., "page 94", "chapter 3 verse 16", "34:22"'
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Next step
            </label>
            <input
              type="text"
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              placeholder="What to do next (one line)"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MarkerType)}
              className="input-field"
            >
              <option value="other">Other</option>
              <option value="book">Book</option>
              <option value="bible">Bible</option>
              <option value="article">Article</option>
              <option value="video">Video/Podcast</option>
              <option value="project">Project</option>
              <option value="course">Course</option>
            </select>
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

          <div>
            <label className="block text-sm font-medium mb-2">
              Group (optional)
            </label>
            <input
              type="text"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              placeholder='e.g., "Tuesday Bible study"'
              className="input-field"
            />
          </div>

          {group && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Meeting note (optional)
              </label>
              <input
                type="text"
                value={meetingNote}
                onChange={(e) => setMeetingNote(e.target.value)}
                placeholder="One-line note for the group"
                className="input-field"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pinned"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="w-5 h-5 rounded border-neutral-300"
            />
            <label htmlFor="pinned" className="text-sm font-medium">
              Pin to top
            </label>
          </div>
        </div>
      ) : null}

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
