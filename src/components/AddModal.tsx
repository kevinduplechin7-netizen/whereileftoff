import { X, BookOpen, Clock } from 'lucide-react'

interface AddModalProps {
  onClose: () => void
  onSelectMarker: () => void
  onSelectRhythm: () => void
}

export function AddModal({ onClose, onSelectMarker, onSelectRhythm }: AddModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">What would you like to add?</h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={onSelectMarker}
            className="w-full p-4 border-2 border-neutral-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 rounded-lg">
                <BookOpen size={24} className="text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Marker</h3>
                <p className="text-sm text-neutral-600">
                  Remember where you left off in a book, project, or course
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={onSelectRhythm}
            className="w-full p-4 border-2 border-neutral-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Clock size={24} className="text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Rhythm</h3>
                <p className="text-sm text-neutral-600">
                  Set up a repeating reminder for routines and habits
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
