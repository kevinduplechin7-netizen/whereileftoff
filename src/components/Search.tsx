import { ArrowLeft, Search as SearchIcon, X } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useApp } from '../contexts/AppContext'
import { MarkerCard } from './MarkerCard'
import { RhythmCard } from './RhythmCard'
import { Marker, Rhythm, MarkerType } from '../types'

interface SearchProps {
  onBack: () => void
  onMarkerClick: (marker: Marker) => void
  onRhythmClick: (rhythm: Rhythm) => void
}

export function Search({ onBack, onMarkerClick, onRhythmClick }: SearchProps) {
  const { markers, rhythms } = useApp()
  const [query, setQuery] = useState('')
  const [filterType, setFilterType] = useState<MarkerType | 'all'>('all')
  const [filterPinned, setFilterPinned] = useState(false)

  const filteredResults = useMemo(() => {
    const lowerQuery = query.toLowerCase()

    let filteredMarkers = markers.filter(m => !m.archived)
    let filteredRhythms = rhythms.filter(r => !r.archived)

    // Text search
    if (query) {
      filteredMarkers = filteredMarkers.filter(m =>
        m.title.toLowerCase().includes(lowerQuery) ||
        m.pointer.toLowerCase().includes(lowerQuery) ||
        m.next_step.toLowerCase().includes(lowerQuery) ||
        m.tags.some(t => t.toLowerCase().includes(lowerQuery))
      )

      filteredRhythms = filteredRhythms.filter(r =>
        r.title.toLowerCase().includes(lowerQuery) ||
        r.tags.some(t => t.toLowerCase().includes(lowerQuery))
      )
    }

    // Type filter
    if (filterType !== 'all') {
      filteredMarkers = filteredMarkers.filter(m => m.type === filterType)
    }

    // Pinned filter
    if (filterPinned) {
      filteredMarkers = filteredMarkers.filter(m => m.pinned)
    }

    return {
      markers: filteredMarkers,
      rhythms: filteredRhythms,
    }
  }, [markers, rhythms, query, filterType, filterPinned])

  const totalResults = filteredResults.markers.length + filteredResults.rhythms.length

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-neutral-100 rounded-lg">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Search</h1>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, pointer, tags..."
          className="input-field pl-12 pr-12"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterPinned(!filterPinned)}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filterPinned
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          Pinned
        </button>

        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filterType === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          All
        </button>

        {(['book', 'bible', 'article', 'video', 'project', 'course', 'other'] as MarkerType[]).map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap capitalize transition-colors ${
              filterType === type
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="mb-4 text-sm text-neutral-600">
        {totalResults} {totalResults === 1 ? 'result' : 'results'}
      </div>

      {totalResults === 0 ? (
        <div className="empty-state">
          <p>No matches found</p>
          {query && <p className="text-sm mt-2">Try different keywords</p>}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Markers */}
          {filteredResults.markers.length > 0 && (
            <div>
              <h2 className="section-title">Markers</h2>
              <div className="space-y-3">
                {filteredResults.markers.map(marker => (
                  <MarkerCard
                    key={marker.id}
                    marker={marker}
                    onClick={() => onMarkerClick(marker)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Rhythms */}
          {filteredResults.rhythms.length > 0 && (
            <div>
              <h2 className="section-title">Rhythms</h2>
              <div className="space-y-3">
                {filteredResults.rhythms.map(rhythm => (
                  <RhythmCard
                    key={rhythm.id}
                    rhythm={rhythm}
                    onClick={() => onRhythmClick(rhythm)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
