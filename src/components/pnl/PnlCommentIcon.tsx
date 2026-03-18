import { MessageSquare } from 'lucide-react'
import { useCommentStore } from '@/store/commentStore'

interface Props {
  budgetItemId: string
  onClick: () => void
}

export function PnlCommentIcon({ budgetItemId, onClick }: Props) {
  const count = useCommentStore((s) => s.getUnreadCount(budgetItemId))

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="p-1 text-secondary hover:text-accent transition-colors relative"
      title="Comentarios"
    >
      <MessageSquare size={14} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-status-exceeded text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}
