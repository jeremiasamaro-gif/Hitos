import { X, RotateCcw } from 'lucide-react'
import { WIDGET_REGISTRY } from '@/lib/widgetRegistry'
import { Button } from '@/components/ui/Button'

interface WidgetCustomizerProps {
  open: boolean
  onClose: () => void
  activeWidgets: string[]
  onToggle: (widgetId: string) => void
  onReset: () => void
}

export function WidgetCustomizer({ open, onClose, activeWidgets, onToggle, onReset }: WidgetCustomizerProps) {
  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-80 bg-card border-l border-border z-50 flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-sm font-heading font-semibold">Personalizar dashboard</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-hover text-secondary hover:text-primary">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs text-secondary mb-4">
            Activa o desactiva los widgets que quieras ver en tu dashboard.
          </p>

          <div className="space-y-2">
            {WIDGET_REGISTRY.map((widget) => {
              const isActive = activeWidgets.includes(widget.id)
              return (
                <label
                  key={widget.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-hover/30 cursor-pointer transition-colors"
                >
                  <span className="text-sm text-primary">{widget.label}</span>
                  <div
                    className={`relative w-9 h-5 rounded-full transition-colors ${
                      isActive ? 'bg-accent' : 'bg-border'
                    }`}
                    onClick={() => onToggle(widget.id)}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        isActive ? 'translate-x-4' : ''
                      }`}
                    />
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <Button variant="ghost" size="sm" onClick={onReset} className="w-full">
            <RotateCcw size={14} />
            Restaurar por defecto
          </Button>
        </div>
      </div>
    </>
  )
}
