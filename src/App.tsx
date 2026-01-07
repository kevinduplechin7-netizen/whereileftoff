import { useState, useEffect } from 'react'
import { AppProvider, useApp } from './contexts/AppContext'
import { Home } from './components/Home'
import { AddEditMarker } from './components/AddEditMarker'
import { MarkerDetail } from './components/MarkerDetail'
import { AddEditRhythm } from './components/AddEditRhythm'
import { RhythmDetail } from './components/RhythmDetail'
import { Search } from './components/Search'
import { Archive } from './components/Archive'
import { Settings } from './components/Settings'
import { AddModal } from './components/AddModal'
import { BottomNav } from './components/BottomNav'
import { Snackbar } from './components/Snackbar'
import { Marker, Rhythm } from './types'

type View = 'home' | 'search' | 'archive' | 'settings' | 'add-modal' | 'add-marker' | 'edit-marker' | 'marker-detail' | 'add-rhythm' | 'edit-rhythm' | 'rhythm-detail'

function AppContent() {
  const { loading } = useApp()
  const [view, setView] = useState<View>('home')
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null)
  const [selectedRhythm, setSelectedRhythm] = useState<Rhythm | null>(null)

  // Handle browser back button
  useEffect(() => {
    function handlePopState() {
      if (view !== 'home') {
        setView('home')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [view])

  // Push state for back button support
  useEffect(() => {
    if (view !== 'home') {
      window.history.pushState({ view }, '')
    }
  }, [view])

  function handleBack() {
    setView('home')
    setSelectedMarker(null)
    setSelectedRhythm(null)
  }

  function handleMarkerClick(marker: Marker) {
    setSelectedMarker(marker)
    setView('marker-detail')
  }

  function handleRhythmClick(rhythm: Rhythm) {
    setSelectedRhythm(rhythm)
    setView('rhythm-detail')
  }

  function handleNavigation(navView: 'home' | 'search' | 'archive' | 'settings') {
    setView(navView)
    setSelectedMarker(null)
    setSelectedRhythm(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Main Content */}
      {view === 'home' && (
        <Home
          onAddClick={() => setView('add-modal')}
          onSearchClick={() => setView('search')}
          onMarkerClick={handleMarkerClick}
          onRhythmClick={handleRhythmClick}
        />
      )}

      {view === 'search' && (
        <Search
          onBack={handleBack}
          onMarkerClick={handleMarkerClick}
          onRhythmClick={handleRhythmClick}
        />
      )}

      {view === 'archive' && (
        <Archive
          onBack={handleBack}
          onMarkerClick={handleMarkerClick}
          onRhythmClick={handleRhythmClick}
        />
      )}

      {view === 'settings' && (
        <Settings onBack={handleBack} />
      )}

      {view === 'add-marker' && (
        <AddEditMarker
          onBack={handleBack}
          onSaved={handleBack}
        />
      )}

      {view === 'edit-marker' && selectedMarker && (
        <AddEditMarker
          marker={selectedMarker}
          onBack={() => setView('marker-detail')}
          onSaved={() => {
            setView('home')
            setSelectedMarker(null)
          }}
        />
      )}

      {view === 'marker-detail' && selectedMarker && (
        <MarkerDetail
          marker={selectedMarker}
          onBack={handleBack}
          onEdit={() => setView('edit-marker')}
        />
      )}

      {view === 'add-rhythm' && (
        <AddEditRhythm
          onBack={handleBack}
          onSaved={handleBack}
        />
      )}

      {view === 'edit-rhythm' && selectedRhythm && (
        <AddEditRhythm
          rhythm={selectedRhythm}
          onBack={() => setView('rhythm-detail')}
          onSaved={() => {
            setView('home')
            setSelectedRhythm(null)
          }}
        />
      )}

      {view === 'rhythm-detail' && selectedRhythm && (
        <RhythmDetail
          rhythm={selectedRhythm}
          onBack={handleBack}
          onEdit={() => setView('edit-rhythm')}
        />
      )}

      {/* Add Modal */}
      {view === 'add-modal' && (
        <AddModal
          onClose={handleBack}
          onSelectMarker={() => setView('add-marker')}
          onSelectRhythm={() => setView('add-rhythm')}
        />
      )}

      {/* Bottom Navigation */}
      {['home', 'search', 'archive', 'settings'].includes(view) && (
        <BottomNav
          currentView={view as 'home' | 'search' | 'archive' | 'settings'}
          onNavigate={handleNavigation}
        />
      )}

      {/* Snackbar for Undo */}
      <Snackbar />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
