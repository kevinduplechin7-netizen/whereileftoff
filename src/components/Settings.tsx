import { ArrowLeft, Download, Upload, Trash2 } from 'lucide-react'
import { useState, useRef } from 'react'
import { exportAllData, importData, clearAllData } from '../lib/db'
import { downloadTextFile, readFileAsText } from '../lib/utils'
import { useApp } from '../contexts/AppContext'

interface SettingsProps {
  onBack: () => void
}

export function Settings({ onBack }: SettingsProps) {
  const { refreshData, markers, rhythms } = useApp()
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleExport() {
    setExporting(true)
    try {
      const jsonData = await exportAllData()
      const filename = `where-i-left-off-backup-${new Date().toISOString().split('T')[0]}.json`
      downloadTextFile(filename, jsonData)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  async function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const jsonText = await readFileAsText(file)
      const result = await importData(jsonText)
      await refreshData()
      alert(`Import successful!\nMarkers: ${result.markers}\nRhythms: ${result.rhythms}`)
    } catch (error) {
      console.error('Import failed:', error)
      alert('Import failed. Please check the file format and try again.')
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  async function handleClearAll() {
    const totalItems = markers.length + rhythms.length
    const confirmed = confirm(
      `This will permanently delete all ${totalItems} items (markers and rhythms). This cannot be undone. Are you sure?`
    )

    if (!confirmed) return

    const doubleConfirm = confirm('Really delete everything? This is your last chance to back out.')
    if (!doubleConfirm) return

    try {
      await clearAllData()
      await refreshData()
      alert('All data cleared')
    } catch (error) {
      console.error('Clear failed:', error)
      alert('Failed to clear data. Please try again.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-neutral-100 rounded-lg">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Data Management */}
      <div className="space-y-6">
        <div>
          <h2 className="section-title">Data Management</h2>

          <div className="space-y-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Download size={20} />
              {exporting ? 'Exporting...' : 'Export Data'}
            </button>

            <button
              onClick={handleImportClick}
              disabled={importing}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Upload size={20} />
              {importing ? 'Importing...' : 'Import Data'}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelected}
              className="hidden"
            />
          </div>

          <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-600">
              <strong>Tip:</strong> Export your data regularly to back up your markers and rhythms.
              You can import the file later to restore your data.
            </p>
          </div>
        </div>

        {/* Danger Zone */}
        <div>
          <h2 className="section-title text-red-600">Danger Zone</h2>

          <button
            onClick={handleClearAll}
            className="btn-ghost w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 border border-red-200"
          >
            <Trash2 size={20} />
            Clear All Data
          </button>

          <p className="text-sm text-neutral-500 mt-2">
            This will permanently delete all {markers.length + rhythms.length} items.
            Export first if you want to keep a backup.
          </p>
        </div>

        {/* About */}
        <div className="border-t border-neutral-200 pt-6">
          <h2 className="section-title">About</h2>
          <div className="space-y-2 text-sm text-neutral-600">
            <p><strong>Where I Left Off</strong> v1.0.0</p>
            <p>A tiny, trustworthy resume drawer for busy people.</p>
            <p className="pt-2">All data is stored locally on your device. No accounts, no cloud, no tracking.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
