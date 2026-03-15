export default function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'timeline', label: 'Timeline', icon: '📅' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 flex safe-bottom">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors
            ${activeTab === tab.id ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)]'}`}
        >
          <span className="text-lg leading-none">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
