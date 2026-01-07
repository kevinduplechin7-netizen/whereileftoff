import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Marker, Rhythm, UndoAction, AppSettings } from '../types'

interface WhereILeftOffDB extends DBSchema {
  markers: {
    key: string
    value: Marker
    indexes: {
      'by-last-touched': string
      'by-archived': number
      'by-pinned': number
    }
  }
  rhythms: {
    key: string
    value: Rhythm
    indexes: {
      'by-next-occurrence': string
      'by-archived': number
    }
  }
  undo_stack: {
    key: string
    value: UndoAction
    indexes: { 'by-timestamp': string }
  }
  settings: {
    key: string
    value: AppSettings
  }
}

let dbInstance: IDBPDatabase<WhereILeftOffDB> | null = null

export async function getDB(): Promise<IDBPDatabase<WhereILeftOffDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<WhereILeftOffDB>('where-i-left-off', 1, {
    upgrade(db) {
      // Markers store
      const markerStore = db.createObjectStore('markers', { keyPath: 'id' })
      markerStore.createIndex('by-last-touched', 'last_touched')
      markerStore.createIndex('by-archived', 'archived')
      markerStore.createIndex('by-pinned', 'pinned')

      // Rhythms store
      const rhythmStore = db.createObjectStore('rhythms', { keyPath: 'id' })
      rhythmStore.createIndex('by-next-occurrence', 'next_occurrence')
      rhythmStore.createIndex('by-archived', 'archived')

      // Undo stack
      const undoStore = db.createObjectStore('undo_stack', { keyPath: 'id' })
      undoStore.createIndex('by-timestamp', 'timestamp')

      // Settings
      db.createObjectStore('settings', { keyPath: 'key' })
    },
  })

  return dbInstance
}

// --- Markers ---

export async function getAllMarkers(): Promise<Marker[]> {
  const db = await getDB()
  return db.getAll('markers')
}

export async function getMarker(id: string): Promise<Marker | undefined> {
  const db = await getDB()
  return db.get('markers', id)
}

export async function saveMarker(marker: Marker): Promise<void> {
  const db = await getDB()
  await db.put('markers', marker)
}

export async function deleteMarker(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('markers', id)
}

export async function getActiveMarkers(): Promise<Marker[]> {
  const db = await getDB()
  const all = await db.getAllFromIndex('markers', 'by-archived', 0)
  return all.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return new Date(b.last_touched).getTime() - new Date(a.last_touched).getTime()
  })
}

export async function getArchivedMarkers(): Promise<Marker[]> {
  const db = await getDB()
  return db.getAllFromIndex('markers', 'by-archived', 1)
}

// --- Rhythms ---

export async function getAllRhythms(): Promise<Rhythm[]> {
  const db = await getDB()
  return db.getAll('rhythms')
}

export async function getRhythm(id: string): Promise<Rhythm | undefined> {
  const db = await getDB()
  return db.get('rhythms', id)
}

export async function saveRhythm(rhythm: Rhythm): Promise<void> {
  const db = await getDB()
  await db.put('rhythms', rhythm)
}

export async function deleteRhythm(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('rhythms', id)
}

export async function getActiveRhythms(): Promise<Rhythm[]> {
  const db = await getDB()
  return db.getAllFromIndex('rhythms', 'by-archived', 0)
}

export async function getArchivedRhythms(): Promise<Rhythm[]> {
  const db = await getDB()
  return db.getAllFromIndex('rhythms', 'by-archived', 1)
}

export async function getTodaysRhythms(): Promise<Rhythm[]> {
  const active = await getActiveRhythms()
  const now = new Date()
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  
  return active.filter(r => {
    const next = new Date(r.next_occurrence)
    return next <= todayEnd
  }).sort((a, b) => new Date(a.next_occurrence).getTime() - new Date(b.next_occurrence).getTime())
}

// --- Undo Stack ---

export async function addUndoAction(action: UndoAction): Promise<void> {
  const db = await getDB()
  await db.put('undo_stack', action)
  
  // Keep only last 20 undo actions
  const all = await db.getAllFromIndex('undo_stack', 'by-timestamp')
  if (all.length > 20) {
    const toDelete = all.slice(0, all.length - 20)
    for (const item of toDelete) {
      await db.delete('undo_stack', item.id)
    }
  }
}

export async function getLatestUndoAction(): Promise<UndoAction | undefined> {
  const db = await getDB()
  const all = await db.getAllFromIndex('undo_stack', 'by-timestamp')
  return all[all.length - 1]
}

export async function deleteUndoAction(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('undo_stack', id)
}

// --- Settings ---

export async function getSettings(): Promise<AppSettings> {
  const db = await getDB()
  const settings = await db.get('settings', 'app')
  return settings || { backup_reminder_frequency: 'monthly' }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDB()
  await db.put('settings', { ...settings, key: 'app' } as any)
}

// --- Import/Export ---

export async function exportAllData(): Promise<string> {
  const markers = await getAllMarkers()
  const rhythms = await getAllRhythms()
  const settings = await getSettings()
  
  return JSON.stringify({
    version: 1,
    exported_at: new Date().toISOString(),
    markers,
    rhythms,
    settings,
  }, null, 2)
}

export async function importData(jsonData: string): Promise<{ markers: number; rhythms: number }> {
  const data = JSON.parse(jsonData)
  
  if (!data.version || data.version !== 1) {
    throw new Error('Unsupported data format')
  }
  
  let markersImported = 0
  let rhythmsImported = 0
  
  // Import markers
  if (data.markers && Array.isArray(data.markers)) {
    for (const marker of data.markers) {
      await saveMarker(marker)
      markersImported++
    }
  }
  
  // Import rhythms
  if (data.rhythms && Array.isArray(data.rhythms)) {
    for (const rhythm of data.rhythms) {
      await saveRhythm(rhythm)
      rhythmsImported++
    }
  }
  
  // Import settings (merge, don't overwrite)
  if (data.settings) {
    const current = await getSettings()
    await saveSettings({ ...current, ...data.settings })
  }
  
  return { markers: markersImported, rhythms: rhythmsImported }
}

export async function clearAllData(): Promise<void> {
  const db = await getDB()
  await db.clear('markers')
  await db.clear('rhythms')
  await db.clear('undo_stack')
}
