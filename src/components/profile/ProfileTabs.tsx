export type ProfileTabKey = 'perfil' | 'configuracion' | 'seguridad'

interface ProfileTabsProps {
  activeTab: ProfileTabKey
  onChange: (tab: ProfileTabKey) => void
}

const TABS: { key: ProfileTabKey; label: string }[] = [
  { key: 'perfil', label: 'Mi Perfil' },
  { key: 'configuracion', label: 'Configuración' },
  { key: 'seguridad', label: 'Seguridad' },
]

export function ProfileTabs({ activeTab, onChange }: ProfileTabsProps) {
  return (
    <div className="flex gap-1 border-b border-border mb-6">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
            activeTab === tab.key
              ? 'text-accent'
              : 'text-secondary hover:text-primary'
          }`}
        >
          {tab.label}
          {activeTab === tab.key && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t" />
          )}
        </button>
      ))}
    </div>
  )
}
