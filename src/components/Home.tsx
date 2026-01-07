import { Plus, Search as SearchIcon } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { MarkerCard } from '../components/MarkerCard'
import { RhythmCard } from '../components/RhythmCard'
import { Marker, Rhythm } from '../types'
import { generateId } from '../lib/utils'
import { calculateNextOccurrence } from '../lib/scheduler'

interface HomeProps {
  onAddClick: () => void
  onSearchClick: () => void
  onMarkerClick: (marker: Marker) => void
  onRhythmClick: (rhythm: Rhythm) => void
}

export function Home({ onAddClick, onSearchClick, onMarkerClick, onRhythmClick }: HomeProps) {
  const { activeMarkers, todaysRhythms, saveRhythm, setUndoAction } = useApp()
  const [markingDone, setMarkingDone] = useState<string | null>(null)

  const displayMarkers = activeMarkers.slice(0, 8)

  async function handleMarkDone(rhythm: Rhythm) {
    if (markingDone) return
    
    setMarkingDone(rhythm.id)
    
    try {
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
    } catch (error) {
      console.error('Failed to mark done:', error)
    } finally {
      setMarkingDone(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">Where I Left Off</h1>
        
        <div className="flex gap-2">
          <button
            onClick={onSearchClick}
            className="input-field flex items-center gap-2 flex-1 text-left text-neutral-500"
          >
            <SearchIcon size={20} />
            Search markers and rhythms...
          </button>
          
          <button
            onClick={onAddClick}
            className="btn-primary flex items-center gap-2 shrink-0"
          >
            <Plus size={20} />
            Add
          </button>
        </div>
      </div>

      {/* Resume Next Section */}
      <section className="mb-8">
        <h2 className="section-title">Resume Next</h2>
        
        {displayMarkers.length === 0 ? (
          <div className="empty-state">
            <p className="mb-3">Nothing here yet</p>
            <button onClick={onAddClick} className="btn-primary">
              <Plus size={20} className="inline mr-2" />
              Add your first marker
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {displayMarkers.map(marker => (
              <MarkerCard
                key={marker.id}
                marker={marker}
                onClick={() => onMarkerClick(marker)}
              />
            ))}
            
            {activeMarkers.length > 8 && (
              <button onClick={onSearchClick} className="w-full text-center py-3 text-primary-600 font-medium hover:underline">
                View all {activeMarkers.length} markers →
              </button>
            )}
          </div>
        )}
      </section>

      {/* Today's Rhythms Section */}
      <section>
        <h2 className="section-title">Today's Rhythms</h2>
        
        {todaysRhythms.length === 0 ? (
          <div className="empty-state">
            <p>No rhythms due today. Relax! ☀️</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todaysRhythms.map(rhythm => (
              <RhythmCard
                key={rhythm.id}
                rhythm={rhythm}
                onMarkDone={() => handleMarkDone(rhythm)}
                onClick={() => onRhythmClick(rhythm)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
