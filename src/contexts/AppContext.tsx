import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Marker, Rhythm, UndoAction } from '../types'
import * as db from '../lib/db'
import { sampleMarkers, sampleRhythms } from '../lib/sampleData'

interface AppContextType {
  markers: Marker[]
  rhythms: Rhythm[]
  activeMarkers: Marker[]
  todaysRhythms: Rhythm[]
  archivedMarkers: Marker[]
  archivedRhythms: Rhythm[]
  loading: boolean
  undoAction: UndoAction | null
  refreshData: () => Promise<void>
  saveMarker: (marker: Marker) => Promise<void>
  deleteMarker: (id: string) => Promise<void>
  saveRhythm: (rhythm: Rhythm) => Promise<void>
  deleteRhythm: (id: string) => Promise<void>
  setUndoAction: (action: UndoAction | null) => void
  executeUndo: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const [markers, setMarkers] = useState<Marker[]>([])
  const [rhythms, setRhythms] = useState<Rhythm[]>([])
  const [activeMarkers, setActiveMarkers] = useState<Marker[]>([])
  const [todaysRhythms, setTodaysRhythms] = useState<Rhythm[]>([])
  const [archivedMarkers, setArchivedMarkers] = useState<Marker[]>([])
  const [archivedRhythms, setArchivedRhythms] = useState<Rhythm[]>([])
  const [loading, setLoading] = useState(true)
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null)

  useEffect(() => {
    initializeData()
  }, [])

  useEffect(() => {
    if (undoAction) {
      const timer = setTimeout(() => {
        setUndoAction(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [undoAction])

  async function initializeData() {
    try {
      const allMarkers = await db.getAllMarkers()
      const allRhythms = await db.getAllRhythms()

      // If no data, load sample data
      if (allMarkers.length === 0 && allRhythms.length === 0) {
        for (const marker of sampleMarkers) {
          await db.saveMarker(marker)
        }
        for (const rhythm of sampleRhythms) {
          await db.saveRhythm(rhythm)
        }
      }

      await refreshData()
    } catch (error) {
      console.error('Failed to initialize data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function refreshData() {
    const [allMarkers, allRhythms, active, todays, archivedM, archivedR] = await Promise.all([
      db.getAllMarkers(),
      db.getAllRhythms(),
      db.getActiveMarkers(),
      db.getTodaysRhythms(),
      db.getArchivedMarkers(),
      db.getArchivedRhythms(),
    ])

    setMarkers(allMarkers)
    setRhythms(allRhythms)
    setActiveMarkers(active)
    setTodaysRhythms(todays)
    setArchivedMarkers(archivedM)
    setArchivedRhythms(archivedR)
  }

  async function saveMarkerWrapped(marker: Marker) {
    await db.saveMarker(marker)
    await refreshData()
  }

  async function deleteMarkerWrapped(id: string) {
    await db.deleteMarker(id)
    await refreshData()
  }

  async function saveRhythmWrapped(rhythm: Rhythm) {
    await db.saveRhythm(rhythm)
    await refreshData()
  }

  async function deleteRhythmWrapped(id: string) {
    await db.deleteRhythm(id)
    await refreshData()
  }

  async function executeUndo() {
    if (!undoAction) return

    try {
      switch (undoAction.type) {
        case 'archive':
          if (undoAction.payload.itemType === 'marker') {
            const marker = undoAction.payload.item as Marker
            await db.saveMarker({ ...marker, archived: false })
          } else {
            const rhythm = undoAction.payload.item as Rhythm
            await db.saveRhythm({ ...rhythm, archived: false })
          }
          break

        case 'restore':
          if (undoAction.payload.itemType === 'marker') {
            const marker = undoAction.payload.item as Marker
            await db.saveMarker({ ...marker, archived: true })
          } else {
            const rhythm = undoAction.payload.item as Rhythm
            await db.saveRhythm({ ...rhythm, archived: true })
          }
          break

        case 'advance':
          const marker = undoAction.payload.original as Marker
          await db.saveMarker(marker)
          break

        case 'mark_done':
          const rhythm = undoAction.payload.original as Rhythm
          await db.saveRhythm(rhythm)
          break

        case 'delete':
          if (undoAction.payload.itemType === 'marker') {
            await db.saveMarker(undoAction.payload.item as Marker)
          } else {
            await db.saveRhythm(undoAction.payload.item as Rhythm)
          }
          break
      }

      await refreshData()
      setUndoAction(null)
    } catch (error) {
      console.error('Failed to undo:', error)
    }
  }

  return (
    <AppContext.Provider
      value={{
        markers,
        rhythms,
        activeMarkers,
        todaysRhythms,
        archivedMarkers,
        archivedRhythms,
        loading,
        undoAction,
        refreshData,
        saveMarker: saveMarkerWrapped,
        deleteMarker: deleteMarkerWrapped,
        saveRhythm: saveRhythmWrapped,
        deleteRhythm: deleteRhythmWrapped,
        setUndoAction,
        executeUndo,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
