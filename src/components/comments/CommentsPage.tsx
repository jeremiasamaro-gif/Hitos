import { useParams } from 'react-router-dom'
import { useBudgetStore } from '@/store/budgetStore'
import { Card } from '@/components/ui/Card'
import { CommentThread } from './CommentThread'
import { UnreadBadge } from './UnreadBadge'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function CommentsPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const items = useBudgetStore((s) => s.items)
  const parents = items.filter((i) => !i.parent_id)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (!projectId) return null

  return (
    <div>
      <h1 className="text-xl font-heading font-bold mb-6">Comentarios</h1>

      <div className="flex flex-col gap-3">
        {parents.map((item) => (
          <Card key={item.id} className="p-4">
            <button
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-heading font-semibold">{item.description}</span>
                <UnreadBadge entityId={item.id} />
              </div>
              <ChevronDown
                size={16}
                className={`text-secondary transition-transform ${expandedId === item.id ? 'rotate-180' : ''}`}
              />
            </button>

            {expandedId === item.id && (
              <div className="mt-4 pt-4 border-t border-border">
                <CommentThread projectId={projectId} budgetItemId={item.id} />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
