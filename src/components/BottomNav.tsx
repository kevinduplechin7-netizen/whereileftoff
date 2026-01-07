import { Home, Search, Archive, Settings } from 'lucide-react'

type NavView = 'home' | 'search' | 'archive' | 'settings'

interface BottomNavProps {
  currentView: NavView
  onNavigate: (view: NavView) => void
}

export function BottomNav({ currentView, onNavigate }: BottomNavProps) {
  const items: Array<{ id: NavView; icon: typeof Home; label: string }> = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'archive', icon: Archive, label: 'Archive' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-40">
      <div className="max-w-4xl mx-auto flex">
        {items.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              currentView === id
                ? 'text-primary-600'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Icon size={24} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
