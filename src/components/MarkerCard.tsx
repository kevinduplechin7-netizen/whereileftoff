import { BookOpen, Cross, FileText, PlayCircle, Hammer, GraduationCap, MoreHorizontal, Pin } from 'lucide-react'
import { Marker } from '../types'
import { formatTimestamp } from '../lib/utils'

const typeIcons = {
  book: BookOpen,
  bible: Cross,
  article: FileText,
  video: PlayCircle,
  project: Hammer,
  course: GraduationCap,
  other: MoreHorizontal,
}

interface MarkerCardProps {
  marker: Marker
  onClick: () => void
}

export function MarkerCard({ marker, onClick }: MarkerCardProps) {
  const Icon = typeIcons[marker.type]

  return (
    <button
      onClick={onClick}
      className="card text-left w-full relative group"
    >
      {marker.pinned && (
        <div className="absolute top-3 right-3">
          <Pin size={16} className="text-primary-600 fill-current" />
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary-50 rounded-lg shrink-0">
          <Icon size={20} className="text-primary-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-900 mb-1 pr-6">{marker.title}</h3>
          
          {marker.pointer && (
            <div className="text-primary-600 font-medium mb-1">
              {marker.pointer}
            </div>
          )}
          
          {marker.next_step && (
            <p className="text-sm text-neutral-600 mb-2">
              Next: {marker.next_step}
            </p>
          )}
          
          <div className="flex items-center gap-2 flex-wrap">
            {marker.group && (
              <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded">
                {marker.group}
              </span>
            )}
            
            {marker.tags.map(tag => (
              <span key={tag} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
            
            <span className="text-xs text-neutral-500 ml-auto">
              {formatTimestamp(marker.last_touched)}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}
