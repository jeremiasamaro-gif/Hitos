import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import type { ReactNode } from 'react'

interface WidgetContainerProps {
  id: string
  children: ReactNode
}

export function WidgetContainer({ id, children }: WidgetContainerProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <button
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-10 p-1 rounded hover:bg-hover text-secondary hover:text-primary cursor-grab active:cursor-grabbing transition-colors"
        title="Arrastrar para reordenar"
      >
        <GripVertical size={16} />
      </button>
      {children}
    </div>
  )
}
