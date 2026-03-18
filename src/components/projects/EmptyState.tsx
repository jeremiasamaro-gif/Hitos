import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface EmptyStateProps {
  onCreateProject: () => void
}

export function EmptyState({ onCreateProject }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Building icon */}
      <svg
        className="w-20 h-20 text-border mb-6"
        viewBox="0 0 80 80"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="12" y="20" width="24" height="48" rx="2" />
        <rect x="44" y="32" width="24" height="36" rx="2" />
        <line x1="20" y1="30" x2="28" y2="30" />
        <line x1="20" y1="38" x2="28" y2="38" />
        <line x1="20" y1="46" x2="28" y2="46" />
        <line x1="20" y1="54" x2="28" y2="54" />
        <line x1="52" y1="42" x2="60" y2="42" />
        <line x1="52" y1="50" x2="60" y2="50" />
        <line x1="52" y1="58" x2="60" y2="58" />
        <line x1="0" y1="68" x2="80" y2="68" />
        <polygon points="24,20 24,8 36,14 36,20" />
      </svg>

      <h2 className="text-lg font-heading font-semibold text-primary mb-2">
        Todavía no tenés proyectos
      </h2>
      <p className="text-sm text-secondary mb-6 max-w-xs">
        Creá tu primer proyecto para empezar a gestionar tu obra
      </p>

      <Button onClick={onCreateProject}>
        <Plus size={16} /> Nuevo proyecto
      </Button>
    </div>
  )
}
