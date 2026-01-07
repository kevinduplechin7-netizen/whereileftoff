import { X } from 'lucide-react'
import { useApp } from '../contexts/AppContext'

export function Snackbar() {
  const { undoAction, executeUndo, setUndoAction } = useApp()

  if (!undoAction) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 slide-up">
      <div className="bg-neutral-900 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4 min-w-[320px]">
        <span className="flex-1">{undoAction.description}</span>
        <button
          onClick={executeUndo}
          className="font-semibold hover:underline"
        >
          Undo
        </button>
        <button
          onClick={() => setUndoAction(null)}
          className="p-1 hover:bg-neutral-800 rounded"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
